const crypto = require('crypto');
const path = require('path');
const File = require('../models/File');
const User = require('../models/User');
const storageService = require('../services/storage/storageService');
const { sanitizeFilename, validateFileType, validateFileSize } = require('../utils/fileValidator');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Upload single or multiple files
 * Enforces per-file size limits and overall user storage quota
 */
const uploadFiles = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return sendError(res, 'No files were provided for upload.', 400);
    }

    // 1. Calculate total size of all incoming files
    const totalUploadSize = files.reduce((sum, file) => sum + file.size, 0);

    // 2. Fetch fresh user storage data
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 'User account not found.', 404);
    }

    // 3. Validate user storage quota
    if (user.storageUsed + totalUploadSize > user.storageLimit) {
      const remainingBytes = Math.max(0, user.storageLimit - user.storageUsed);
      const remainingMiB = (remainingBytes / (1024 * 1024)).toFixed(2);
      const neededMiB = (totalUploadSize / (1024 * 1024)).toFixed(2);

      return sendError(
        res,
        `Not enough storage space. You have ${remainingMiB} MiB remaining, but attempted to upload ${neededMiB} MiB.`,
        400,
        { remainingBytes, neededBytes: totalUploadSize }
      );
    }

    // 4. Validate each file before doing any uploads
    for (const file of files) {
      const sizeValidation = validateFileSize(file.size);
      if (!sizeValidation.isValid) {
        return sendError(res, `${file.originalname}: ${sizeValidation.error}`, 400);
      }

      const typeValidation = validateFileType(file.originalname, file.mimetype);
      if (!typeValidation.isValid) {
        return sendError(res, `${file.originalname}: ${typeValidation.error}`, 400);
      }
    }

    // 5. Perform uploads and create database records
    const uploadedRecords = [];
    let successfulBytes = 0;

    for (const file of files) {
      const sanitizedName = sanitizeFilename(file.originalname);
      const ext = path.extname(sanitizedName).toLowerCase();
      const uniqueId = crypto.randomUUID();
      const storageKey = `users/${user._id}/${uniqueId}${ext}`;

      // Upload to object storage provider (Cloudflare R2 or Local)
      await storageService.upload(file.buffer, storageKey, file.mimetype);

      // Create MongoDB file metadata record
      const fileRecord = await File.create({
        userId: user._id,
        originalName: sanitizedName,
        storageKey,
        mimeType: file.mimetype || 'application/octet-stream',
        size: file.size
      });

      uploadedRecords.push(fileRecord);
      successfulBytes += file.size;
    }

    // 6. Atomically increment user's storage usage
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $inc: { storageUsed: successfulBytes } },
      { new: true }
    );

    return sendSuccess(res, {
      files: uploadedRecords,
      storageUsed: updatedUser.storageUsed,
      storageLimit: updatedUser.storageLimit
    }, `Successfully uploaded ${uploadedRecords.length} file(s).`, 201);

  } catch (error) {
    next(error);
  }
};

/**
 * Get all files belonging to authenticated user
 * Supports server-side search and multi-criteria sorting
 */
const getFiles = async (req, res, next) => {
  try {
    const { search, sort = 'date_desc', starred } = req.query;

    // Strict ownership filter: strictly authenticated user's ID
    const filter = { userId: req.user._id };

    if (starred === 'true') {
      filter.isStarred = true;
    }

    if (search && search.trim()) {
      filter.originalName = { $regex: search.trim(), $options: 'i' };
    }

    // Sort order mapping
    const sortMap = {
      name_asc: { originalName: 1 },
      name_desc: { originalName: -1 },
      date_desc: { createdAt: -1 },
      date_asc: { createdAt: 1 },
      size_desc: { size: -1 },
      size_asc: { size: 1 },
      type_asc: { mimeType: 1 }
    };

    const sortOption = sortMap[sort] || { createdAt: -1 };

    const files = await File.find(filter).sort(sortOption);
    const totalFiles = await File.countDocuments({ userId: req.user._id });

    // Ensure storage numbers are up to date
    const freshUser = await User.findById(req.user._id);

    return sendSuccess(res, {
      files,
      totalFiles,
      storageUsed: freshUser.storageUsed,
      storageLimit: freshUser.storageLimit
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get single file metadata (with strict ownership check)
 */
const getFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!file) {
      return sendError(res, 'File not found.', 404);
    }

    return sendSuccess(res, { file });
  } catch (error) {
    next(error);
  }
};

/**
 * Download a file securely with strict ownership check and Cache-Control headers
 * Supports inline viewing for in-app previews (images, pdfs, text)
 */
const downloadFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!file) {
      return sendError(res, 'File not found.', 404);
    }

    // University public computer hardening: prevent browser/proxy disk caching of academic files
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Support inline viewing for previewing files in browser without forced download
    const isInline = req.query.inline === 'true' || req.query.view === 'true';
    const dispositionType = isInline ? 'inline' : 'attachment';

    res.setHeader('Content-Disposition', `${dispositionType}; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', file.size);

    const stream = await storageService.downloadStream(file.storageKey);
    stream.pipe(res);

  } catch (error) {
    next(error);
  }
};

/**
 * Rename a file (updates metadata only, avoids expensive storage moving)
 */
const renameFile = async (req, res, next) => {
  try {
    const { newName } = req.body;

    if (!newName || !newName.trim()) {
      return sendError(res, 'New filename is required.', 400);
    }

    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!file) {
      return sendError(res, 'File not found.', 404);
    }

    let sanitized = sanitizeFilename(newName.trim());

    // Preserve original extension if user didn't specify one
    const originalExt = path.extname(file.originalName).toLowerCase();
    const newExt = path.extname(sanitized).toLowerCase();

    if (!newExt && originalExt) {
      sanitized += originalExt;
    }

    file.originalName = sanitized;
    await file.save();

    return sendSuccess(res, { file }, 'File renamed successfully.');

  } catch (error) {
    next(error);
  }
};

/**
 * Delete a file permanently from storage and database
 */
const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!file) {
      return sendError(res, 'File not found.', 404);
    }

    // 1. Delete physical object from storage provider
    await storageService.delete(file.storageKey);

    // 2. Remove file document from MongoDB
    await File.deleteOne({ _id: file._id });

    // 3. Atomically decrement user's storage usage
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { storageUsed: -file.size } },
      { new: true }
    );

    // Safety check: ensure storageUsed is never negative
    if (updatedUser.storageUsed < 0) {
      updatedUser.storageUsed = 0;
      await updatedUser.save();
    }

    return sendSuccess(res, {
      fileId: file._id,
      storageUsed: updatedUser.storageUsed,
      storageLimit: updatedUser.storageLimit
    }, 'File deleted permanently.');

  } catch (error) {
    next(error);
  }
};

/**
 * Toggle favorite/starred status of a file
 */
const toggleStar = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!file) {
      return sendError(res, 'File not found.', 404);
    }

    file.isStarred = !file.isStarred;
    await file.save();

    return sendSuccess(res, { file }, file.isStarred ? 'File marked as starred.' : 'File unstarred.');
  } catch (error) {
    next(error);
  }
};

/**
 * Batch delete multiple files in a single atomic transaction
 */
const batchDelete = async (req, res, next) => {
  try {
    const { fileIds } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return sendError(res, 'No file IDs provided for deletion.', 400);
    }

    const files = await File.find({
      _id: { $in: fileIds },
      userId: req.user._id
    });

    if (files.length === 0) {
      return sendError(res, 'No matching files found.', 404);
    }

    let totalReclaimedBytes = 0;
    for (const file of files) {
      await storageService.delete(file.storageKey);
      totalReclaimedBytes += file.size;
    }

    await File.deleteMany({ _id: { $in: files.map(f => f._id) } });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { storageUsed: -totalReclaimedBytes } },
      { new: true }
    );

    if (updatedUser.storageUsed < 0) {
      updatedUser.storageUsed = 0;
      await updatedUser.save();
    }

    return sendSuccess(res, {
      deletedCount: files.length,
      deletedIds: files.map(f => f._id),
      storageUsed: updatedUser.storageUsed,
      storageLimit: updatedUser.storageLimit
    }, `Successfully deleted ${files.length} file(s).`);

  } catch (error) {
    next(error);
  }
};

/**
 * Get storage breakdown by academic category
 */
const getStorageStats = async (req, res, next) => {
  try {
    const files = await File.find({ userId: req.user._id });

    const breakdown = {
      documents: { count: 0, bytes: 0, label: 'Documents' },
      images: { count: 0, bytes: 0, label: 'Images' },
      spreadsheets: { count: 0, bytes: 0, label: 'Spreadsheets' },
      presentations: { count: 0, bytes: 0, label: 'Presentations' },
      archives: { count: 0, bytes: 0, label: 'Archives' },
      other: { count: 0, bytes: 0, label: 'Other' }
    };

    for (const file of files) {
      const ext = path.extname(file.originalName).toLowerCase();
      if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) {
        breakdown.documents.count += 1;
        breakdown.documents.bytes += file.size;
      } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        breakdown.images.count += 1;
        breakdown.images.bytes += file.size;
      } else if (['.xls', '.xlsx'].includes(ext)) {
        breakdown.spreadsheets.count += 1;
        breakdown.spreadsheets.bytes += file.size;
      } else if (['.ppt', '.pptx'].includes(ext)) {
        breakdown.presentations.count += 1;
        breakdown.presentations.bytes += file.size;
      } else if (['.zip', '.rar', '.7z'].includes(ext)) {
        breakdown.archives.count += 1;
        breakdown.archives.bytes += file.size;
      } else {
        breakdown.other.count += 1;
        breakdown.other.bytes += file.size;
      }
    }

    const freshUser = await User.findById(req.user._id);

    return sendSuccess(res, {
      breakdown,
      storageUsed: freshUser.storageUsed,
      storageLimit: freshUser.storageLimit,
      totalFiles: files.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFiles,
  getFiles,
  getFile,
  downloadFile,
  renameFile,
  deleteFile,
  toggleStar,
  batchDelete,
  getStorageStats
};

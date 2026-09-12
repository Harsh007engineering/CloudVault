const crypto = require('crypto');
const User = require('../models/User');
const File = require('../models/File');
const { hashPassword } = require('../utils/hash');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get system-wide metrics for administrator dashboard
 */
const getMetrics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFiles = await File.countDocuments();

    // Aggregate total storage used across all files
    const storageStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalStorageUsed: { $sum: '$storageUsed' },
          totalStorageLimit: { $sum: '$storageLimit' }
        }
      }
    ]);

    const stats = storageStats[0] || { totalStorageUsed: 0, totalStorageLimit: 0 };

    return sendSuccess(res, {
      totalUsers,
      totalFiles,
      totalStorageUsed: stats.totalStorageUsed,
      totalStorageLimit: stats.totalStorageLimit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all users with pagination, search, storage usage, and file counts
 */
const getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (search && search.trim()) {
      filter.username = { $regex: search.trim(), $options: 'i' };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const users = await User.find(filter)
      .select('-recoveryCodes -passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await User.countDocuments(filter);

    // Compute file counts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const fileCount = await File.countDocuments({ userId: u._id });
        return {
          ...u.toJSON(),
          fileCount
        };
      })
    );

    return sendSuccess(res, {
      users: usersWithCounts,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user account status (active / disabled)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'disabled'].includes(status)) {
      return sendError(res, 'Status must be either "active" or "disabled".', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    // Prevent admin from disabling their own account
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'You cannot disable your own administrator account.', 400);
    }

    user.accountStatus = status;
    await user.save();

    return sendSuccess(res, { user: user.toJSON() }, `User status updated to ${status}.`);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user storage quota limit
 */
const updateUserQuota = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { storageLimitBytes } = req.body;

    const limit = parseInt(storageLimitBytes, 10);
    if (isNaN(limit) || limit < 1048576) { // Minimum 1 MiB
      return sendError(res, 'Storage limit must be a valid number of at least 1 MiB (1048576 bytes).', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    user.storageLimit = limit;
    await user.save();

    return sendSuccess(res, {
      user: user.toJSON()
    }, `Storage limit updated to ${(limit / (1024 * 1024)).toFixed(2)} MiB.`);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin account recovery: generates a secure temporary password
 * Never displays existing passwords! Sets forcePasswordChange = true.
 */
const generateTemporaryPassword = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    // Generate random secure temporary password
    const temporaryPassword = `Temp-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    user.passwordHash = await hashPassword(temporaryPassword);
    user.forcePasswordChange = true;
    await user.save();

    return sendSuccess(res, {
      username: user.username,
      temporaryPassword
    }, 'Temporary password generated. The student must change it upon their next login.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMetrics,
  getUsers,
  updateUserStatus,
  updateUserQuota,
  generateTemporaryPassword
};

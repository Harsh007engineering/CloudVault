const path = require('path');
const config = require('../config/env');

// Supported extensions and their expected MIME types
const SUPPORTED_TYPES = {
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.txt': ['text/plain', 'application/octet-stream'],
  '.ppt': ['application/vnd.ms-powerpoint'],
  '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.zip': ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'],
  // Code & Laboratory Assignment Formats
  '.py': ['text/plain', 'text/x-python', 'application/octet-stream'],
  '.java': ['text/plain', 'text/x-java-source', 'application/octet-stream'],
  '.cpp': ['text/plain', 'text/x-c', 'application/octet-stream'],
  '.c': ['text/plain', 'text/x-c', 'application/octet-stream'],
  '.cs': ['text/plain', 'application/octet-stream'],
  '.js': ['text/plain', 'application/javascript', 'text/javascript', 'application/octet-stream'],
  '.jsx': ['text/plain', 'application/javascript', 'text/javascript', 'application/octet-stream'],
  '.ts': ['text/plain', 'application/x-typescript', 'application/octet-stream'],
  '.tsx': ['text/plain', 'application/x-typescript', 'application/octet-stream'],
  '.html': ['text/plain', 'text/html', 'application/octet-stream'],
  '.css': ['text/plain', 'text/css', 'application/octet-stream'],
  '.json': ['text/plain', 'application/json', 'application/octet-stream'],
  '.sql': ['text/plain', 'application/sql', 'application/octet-stream'],
  '.sh': ['text/plain', 'application/x-sh', 'application/octet-stream'],
  '.md': ['text/plain', 'text/markdown', 'application/octet-stream']
};

/**
 * Sanitizes user-provided filenames to prevent path traversal and shell injection
 */
const sanitizeFilename = (filename) => {
  if (!filename) return 'unnamed_file';
  // Strip null bytes and directory traversal indicators
  let clean = filename.replace(/\0/g, '').replace(/[/\\?%*:|"<>]/g, '_').trim();
  // Strip leading dots
  clean = clean.replace(/^\.+/, '');
  if (clean.length === 0) clean = 'file';
  // Limit length
  if (clean.length > 200) {
    const ext = path.extname(clean);
    clean = clean.substring(0, 190) + ext;
  }
  return clean;
};

/**
 * Validates file extension and MIME type against allowed university formats
 */
const validateFileType = (filename, mimeType) => {
  const ext = path.extname(filename).toLowerCase();

  if (!SUPPORTED_TYPES[ext]) {
    return {
      isValid: false,
      error: `File type "${ext || 'unknown'}" is not supported. Allowed formats: PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX, JPG, PNG, ZIP.`
    };
  }

  // Check MIME compatibility (allow generic application/octet-stream if extension matches)
  const allowedMimes = SUPPORTED_TYPES[ext];
  if (mimeType && mimeType !== 'application/octet-stream' && !allowedMimes.includes(mimeType)) {
    // If browser supplied different mime, double-check extension
    console.warn(`[FileValidator] Warning: MIME ${mimeType} differs from expected ${allowedMimes[0]} for ${ext}`);
  }

  return { isValid: true, ext };
};

/**
 * Validates individual file size against 25 MiB limit
 */
const validateFileSize = (sizeBytes) => {
  if (sizeBytes > config.maxFileSize) {
    const maxMb = Math.round(config.maxFileSize / (1024 * 1024));
    return {
      isValid: false,
      error: `File exceeds the maximum individual file size limit of ${maxMb} MiB.`
    };
  }
  return { isValid: true };
};

module.exports = {
  SUPPORTED_TYPES,
  sanitizeFilename,
  validateFileType,
  validateFileSize
};

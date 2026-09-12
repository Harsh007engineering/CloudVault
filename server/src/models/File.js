const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true,
    maxlength: [255, 'Filename is too long']
  },
  storageKey: {
    type: String,
    required: [true, 'Storage key is required'],
    unique: true
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  }
}, {
  timestamps: true
});

// Compound indexes for fast scoped user queries
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ userId: 1, originalName: 1 });

const File = mongoose.model('File', fileSchema);

module.exports = File;

const mongoose = require('mongoose');
const config = require('../config/env');

const recoveryCodeSchema = new mongoose.Schema({
  codeHash: {
    type: String,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens with no spaces']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  recoveryCodes: {
    type: [recoveryCodeSchema],
    default: []
  },
  storageUsed: {
    type: Number,
    default: 0,
    min: [0, 'Storage used cannot be negative']
  },
  storageLimit: {
    type: Number,
    default: config.defaultStorageLimit,
    min: [1048576, 'Storage limit must be at least 1 MiB'] // Minimum 1 MiB
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  accountStatus: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active'
  },
  forcePasswordChange: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hide sensitive fields by default when serializing to JSON, while safely exposing recovery code count
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  const recoveryCodesRemaining = Array.isArray(user.recoveryCodes) 
    ? user.recoveryCodes.filter(c => !c.used).length 
    : 0;
  delete user.passwordHash;
  delete user.recoveryCodes;
  user.recoveryCodesRemaining = recoveryCodesRemaining;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

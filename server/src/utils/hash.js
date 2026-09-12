const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const BCRYPT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt with 12 rounds
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
};

/**
 * Compares plaintext password against a stored bcrypt hash
 */
const comparePassword = async (password, hash) => {
  if (!password || !hash) return false;
  return await bcrypt.compare(password, hash);
};

/**
 * Normalizes and hashes a recovery code with SHA-256
 */
const hashRecoveryCode = (code) => {
  const normalized = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
};

/**
 * Generates N cryptographically secure random recovery codes (e.g. 8K4P-X92M)
 * Uses unambiguous characters: excludes 0/O, 1/I/L
 */
const generateRecoveryCodes = (count = 5) => {
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const codes = [];

  for (let i = 0; i < count; i++) {
    const bytes = crypto.randomBytes(8);
    let part1 = '';
    let part2 = '';

    for (let j = 0; j < 4; j++) {
      part1 += chars[bytes[j] % chars.length];
    }
    for (let j = 4; j < 8; j++) {
      part2 += chars[bytes[j] % chars.length];
    }

    codes.push(`${part1}-${part2}`);
  }

  return codes;
};

module.exports = {
  hashPassword,
  comparePassword,
  hashRecoveryCode,
  generateRecoveryCodes
};

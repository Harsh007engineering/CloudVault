const User = require('../models/User');
const { hashPassword, comparePassword, hashRecoveryCode, generateRecoveryCodes } = require('../utils/hash');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Register a new user with only Username and Password
 * Generates 5 cryptographically secure one-time recovery codes
 */
const signup = async (req, res, next) => {
  try {
    const { username, password, confirmPassword } = req.body;

    // 1. Input validation
    if (!username || !password || !confirmPassword) {
      return sendError(res, 'Username, password, and confirm password are required.', 400);
    }

    const trimmedUsername = username.trim().toLowerCase();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      return sendError(res, 'Username must be between 3 and 30 characters.', 400);
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      return sendError(res, 'Username can only contain letters, numbers, underscores, and hyphens without spaces.', 400);
    }

    if (password.length < 8) {
      return sendError(res, 'Password must be at least 8 characters long.', 400);
    }

    if (password !== confirmPassword) {
      return sendError(res, 'Passwords do not match.', 400);
    }

    // 2. Check for duplicate username
    const existingUser = await User.findOne({ username: trimmedUsername });
    if (existingUser) {
      return sendError(res, 'Username is already taken. Please choose another.', 409);
    }

    // 3. Hash password
    const passwordHash = await hashPassword(password);

    // 4. Generate 5 secure recovery codes and hash them
    const plaintextRecoveryCodes = generateRecoveryCodes(5);
    const hashedRecoveryCodes = plaintextRecoveryCodes.map(code => ({
      codeHash: hashRecoveryCode(code),
      used: false,
      usedAt: null
    }));

    // 5. Check if this is the first user (assign admin role)
    const userCount = await User.countDocuments();
    const role = (userCount === 0 || trimmedUsername === 'admin') ? 'admin' : 'user';

    // 6. Create user record
    const newUser = await User.create({
      username: trimmedUsername,
      passwordHash,
      recoveryCodes: hashedRecoveryCodes,
      role
    });

    // 7. Establish server-side session
    req.session.userId = newUser._id;

    // 8. Return response with plaintext recovery codes displayed ONLY ONCE
    return sendSuccess(res, {
      user: newUser.toJSON(),
      recoveryCodes: plaintextRecoveryCodes
    }, 'Account created successfully. Please save your recovery codes.', 201);

  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate user via username and password
 * Uses generic error messages to prevent username enumeration
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 'Invalid username or password.', 400);
    }

    const trimmedUsername = username.trim().toLowerCase();

    // 1. Lookup user
    const user = await User.findOne({ username: trimmedUsername });

    // 2. Constant-time password check (generic error on failure)
    if (!user) {
      return sendError(res, 'Invalid username or password.', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid username or password.', 401);
    }

    // 3. Check account status
    if (user.accountStatus === 'disabled') {
      return sendError(res, 'Your account has been disabled. Please contact the administrator.', 403);
    }

    // 4. Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        return next(err);
      }

      req.session.userId = user._id;

      return sendSuccess(res, {
        user: user.toJSON(),
        forcePasswordChange: user.forcePasswordChange
      }, 'Signed in successfully');
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Destroy session and clear cookie
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.clearCookie('cv.sid');
    return sendSuccess(res, null, 'Logged out successfully');
  });
};

/**
 * Get current authenticated user details
 */
const getMe = async (req, res) => {
  return sendSuccess(res, {
    user: req.user.toJSON(),
    forcePasswordChange: req.user.forcePasswordChange
  });
};

/**
 * Change password (authenticated)
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;

    if (!newPassword || !confirmPassword) {
      return sendError(res, 'New password and confirm password are required.', 400);
    }

    if (newPassword.length < 8) {
      return sendError(res, 'New password must be at least 8 characters long.', 400);
    }

    if (newPassword !== confirmPassword) {
      return sendError(res, 'New passwords do not match.', 400);
    }

    // If user is not forced to change password, require current password verification
    if (!user.forcePasswordChange) {
      if (!currentPassword) {
        return sendError(res, 'Current password is required.', 400);
      }
      const isMatch = await comparePassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return sendError(res, 'Current password is incorrect.', 400);
      }
    }

    // Hash and update password
    user.passwordHash = await hashPassword(newPassword);
    user.forcePasswordChange = false;
    await user.save();

    return sendSuccess(res, null, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate forgot password flow
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username) {
      return sendError(res, 'Username is required.', 400);
    }

    const trimmedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: trimmedUsername });

    // Always respond with success to prevent user enumeration
    return sendSuccess(res, {
      username: trimmedUsername,
      exists: !!user
    }, 'If the account exists, enter a recovery code to continue.');
  } catch (error) {
    next(error);
  }
};

/**
 * Verify a single recovery code
 */
const verifyRecoveryCode = async (req, res, next) => {
  try {
    const { username, recoveryCode } = req.body;

    if (!username || !recoveryCode) {
      return sendError(res, 'Username and recovery code are required.', 400);
    }

    const trimmedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: trimmedUsername });

    if (!user) {
      return sendError(res, 'Invalid recovery code or username.', 400);
    }

    const codeHash = hashRecoveryCode(recoveryCode);
    const validCode = user.recoveryCodes.find(
      c => c.codeHash === codeHash && !c.used
    );

    if (!validCode) {
      return sendError(res, 'Invalid or already used recovery code.', 400);
    }

    return sendSuccess(res, { valid: true }, 'Recovery code verified successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using a valid recovery code
 */
const resetPassword = async (req, res, next) => {
  try {
    const { username, recoveryCode, newPassword, confirmPassword } = req.body;

    if (!username || !recoveryCode || !newPassword || !confirmPassword) {
      return sendError(res, 'All fields are required.', 400);
    }

    if (newPassword.length < 8) {
      return sendError(res, 'Password must be at least 8 characters long.', 400);
    }

    if (newPassword !== confirmPassword) {
      return sendError(res, 'Passwords do not match.', 400);
    }

    const trimmedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: trimmedUsername });

    if (!user) {
      return sendError(res, 'Invalid recovery code or username.', 400);
    }

    const codeHash = hashRecoveryCode(recoveryCode);
    const codeIndex = user.recoveryCodes.findIndex(
      c => c.codeHash === codeHash && !c.used
    );

    if (codeIndex === -1) {
      return sendError(res, 'Invalid or already used recovery code.', 400);
    }

    // Invalidate the used recovery code (can never be reused)
    user.recoveryCodes[codeIndex].used = true;
    user.recoveryCodes[codeIndex].usedAt = new Date();

    // Update password
    user.passwordHash = await hashPassword(newPassword);
    user.forcePasswordChange = false;
    await user.save();

    // Invalidate existing sessions
    if (req.session) {
      req.session.destroy();
      res.clearCookie('cv.sid');
    }

    return sendSuccess(res, null, 'Password reset successful. Please sign in with your new password.');
  } catch (error) {
    next(error);
  }
};

/**
 * Regenerate 5 new recovery codes from Settings
 * Invalidates all previous codes
 */
const regenerateRecoveryCodes = async (req, res, next) => {
  try {
    const { currentPassword } = req.body;
    const user = req.user;

    if (!currentPassword) {
      return sendError(res, 'Current password is required to generate new recovery codes.', 400);
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 400);
    }

    // Generate 5 new codes
    const newCodes = generateRecoveryCodes(5);
    user.recoveryCodes = newCodes.map(code => ({
      codeHash: hashRecoveryCode(code),
      used: false,
      usedAt: null
    }));

    await user.save();

    return sendSuccess(res, {
      recoveryCodes: newCodes
    }, 'New recovery codes generated. All previous codes are now invalid.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  verifyRecoveryCode,
  resetPassword,
  regenerateRecoveryCodes
};

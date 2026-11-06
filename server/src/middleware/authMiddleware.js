const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate a signed JWT token with configurable expiration
 */
const generateToken = (user) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
    }
  );
};

/**
 * Protect routes: verifies token and handles token expiry gracefully
 */
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header for Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to access this resource.',
      code: 'NO_TOKEN',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and attach to request object
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
        code: 'USER_NOT_FOUND',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // Specific, structured handling for JWT Expiry Issues
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt,
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid session token. Please log in again.',
        code: 'TOKEN_INVALID',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please log in again.',
      code: 'AUTH_FAILED',
    });
  }
};

/**
 * Authorize specific roles (e.g. 'admin', 'superadmin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'guest'}' is not authorized to perform this action.`,
        code: 'FORBIDDEN',
      });
    }
    next();
  };
};

module.exports = {
  generateToken,
  protect,
  authorize,
};

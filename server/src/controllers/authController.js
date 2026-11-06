const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

// @desc    Admin Login
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const envAdminPassword = process.env.ADMIN_PASSWORD || '';

    // Check user in database
    let user = await User.findOne({ email: trimmedEmail }).select('+password');

    if (!user) {
      // If user does not exist in DB yet, but matches backend .env credentials, auto-provision
      if (envAdminEmail && trimmedEmail === envAdminEmail && password === envAdminPassword) {
        user = await User.create({
          name: process.env.ADMIN_NAME || 'Sri Chintamoni Kunja Admin',
          email: envAdminEmail,
          password: envAdminPassword,
          role: 'admin',
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. User not found.',
        });
      }
    } else {
      // User exists in DB: check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        // If password was updated in backend .env, sync it
        if (envAdminEmail && user.email === envAdminEmail && password === envAdminPassword) {
          user.password = envAdminPassword;
          await user.save();
        } else {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials. Password incorrect.',
          });
        }
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user);
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    res.status(200).json({
      success: true,
      token,
      expiresIn,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
      message: 'Logged in successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    });
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Refresh session token (prevents sudden expiry during active work)
// @route   POST /api/auth/refresh
const refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = generateToken(user);
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    res.status(200).json({
      success: true,
      token,
      expiresIn,
      message: 'Session refreshed successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Initial admin registration or auto-setup
// @route   POST /api/auth/init
const seedAdmin = async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin account already initialized.',
      });
    }

    const { name, email, password } = req.body;
    const admin = await User.create({
      name: name || 'Sri Chintamoni Kunja Admin',
      email: (email || 'admin@chintamonikunja.org').toLowerCase().trim(),
      password: password || 'Chintamoni@2026',
      role: 'admin',
    });

    const token = generateToken(admin);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      message: 'Initial admin created successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  getMe,
  refreshToken,
  seedAdmin,
};


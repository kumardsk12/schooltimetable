const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const { auth, sensitiveOperationLimit } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (but should be restricted in production)
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name.en')
    .trim()
    .isLength({ min: 2 })
    .withMessage('English name must be at least 2 characters long'),
  body('name.si')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Sinhala name must be at least 2 characters long'),
  body('role')
    .isIn(['admin', 'teacher', 'student', 'parent'])
    .withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message_si: 'වලංගුකරණය අසාර්ථක විය',
        details: errors.array()
      });
    }

    const { email, password, name, role, teacherId, studentId } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email',
        message_si: 'මෙම ඊමේල් ලිපිනය සමඟ පරිශීලකයෙකු දැනටමත් පවතී'
      });
    }

    // Check if teacherId or studentId already exists
    if (teacherId) {
      const existingTeacher = await User.findOne({ teacherId });
      if (existingTeacher) {
        return res.status(400).json({
          error: 'Teacher ID already exists',
          message_si: 'ගුරු හැඳුනුම්පත දැනටමත් පවතී'
        });
      }
    }

    if (studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({
          error: 'Student ID already exists',
          message_si: 'ශිෂ්‍ය හැඳුනුම්පත දැනටමත් පවතී'
        });
      }
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role,
      teacherId: role === 'teacher' ? teacherId : undefined,
      studentId: role === 'student' ? studentId : undefined,
      emailVerified: false // In production, implement email verification
    });

    await user.save();

    // If user is a teacher, create teacher profile
    if (role === 'teacher' && teacherId) {
      const teacher = new Teacher({
        teacherId,
        user: user._id,
        name,
        shortName: {
          en: name.en.split(' ').map(n => n[0]).join('').toUpperCase(),
          si: name.si.split(' ')[0] // Use first name for Sinhala short name
        },
        subjects: [],
        classes: [],
        isActive: true
      });

      await teacher.save();
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      message_si: 'පරිශීලකයා සාර්ථකව ලියාපදිංචි විය',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Server error during registration',
      message_si: 'ලියාපදිංචිය අතරතුර සේවාදායක දෝෂයක්'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  sensitiveOperationLimit,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .exists()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message_si: 'වලංගුකරණය අසාර්ථක විය',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({
        error: 'Invalid credentials',
        message_si: 'වලංගු නොවන අක්තපත්‍ර'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        error: 'Account is temporarily locked due to multiple failed login attempts',
        message_si: 'බහුවිධ අසාර්ථක පිවිසුම් උත්සාහයන් හේතුවෙන් ගිණුම තාවකාලිකව අගුලු දමා ඇත'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account is deactivated',
        message_si: 'ගිණුම අක්‍රිය කර ඇත'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(400).json({
        error: 'Invalid credentials',
        message_si: 'වලංගු නොවන අක්තපත්‍ර'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Login successful',
      message_si: 'පිවිසීම සාර්ථකයි',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences,
        teacherId: user.teacherId,
        studentId: user.studentId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error during login',
      message_si: 'පිවිසීම අතරතුර සේවාදායක දෝෂයක්'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('subjects', 'name code')
      .populate('classes', 'name grade section')
      .populate('children', 'name studentId');

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences,
        profile: user.profile,
        teacherId: user.teacherId,
        studentId: user.studentId,
        subjects: user.subjects,
        classes: user.classes,
        children: user.children,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // In production, you might want to implement token blacklisting
  res.json({
    message: 'Logged out successfully',
    message_si: 'සාර්ථකව ඉවත් විය'
  });
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [
  auth,
  sensitiveOperationLimit,
  body('currentPassword')
    .exists()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message_si: 'වලංගුකරණය අසාර්ථක විය',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        error: 'Current password is incorrect',
        message_si: 'වර්තමාන මුරපදය වැරදිය'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully',
      message_si: 'මුරපදය සාර්ථකව වෙනස් කරන ලදී'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

module.exports = router;

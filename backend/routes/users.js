const express = require('express');
const { body, validationResult, param } = require('express-validator');
const User = require('../models/User');
const { auth, isAdmin, validateOwnershipOrAdmin, logActivity } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', [auth, isAdmin], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      isActive = '',
      sortBy = 'name.si',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.si': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { teacherId: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .populate('subjects', 'name code')
      .populate('classes', 'name grade section')
      .populate('children', 'name studentId')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin or own data)
router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid user ID'),
  validateOwnershipOrAdmin()
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

    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('subjects', 'name code')
      .populate('classes', 'name grade section')
      .populate('children', 'name studentId');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message_si: 'පරිශීලකයා හමු නොවීය'
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or own data)
router.put('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid user ID'),
  validateOwnershipOrAdmin(),
  logActivity('update_user'),
  body('name.en')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('English name must be at least 2 characters'),
  body('name.si')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Sinhala name must be at least 2 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
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

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message_si: 'පරිශීලකයා හමු නොවීය'
      });
    }

    // Check if email is being changed and if it's unique
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({
          error: 'Email already exists',
          message_si: 'ඊමේල් දැනටමත් පවතී'
        });
      }
    }

    // Update allowed fields
    const allowedFields = ['name', 'email', 'preferences', 'profile'];
    
    // Admin can update additional fields
    if (req.user.role === 'admin') {
      allowedFields.push('role', 'isActive', 'subjects', 'classes', 'children');
    }

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('subjects', 'name code')
      .populate('classes', 'name grade section')
      .populate('children', 'name studentId');

    res.json({
      message: 'User updated successfully',
      message_si: 'පරිශීලකයා සාර්ථකව යාවත්කාලීන කරන ලදී',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   PUT /api/users/:id/preferences
// @desc    Update user preferences
// @access  Private (Own data only)
router.put('/:id/preferences', [
  auth,
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('language')
    .optional()
    .isIn(['si', 'en'])
    .withMessage('Language must be si or en'),
  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be light or dark')
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

    // Users can only update their own preferences
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message_si: 'ප්‍රවේශය ප්‍රතික්ෂේප විය'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message_si: 'පරිශීලකයා හමු නොවීය'
      });
    }

    // Update preferences
    if (req.body.language) {
      user.preferences.language = req.body.language;
    }
    if (req.body.theme) {
      user.preferences.theme = req.body.theme;
    }
    if (req.body.notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...req.body.notifications
      };
    }

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      message_si: 'මනාපයන් සාර්ථකව යාවත්කාලීන කරන ලදී',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin only)
router.delete('/:id', [
  auth,
  isAdmin,
  logActivity('delete_user'),
  param('id').isMongoId().withMessage('Invalid user ID')
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

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message_si: 'පරිශීලකයා හමු නොවීය'
      });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          error: 'Cannot delete the last admin user',
          message_si: 'අවසාන පරිපාලක පරිශීලකයා මකා දැමිය නොහැක'
        });
      }
    }

    // Soft delete - just mark as inactive
    user.isActive = false;
    await user.save();

    res.json({
      message: 'User deleted successfully',
      message_si: 'පරිශීලකයා සාර්ථකව මකන ලදී'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   GET /api/users/stats/summary
// @desc    Get user statistics
// @access  Private (Admin only)
router.get('/stats/summary', [auth, isAdmin], async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$isActive', true] }, 1, 0]
            }
          }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalUsers,
      activeUsers,
      recentUsers,
      byRole: stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

module.exports = router;

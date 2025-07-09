const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { auth, isAdmin, isTeacherOrAdmin, logActivity } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Private (Admin/Teacher)
router.get('/', [auth, isTeacherOrAdmin], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      subject = '',
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
        { teacherId: { $regex: search, $options: 'i' } },
        { 'contact.email': { $regex: search, $options: 'i' } }
      ];
    }

    if (subject) {
      query['subjects.subject'] = subject;
    }

    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const teachers = await Teacher.find(query)
      .populate('subjects.subject', 'name code')
      .populate('classes.class', 'name grade section')
      .populate('user', 'email preferences')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Teacher.countDocuments(query);

    res.json({
      teachers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   GET /api/teachers/:id
// @desc    Get teacher by ID
// @access  Private (Admin/Teacher - own data)
router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid teacher ID')
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

    const teacher = await Teacher.findById(req.params.id)
      .populate('subjects.subject', 'name code color')
      .populate('classes.class', 'name grade section')
      .populate('user', 'email preferences profile');

    if (!teacher) {
      return res.status(404).json({
        error: 'Teacher not found',
        message_si: 'ගුරුවරයා හමු නොවීය'
      });
    }

    // Check if user can access this teacher's data
    if (req.user.role !== 'admin' && teacher.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message_si: 'ප්‍රවේශය ප්‍රතික්ෂේප විය'
      });
    }

    res.json({ teacher });

  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   POST /api/teachers
// @desc    Create new teacher
// @access  Private (Admin only)
router.post('/', [
  auth,
  isAdmin,
  logActivity('create_teacher'),
  body('teacherId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Teacher ID is required'),
  body('name.en')
    .trim()
    .isLength({ min: 2 })
    .withMessage('English name must be at least 2 characters'),
  body('name.si')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Sinhala name must be at least 2 characters'),
  body('shortName.en')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('English short name must be 1-10 characters'),
  body('shortName.si')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Sinhala short name must be 1-10 characters'),
  body('user')
    .isMongoId()
    .withMessage('Valid user ID is required')
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

    const { teacherId, name, shortName, user, subjects = [], classes = [], contact, employment } = req.body;

    // Check if teacher ID already exists
    const existingTeacher = await Teacher.findByTeacherId(teacherId);
    if (existingTeacher) {
      return res.status(400).json({
        error: 'Teacher ID already exists',
        message_si: 'ගුරු හැඳුනුම්පත දැනටමත් පවතී'
      });
    }

    // Check if user exists and is not already a teacher
    const userDoc = await User.findById(user);
    if (!userDoc) {
      return res.status(400).json({
        error: 'User not found',
        message_si: 'පරිශීලකයා හමු නොවීය'
      });
    }

    if (userDoc.role !== 'teacher') {
      return res.status(400).json({
        error: 'User must have teacher role',
        message_si: 'පරිශීලකයාට ගුරු භූමිකාව තිබිය යුතුය'
      });
    }

    const existingTeacherForUser = await Teacher.findOne({ user });
    if (existingTeacherForUser) {
      return res.status(400).json({
        error: 'User already has a teacher profile',
        message_si: 'පරිශීලකයාට දැනටමත් ගුරු පැතිකඩක් ඇත'
      });
    }

    // Create new teacher
    const teacher = new Teacher({
      teacherId,
      user,
      name,
      shortName,
      subjects: subjects.map(s => ({
        subject: s.subject,
        isMainSubject: s.isMainSubject || false
      })),
      classes: classes.map(c => ({
        class: c.class,
        isClassTeacher: c.isClassTeacher || false
      })),
      contact,
      employment,
      isActive: true
    });

    await teacher.save();

    // Update user with teacher ID
    userDoc.teacherId = teacherId;
    await userDoc.save();

    // Populate the response
    await teacher.populate('subjects.subject', 'name code');
    await teacher.populate('classes.class', 'name grade section');
    await teacher.populate('user', 'email preferences');

    res.status(201).json({
      message: 'Teacher created successfully',
      message_si: 'ගුරුවරයා සාර්ථකව සාදන ලදී',
      teacher
    });

  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  isAdmin,
  logActivity('update_teacher'),
  param('id').isMongoId().withMessage('Invalid teacher ID'),
  body('name.en')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('English name must be at least 2 characters'),
  body('name.si')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Sinhala name must be at least 2 characters')
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

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        error: 'Teacher not found',
        message_si: 'ගුරුවරයා හමු නොවීය'
      });
    }

    // Update fields
    const updateFields = ['name', 'shortName', 'subjects', 'classes', 'contact', 'employment', 'availability', 'workload', 'isActive', 'notes'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        teacher[field] = req.body[field];
      }
    });

    await teacher.save();

    // Populate the response
    await teacher.populate('subjects.subject', 'name code');
    await teacher.populate('classes.class', 'name grade section');
    await teacher.populate('user', 'email preferences');

    res.json({
      message: 'Teacher updated successfully',
      message_si: 'ගුරුවරයා සාර්ථකව යාවත්කාලීන කරන ලදී',
      teacher
    });

  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher (soft delete)
// @access  Private (Admin only)
router.delete('/:id', [
  auth,
  isAdmin,
  logActivity('delete_teacher'),
  param('id').isMongoId().withMessage('Invalid teacher ID')
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

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        error: 'Teacher not found',
        message_si: 'ගුරුවරයා හමු නොවීය'
      });
    }

    // Soft delete - just mark as inactive
    teacher.isActive = false;
    await teacher.save();

    res.json({
      message: 'Teacher deleted successfully',
      message_si: 'ගුරුවරයා සාර්ථකව මකන ලදී'
    });

  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

module.exports = router;

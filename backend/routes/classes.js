const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Class = require('../models/Class');
const { auth, isAdmin, logActivity } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/classes
// @desc    Get all classes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      grade = '',
      stream = '',
      academicYear = '',
      isActive = '',
      sortBy = 'grade',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.si': { $regex: search, $options: 'i' } },
        { classId: { $regex: search, $options: 'i' } },
        { section: { $regex: search, $options: 'i' } }
      ];
    }

    if (grade) {
      query.grade = parseInt(grade);
    }

    if (stream) {
      query.stream = stream;
    }

    if (academicYear) {
      query.academicYear = academicYear;
    }

    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Secondary sort by section
    if (sortBy !== 'section') {
      sort.section = 1;
    }

    // Execute query with pagination
    const classes = await Class.find(query)
      .populate('classTeacher', 'name teacherId')
      .populate('assistantTeacher', 'name teacherId')
      .populate('room', 'name number building')
      .populate('subjects.subject', 'name code')
      .populate('subjects.teacher', 'name teacherId')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Class.countDocuments(query);

    res.json({
      classes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   GET /api/classes/:id
// @desc    Get class by ID
// @access  Private
router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid class ID')
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

    const classDoc = await Class.findById(req.params.id)
      .populate('classTeacher', 'name teacherId contact')
      .populate('assistantTeacher', 'name teacherId contact')
      .populate('room', 'name number building type capacity')
      .populate('subjects.subject', 'name code color')
      .populate('subjects.teacher', 'name teacherId shortName')
      .populate('students.student', 'name studentId');

    if (!classDoc) {
      return res.status(404).json({
        error: 'Class not found',
        message_si: 'පන්තිය හමු නොවීය'
      });
    }

    res.json({ class: classDoc });

  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   POST /api/classes
// @desc    Create new class
// @access  Private (Admin only)
router.post('/', [
  auth,
  isAdmin,
  logActivity('create_class'),
  body('classId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Class ID is required'),
  body('name.en')
    .trim()
    .isLength({ min: 2 })
    .withMessage('English name must be at least 2 characters'),
  body('name.si')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Sinhala name must be at least 2 characters'),
  body('grade')
    .isInt({ min: 1, max: 13 })
    .withMessage('Grade must be between 1 and 13'),
  body('section')
    .trim()
    .isLength({ min: 1, max: 5 })
    .withMessage('Section must be 1-5 characters'),
  body('capacity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100'),
  body('academicYear')
    .trim()
    .isLength({ min: 4 })
    .withMessage('Academic year is required')
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

    const { classId, name, grade, section, stream, capacity, academicYear, term } = req.body;

    // Check if class ID already exists
    const existingClass = await Class.findByClassId(classId);
    if (existingClass) {
      return res.status(400).json({
        error: 'Class ID already exists',
        message_si: 'පන්ති හැඳුනුම්පත දැනටමත් පවතී'
      });
    }

    // Check if grade and section combination exists for the academic year
    const existingGradeSection = await Class.findOne({
      grade,
      section,
      academicYear,
      isActive: true
    });
    if (existingGradeSection) {
      return res.status(400).json({
        error: 'Grade and section combination already exists for this academic year',
        message_si: 'මෙම අධ්‍යයන වර්ෂය සඳහා ශ්‍රේණිය සහ අංශ සංයෝජනය දැනටමත් පවතී'
      });
    }

    // Create new class
    const newClass = new Class({
      classId,
      name,
      grade,
      section,
      stream: stream || 'general',
      capacity,
      academicYear,
      term: term || '1',
      currentStrength: 0,
      isActive: true
    });

    await newClass.save();

    // Populate the response
    await newClass.populate('classTeacher', 'name teacherId');
    await newClass.populate('assistantTeacher', 'name teacherId');
    await newClass.populate('room', 'name number building');

    res.status(201).json({
      message: 'Class created successfully',
      message_si: 'පන්තිය සාර්ථකව සාදන ලදී',
      class: newClass
    });

  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  isAdmin,
  logActivity('update_class'),
  param('id').isMongoId().withMessage('Invalid class ID')
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

    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({
        error: 'Class not found',
        message_si: 'පන්තිය හමු නොවීය'
      });
    }

    // Update fields
    const updateFields = [
      'name', 'grade', 'section', 'stream', 'classTeacher', 'assistantTeacher',
      'room', 'capacity', 'academicYear', 'term', 'schedule', 'isActive', 'notes'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        classDoc[field] = req.body[field];
      }
    });

    await classDoc.save();

    // Populate the response
    await classDoc.populate('classTeacher', 'name teacherId');
    await classDoc.populate('assistantTeacher', 'name teacherId');
    await classDoc.populate('room', 'name number building');
    await classDoc.populate('subjects.subject', 'name code');
    await classDoc.populate('subjects.teacher', 'name teacherId');

    res.json({
      message: 'Class updated successfully',
      message_si: 'පන්තිය සාර්ථකව යාවත්කාලීන කරන ලදී',
      class: classDoc
    });

  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete class (soft delete)
// @access  Private (Admin only)
router.delete('/:id', [
  auth,
  isAdmin,
  logActivity('delete_class'),
  param('id').isMongoId().withMessage('Invalid class ID')
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

    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({
        error: 'Class not found',
        message_si: 'පන්තිය හමු නොවීය'
      });
    }

    // Soft delete - just mark as inactive
    classDoc.isActive = false;
    await classDoc.save();

    res.json({
      message: 'Class deleted successfully',
      message_si: 'පන්තිය සාර්ථකව මකන ලදී'
    });

  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

module.exports = router;

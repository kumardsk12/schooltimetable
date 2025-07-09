const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Subject = require('../models/Subject');
const { auth, isAdmin, logActivity } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      grade = '',
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
        { subjectId: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (grade) {
      query['grades.grade'] = parseInt(grade);
    }

    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const subjects = await Subject.find(query)
      .populate('teachers', 'name teacherId shortName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Subject.countDocuments(query);

    res.json({
      subjects,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   GET /api/subjects/:id
// @desc    Get subject by ID
// @access  Private
router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid subject ID')
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

    const subject = await Subject.findById(req.params.id)
      .populate('teachers', 'name teacherId shortName contact');

    if (!subject) {
      return res.status(404).json({
        error: 'Subject not found',
        message_si: 'විෂයය හමු නොවීය'
      });
    }

    res.json({ subject });

  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   POST /api/subjects
// @desc    Create new subject
// @access  Private (Admin only)
router.post('/', [
  auth,
  isAdmin,
  logActivity('create_subject'),
  body('subjectId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Subject ID is required'),
  body('name.en')
    .trim()
    .isLength({ min: 2 })
    .withMessage('English name must be at least 2 characters'),
  body('name.si')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Sinhala name must be at least 2 characters'),
  body('code')
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Subject code must be 2-10 characters'),
  body('category')
    .isIn(['core', 'optional', 'extra-curricular', 'language'])
    .withMessage('Invalid category')
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

    const { subjectId, name, shortName, code, category, department, grades } = req.body;

    // Check if subject ID already exists
    const existingSubject = await Subject.findBySubjectId(subjectId);
    if (existingSubject) {
      return res.status(400).json({
        error: 'Subject ID already exists',
        message_si: 'විෂය හැඳුනුම්පත දැනටමත් පවතී'
      });
    }

    // Check if code already exists
    const existingCode = await Subject.findByCode(code);
    if (existingCode) {
      return res.status(400).json({
        error: 'Subject code already exists',
        message_si: 'විෂය කේතය දැනටමත් පවතී'
      });
    }

    // Create new subject
    const subject = new Subject({
      subjectId,
      name,
      shortName: shortName || {
        en: name.en.substring(0, 5),
        si: name.si.substring(0, 5)
      },
      code: code.toUpperCase(),
      category,
      department,
      grades: grades || [],
      teachers: [],
      isActive: true
    });

    await subject.save();

    res.status(201).json({
      message: 'Subject created successfully',
      message_si: 'විෂයය සාර්ථකව සාදන ලදී',
      subject
    });

  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update subject
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  isAdmin,
  logActivity('update_subject'),
  param('id').isMongoId().withMessage('Invalid subject ID')
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

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        error: 'Subject not found',
        message_si: 'විෂයය හමු නොවීය'
      });
    }

    // Check if code is being changed and if it's unique
    if (req.body.code && req.body.code.toUpperCase() !== subject.code) {
      const existingCode = await Subject.findByCode(req.body.code);
      if (existingCode) {
        return res.status(400).json({
          error: 'Subject code already exists',
          message_si: 'විෂය කේතය දැනටමත් පවතී'
        });
      }
    }

    // Update fields
    const updateFields = [
      'name', 'shortName', 'code', 'category', 'department', 'grades',
      'teachers', 'resources', 'scheduling', 'assessment', 'color',
      'isActive', 'description', 'syllabus'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'code') {
          subject[field] = req.body[field].toUpperCase();
        } else {
          subject[field] = req.body[field];
        }
      }
    });

    await subject.save();

    // Populate the response
    await subject.populate('teachers', 'name teacherId shortName');

    res.json({
      message: 'Subject updated successfully',
      message_si: 'විෂයය සාර්ථකව යාවත්කාලීන කරන ලදී',
      subject
    });

  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete subject (soft delete)
// @access  Private (Admin only)
router.delete('/:id', [
  auth,
  isAdmin,
  logActivity('delete_subject'),
  param('id').isMongoId().withMessage('Invalid subject ID')
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

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        error: 'Subject not found',
        message_si: 'විෂයය හමු නොවීය'
      });
    }

    // Soft delete - just mark as inactive
    subject.isActive = false;
    await subject.save();

    res.json({
      message: 'Subject deleted successfully',
      message_si: 'විෂයය සාර්ථකව මකන ලදී'
    });

  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   GET /api/subjects/grade/:grade
// @desc    Get subjects for a specific grade
// @access  Private
router.get('/grade/:grade', [
  auth,
  param('grade').isInt({ min: 1, max: 13 }).withMessage('Grade must be between 1 and 13')
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

    const grade = parseInt(req.params.grade);
    const { compulsoryOnly = false } = req.query;

    const subjects = await Subject.findForGrade(grade, compulsoryOnly === 'true')
      .populate('teachers', 'name teacherId shortName')
      .sort({ 'name.si': 1 });

    res.json({ subjects });

  } catch (error) {
    console.error('Get subjects by grade error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

module.exports = router;

const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Room = require('../models/Room');
const { auth, isAdmin, logActivity } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/rooms
// @desc    Get all rooms
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      type = '',
      building = '',
      isActive = '',
      sortBy = 'number',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.si': { $regex: search, $options: 'i' } },
        { roomId: { $regex: search, $options: 'i' } },
        { number: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) {
      query.type = type;
    }

    if (building) {
      query['building.en'] = { $regex: building, $options: 'i' };
    }

    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const rooms = await Room.find(query)
      .populate('subjects', 'name code')
      .populate('assignedClasses.class', 'name grade section')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Room.countDocuments(query);

    res.json({
      rooms,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get room by ID
// @access  Private
router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid room ID')
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

    const room = await Room.findById(req.params.id)
      .populate('subjects', 'name code color')
      .populate('assignedClasses.class', 'name grade section')
      .populate('bookings.bookedBy', 'name email')
      .populate('bookings.approvedBy', 'name email');

    if (!room) {
      return res.status(404).json({
        error: 'Room not found',
        message_si: 'කාමරය හමු නොවීය'
      });
    }

    res.json({ room });

  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   POST /api/rooms
// @desc    Create new room
// @access  Private (Admin only)
router.post('/', [
  auth,
  isAdmin,
  logActivity('create_room'),
  body('roomId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Room ID is required'),
  body('name.en')
    .trim()
    .isLength({ min: 2 })
    .withMessage('English name must be at least 2 characters'),
  body('name.si')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Sinhala name must be at least 2 characters'),
  body('number')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Room number is required'),
  body('capacity')
    .isInt({ min: 1, max: 500 })
    .withMessage('Capacity must be between 1 and 500')
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

    const { roomId, name, number, building, floor, type, capacity } = req.body;

    // Check if room ID already exists
    const existingRoom = await Room.findByRoomId(roomId);
    if (existingRoom) {
      return res.status(400).json({
        error: 'Room ID already exists',
        message_si: 'කාමර හැඳුනුම්පත දැනටමත් පවතී'
      });
    }

    // Create new room
    const room = new Room({
      roomId,
      name,
      number,
      building,
      floor: floor || 0,
      type: type || 'classroom',
      capacity,
      isActive: true
    });

    await room.save();

    res.status(201).json({
      message: 'Room created successfully',
      message_si: 'කාමරය සාර්ථකව සාදන ලදී',
      room
    });

  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  isAdmin,
  logActivity('update_room'),
  param('id').isMongoId().withMessage('Invalid room ID')
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

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        error: 'Room not found',
        message_si: 'කාමරය හමු නොවීය'
      });
    }

    // Update fields
    const updateFields = [
      'name', 'number', 'building', 'floor', 'type', 'capacity',
      'facilities', 'subjects', 'assignedClasses', 'availability',
      'maintenance', 'location', 'isActive', 'notes'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        room[field] = req.body[field];
      }
    });

    await room.save();

    // Populate the response
    await room.populate('subjects', 'name code');
    await room.populate('assignedClasses.class', 'name grade section');

    res.json({
      message: 'Room updated successfully',
      message_si: 'කාමරය සාර්ථකව යාවත්කාලීන කරන ලදී',
      room
    });

  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete room (soft delete)
// @access  Private (Admin only)
router.delete('/:id', [
  auth,
  isAdmin,
  logActivity('delete_room'),
  param('id').isMongoId().withMessage('Invalid room ID')
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

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        error: 'Room not found',
        message_si: 'කාමරය හමු නොවීය'
      });
    }

    // Soft delete - just mark as inactive
    room.isActive = false;
    await room.save();

    res.json({
      message: 'Room deleted successfully',
      message_si: 'කාමරය සාර්ථකව මකන ලදී'
    });

  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      error: 'Server error',
      message_si: 'සේවාදායක දෝෂයක්'
    });
  }
});

module.exports = router;

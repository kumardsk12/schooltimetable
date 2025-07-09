const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    en: {
      type: String,
      required: true,
      trim: true
    },
    si: {
      type: String,
      required: true,
      trim: true
    }
  },
  number: {
    type: String,
    required: true,
    trim: true
  },
  building: {
    en: {
      type: String,
      required: true,
      trim: true
    },
    si: {
      type: String,
      required: true,
      trim: true
    }
  },
  floor: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  type: {
    type: String,
    enum: ['classroom', 'laboratory', 'library', 'auditorium', 'gymnasium', 'computer-lab', 'art-room', 'music-room', 'staff-room', 'office'],
    required: true,
    default: 'classroom'
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 500
  },
  facilities: {
    hasProjector: {
      type: Boolean,
      default: false
    },
    hasComputers: {
      type: Boolean,
      default: false
    },
    computerCount: {
      type: Number,
      default: 0
    },
    hasAirConditioning: {
      type: Boolean,
      default: false
    },
    hasWhiteboard: {
      type: Boolean,
      default: true
    },
    hasBlackboard: {
      type: Boolean,
      default: false
    },
    hasSmartBoard: {
      type: Boolean,
      default: false
    },
    hasAudioSystem: {
      type: Boolean,
      default: false
    },
    hasInternet: {
      type: Boolean,
      default: false
    },
    specialEquipment: [{
      name: {
        en: String,
        si: String
      },
      quantity: {
        type: Number,
        default: 1
      }
    }]
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  assignedClasses: [{
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  availability: {
    monday: [{
      period: Number,
      available: { type: Boolean, default: true },
      reason: String
    }],
    tuesday: [{
      period: Number,
      available: { type: Boolean, default: true },
      reason: String
    }],
    wednesday: [{
      period: Number,
      available: { type: Boolean, default: true },
      reason: String
    }],
    thursday: [{
      period: Number,
      available: { type: Boolean, default: true },
      reason: String
    }],
    friday: [{
      period: Number,
      available: { type: Boolean, default: true },
      reason: String
    }],
    saturday: [{
      period: Number,
      available: { type: Boolean, default: true },
      reason: String
    }]
  },
  maintenance: {
    lastCleaned: Date,
    lastMaintained: Date,
    nextMaintenanceDate: Date,
    maintenanceNotes: [{
      date: Date,
      description: {
        en: String,
        si: String
      },
      technician: String,
      cost: Number
    }]
  },
  bookings: [{
    date: Date,
    periods: [Number],
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    purpose: {
      en: String,
      si: String
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      en: String,
      si: String
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    description: {
      en: String,
      si: String
    }
  },
  images: [String],
  notes: {
    en: String,
    si: String
  }
}, {
  timestamps: true
});

// Indexes
roomSchema.index({ roomId: 1 });
roomSchema.index({ number: 1, building: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ capacity: 1 });
roomSchema.index({ isActive: 1 });

// Virtual for full room name
roomSchema.virtual('fullName').get(function() {
  return {
    en: `${this.name.en} (${this.number})`,
    si: `${this.name.si} (${this.number})`
  };
});

// Method to get display name based on language
roomSchema.methods.getDisplayName = function(language = 'si') {
  return this.name[language] || this.name.en || this.name.si;
};

// Method to get full name based on language
roomSchema.methods.getFullName = function(language = 'si') {
  return this.fullName[language] || this.fullName.en;
};

// Method to check if room is available for a specific period
roomSchema.methods.isAvailableForPeriod = function(day, period) {
  const dayAvailability = this.availability[day.toLowerCase()];
  if (!dayAvailability) return true;
  
  const periodAvailability = dayAvailability.find(p => p.period === period);
  return periodAvailability ? periodAvailability.available : true;
};

// Method to check if room is suitable for a subject
roomSchema.methods.isSuitableForSubject = function(subjectId) {
  return this.subjects.includes(subjectId);
};

// Method to book room for specific periods
roomSchema.methods.bookRoom = function(date, periods, bookedBy, purpose, notes = '') {
  // Check if room is available for all requested periods
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  
  for (const period of periods) {
    if (!this.isAvailableForPeriod(dayOfWeek, period)) {
      throw new Error(`Room not available for period ${period} on ${dayOfWeek}`);
    }
  }
  
  // Check for existing bookings
  const existingBooking = this.bookings.find(booking => 
    booking.date.toDateString() === date.toDateString() &&
    booking.periods.some(p => periods.includes(p)) &&
    booking.status !== 'cancelled' &&
    booking.status !== 'rejected'
  );
  
  if (existingBooking) {
    throw new Error('Room already booked for one or more of the requested periods');
  }
  
  this.bookings.push({
    date,
    periods,
    bookedBy,
    purpose,
    notes,
    status: 'pending'
  });
  
  return this.save();
};

// Method to approve booking
roomSchema.methods.approveBooking = function(bookingId, approvedBy) {
  const booking = this.bookings.id(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  booking.status = 'approved';
  booking.approvedBy = approvedBy;
  
  return this.save();
};

// Method to reject booking
roomSchema.methods.rejectBooking = function(bookingId, reason) {
  const booking = this.bookings.id(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  booking.status = 'rejected';
  booking.notes = booking.notes || {};
  booking.notes.en = reason;
  
  return this.save();
};

// Method to add subject
roomSchema.methods.addSubject = function(subjectId) {
  if (!this.subjects.includes(subjectId)) {
    this.subjects.push(subjectId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove subject
roomSchema.methods.removeSubject = function(subjectId) {
  this.subjects = this.subjects.filter(s => 
    s.toString() !== subjectId.toString()
  );
  return this.save();
};

// Static method to find by room ID
roomSchema.statics.findByRoomId = function(roomId) {
  return this.findOne({ roomId });
};

// Static method to find available rooms for a subject and period
roomSchema.statics.findAvailableForSubjectAndPeriod = function(subjectId, day, period) {
  return this.find({
    subjects: subjectId,
    isActive: true,
    [`availability.${day.toLowerCase()}.period`]: { $ne: period },
    [`availability.${day.toLowerCase()}.available`]: { $ne: false }
  });
};

module.exports = mongoose.model('Room', roomSchema);

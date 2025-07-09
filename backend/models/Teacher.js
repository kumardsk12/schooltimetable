const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  shortName: {
    en: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10
    },
    si: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10
    }
  },
  subjects: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    isMainSubject: {
      type: Boolean,
      default: false
    }
  }],
  classes: [{
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    isClassTeacher: {
      type: Boolean,
      default: false
    }
  }],
  availability: {
    monday: [{
      period: Number,
      available: { type: Boolean, default: true }
    }],
    tuesday: [{
      period: Number,
      available: { type: Boolean, default: true }
    }],
    wednesday: [{
      period: Number,
      available: { type: Boolean, default: true }
    }],
    thursday: [{
      period: Number,
      available: { type: Boolean, default: true }
    }],
    friday: [{
      period: Number,
      available: { type: Boolean, default: true }
    }],
    saturday: [{
      period: Number,
      available: { type: Boolean, default: true }
    }]
  },
  workload: {
    maxPeriodsPerDay: {
      type: Number,
      default: 8
    },
    maxPeriodsPerWeek: {
      type: Number,
      default: 40
    },
    preferredPeriods: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      },
      periods: [Number]
    }],
    avoidPeriods: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      },
      periods: [Number]
    }]
  },
  contact: {
    phone: String,
    email: String,
    address: {
      en: String,
      si: String
    }
  },
  employment: {
    employeeId: String,
    designation: {
      en: String,
      si: String
    },
    department: {
      en: String,
      si: String
    },
    joinDate: Date,
    employmentType: {
      type: String,
      enum: ['permanent', 'temporary', 'contract', 'substitute'],
      default: 'permanent'
    },
    qualifications: [{
      degree: {
        en: String,
        si: String
      },
      institution: {
        en: String,
        si: String
      },
      year: Number
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    en: String,
    si: String
  }
}, {
  timestamps: true
});

// Indexes
teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ user: 1 });
teacherSchema.index({ 'subjects.subject': 1 });
teacherSchema.index({ 'classes.class': 1 });
teacherSchema.index({ isActive: 1 });

// Virtual for full name display
teacherSchema.virtual('displayName').get(function() {
  return {
    en: this.name.en,
    si: this.name.si
  };
});

// Method to get display name based on language
teacherSchema.methods.getDisplayName = function(language = 'si') {
  return this.name[language] || this.name.en || this.name.si;
};

// Method to get short name based on language
teacherSchema.methods.getShortName = function(language = 'si') {
  return this.shortName[language] || this.shortName.en || this.shortName.si;
};

// Method to check if teacher is available for a specific period
teacherSchema.methods.isAvailableForPeriod = function(day, period) {
  const dayAvailability = this.availability[day.toLowerCase()];
  if (!dayAvailability) return true;
  
  const periodAvailability = dayAvailability.find(p => p.period === period);
  return periodAvailability ? periodAvailability.available : true;
};

// Method to get teacher's subjects
teacherSchema.methods.getSubjects = function() {
  return this.subjects.map(s => s.subject);
};

// Method to get teacher's classes
teacherSchema.methods.getClasses = function() {
  return this.classes.map(c => c.class);
};

// Method to check if teacher is class teacher for any class
teacherSchema.methods.isClassTeacher = function() {
  return this.classes.some(c => c.isClassTeacher);
};

// Static method to find by teacher ID
teacherSchema.statics.findByTeacherId = function(teacherId) {
  return this.findOne({ teacherId });
};

// Static method to find available teachers for a subject and period
teacherSchema.statics.findAvailableForSubjectAndPeriod = function(subjectId, day, period) {
  return this.find({
    'subjects.subject': subjectId,
    isActive: true,
    [`availability.${day.toLowerCase()}.period`]: { $ne: period },
    [`availability.${day.toLowerCase()}.available`]: { $ne: false }
  }).populate('subjects.subject');
};

module.exports = mongoose.model('Teacher', teacherSchema);

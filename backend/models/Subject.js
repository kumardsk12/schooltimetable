const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectId: {
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
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    enum: ['core', 'optional', 'extra-curricular', 'language'],
    required: true,
    default: 'core'
  },
  department: {
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
  grades: [{
    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 13
    },
    isCompulsory: {
      type: Boolean,
      default: true
    },
    defaultPeriodsPerWeek: {
      type: Number,
      default: 4
    }
  }],
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }],
  resources: {
    requiresLab: {
      type: Boolean,
      default: false
    },
    requiresComputer: {
      type: Boolean,
      default: false
    },
    requiresProjector: {
      type: Boolean,
      default: false
    },
    specialEquipment: [{
      en: String,
      si: String
    }]
  },
  scheduling: {
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
    }],
    canBeDoublePeriodsOnly: {
      type: Boolean,
      default: false
    },
    preferDoublePeriodsOnly: {
      type: Boolean,
      default: false
    },
    maxPeriodsPerDay: {
      type: Number,
      default: 2
    },
    minGapBetweenPeriods: {
      type: Number,
      default: 0
    }
  },
  assessment: {
    hasExam: {
      type: Boolean,
      default: true
    },
    hasPractical: {
      type: Boolean,
      default: false
    },
    hasProject: {
      type: Boolean,
      default: false
    },
    gradingSystem: {
      type: String,
      enum: ['A-F', '1-9', 'percentage', 'pass-fail'],
      default: 'A-F'
    }
  },
  color: {
    type: String,
    default: '#3498db',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    en: String,
    si: String
  },
  syllabus: {
    en: String,
    si: String
  }
}, {
  timestamps: true
});

// Indexes
subjectSchema.index({ subjectId: 1 });
subjectSchema.index({ code: 1 });
subjectSchema.index({ category: 1 });
subjectSchema.index({ 'grades.grade': 1 });
subjectSchema.index({ isActive: 1 });

// Virtual for display name
subjectSchema.virtual('displayName').get(function() {
  return {
    en: this.name.en,
    si: this.name.si
  };
});

// Method to get display name based on language
subjectSchema.methods.getDisplayName = function(language = 'si') {
  return this.name[language] || this.name.en || this.name.si;
};

// Method to get short name based on language
subjectSchema.methods.getShortName = function(language = 'si') {
  return this.shortName[language] || this.shortName.en || this.shortName.si;
};

// Method to check if subject is available for a grade
subjectSchema.methods.isAvailableForGrade = function(grade) {
  return this.grades.some(g => g.grade === grade);
};

// Method to get default periods per week for a grade
subjectSchema.methods.getDefaultPeriodsForGrade = function(grade) {
  const gradeInfo = this.grades.find(g => g.grade === grade);
  return gradeInfo ? gradeInfo.defaultPeriodsPerWeek : 4;
};

// Method to check if subject is compulsory for a grade
subjectSchema.methods.isCompulsoryForGrade = function(grade) {
  const gradeInfo = this.grades.find(g => g.grade === grade);
  return gradeInfo ? gradeInfo.isCompulsory : false;
};

// Method to check if subject can be scheduled in a specific period
subjectSchema.methods.canBeScheduledInPeriod = function(day, period) {
  // Check if period is in avoid list
  const avoidPeriods = this.scheduling.avoidPeriods.find(ap => 
    ap.day.toLowerCase() === day.toLowerCase()
  );
  if (avoidPeriods && avoidPeriods.periods.includes(period)) {
    return false;
  }
  
  // If there are preferred periods, check if this period is preferred
  const preferredPeriods = this.scheduling.preferredPeriods.find(pp => 
    pp.day.toLowerCase() === day.toLowerCase()
  );
  if (preferredPeriods && preferredPeriods.periods.length > 0) {
    return preferredPeriods.periods.includes(period);
  }
  
  return true;
};

// Method to add teacher
subjectSchema.methods.addTeacher = function(teacherId) {
  if (!this.teachers.includes(teacherId)) {
    this.teachers.push(teacherId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove teacher
subjectSchema.methods.removeTeacher = function(teacherId) {
  this.teachers = this.teachers.filter(t => 
    t.toString() !== teacherId.toString()
  );
  return this.save();
};

// Static method to find by subject ID
subjectSchema.statics.findBySubjectId = function(subjectId) {
  return this.findOne({ subjectId });
};

// Static method to find by code
subjectSchema.statics.findByCode = function(code) {
  return this.findOne({ code: code.toUpperCase() });
};

// Static method to find subjects for a grade
subjectSchema.statics.findForGrade = function(grade, compulsoryOnly = false) {
  const query = {
    'grades.grade': grade,
    isActive: true
  };
  
  if (compulsoryOnly) {
    query['grades.isCompulsory'] = true;
  }
  
  return this.find(query);
};

module.exports = mongoose.model('Subject', subjectSchema);

const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  classId: {
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
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 13
  },
  section: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5
  },
  stream: {
    type: String,
    enum: ['science', 'commerce', 'arts', 'technology', 'general'],
    default: 'general'
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  assistantTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  students: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rollNumber: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  subjects: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    periodsPerWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    isOptional: {
      type: Boolean,
      default: false
    }
  }],
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  currentStrength: {
    type: Number,
    default: 0
  },
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    enum: ['1', '2', '3'],
    required: true
  },
  schedule: {
    periodsPerDay: {
      type: Number,
      default: 8
    },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    }],
    startTime: {
      type: String,
      default: '07:30'
    },
    endTime: {
      type: String,
      default: '13:30'
    },
    breakTimes: [{
      name: {
        en: String,
        si: String
      },
      startTime: String,
      endTime: String,
      afterPeriod: Number
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
classSchema.index({ classId: 1 });
classSchema.index({ grade: 1, section: 1 });
classSchema.index({ academicYear: 1, term: 1 });
classSchema.index({ classTeacher: 1 });
classSchema.index({ isActive: 1 });

// Virtual for full class name
classSchema.virtual('fullName').get(function() {
  return {
    en: `Grade ${this.grade}${this.section} - ${this.name.en}`,
    si: `${this.grade} ශ්‍රේණිය${this.section} - ${this.name.si}`
  };
});

// Virtual for display name
classSchema.virtual('displayName').get(function() {
  return {
    en: `${this.grade}${this.section}`,
    si: `${this.grade}${this.section}`
  };
});

// Method to get display name based on language
classSchema.methods.getDisplayName = function(language = 'si') {
  return this.displayName[language] || this.displayName.en;
};

// Method to get full name based on language
classSchema.methods.getFullName = function(language = 'si') {
  return this.fullName[language] || this.fullName.en;
};

// Method to get active students count
classSchema.methods.getActiveStudentsCount = function() {
  return this.students.filter(s => s.isActive).length;
};

// Method to add student
classSchema.methods.addStudent = function(studentId, rollNumber) {
  const existingStudent = this.students.find(s => 
    s.student.toString() === studentId.toString()
  );
  
  if (existingStudent) {
    existingStudent.isActive = true;
    existingStudent.rollNumber = rollNumber;
  } else {
    this.students.push({
      student: studentId,
      rollNumber: rollNumber,
      isActive: true
    });
  }
  
  this.currentStrength = this.getActiveStudentsCount();
  return this.save();
};

// Method to remove student
classSchema.methods.removeStudent = function(studentId) {
  const student = this.students.find(s => 
    s.student.toString() === studentId.toString()
  );
  
  if (student) {
    student.isActive = false;
    this.currentStrength = this.getActiveStudentsCount();
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to get subject by ID
classSchema.methods.getSubject = function(subjectId) {
  return this.subjects.find(s => 
    s.subject.toString() === subjectId.toString()
  );
};

// Method to add or update subject
classSchema.methods.updateSubject = function(subjectId, teacherId, periodsPerWeek, isOptional = false) {
  const existingSubject = this.getSubject(subjectId);
  
  if (existingSubject) {
    existingSubject.teacher = teacherId;
    existingSubject.periodsPerWeek = periodsPerWeek;
    existingSubject.isOptional = isOptional;
  } else {
    this.subjects.push({
      subject: subjectId,
      teacher: teacherId,
      periodsPerWeek: periodsPerWeek,
      isOptional: isOptional
    });
  }
  
  return this.save();
};

// Method to remove subject
classSchema.methods.removeSubject = function(subjectId) {
  this.subjects = this.subjects.filter(s => 
    s.subject.toString() !== subjectId.toString()
  );
  return this.save();
};

// Static method to find by class ID
classSchema.statics.findByClassId = function(classId) {
  return this.findOne({ classId });
};

// Static method to find by grade and section
classSchema.statics.findByGradeAndSection = function(grade, section) {
  return this.findOne({ grade, section });
};

module.exports = mongoose.model('Class', classSchema);

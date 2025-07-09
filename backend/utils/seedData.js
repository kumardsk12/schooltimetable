const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Room = require('../models/Room');

const seedData = async () => {
  try {
    console.log('🌱 Seeding database with sample data...');
    console.log('🌱 නියැදි දත්ත සමඟ දත්ත සමුදාය වපසරනවා...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing data (optional)
    const clearData = process.argv.includes('--clear');
    if (clearData) {
      await User.deleteMany({ email: { $ne: 'admin@school.lk' } });
      await Teacher.deleteMany({});
      await Subject.deleteMany({});
      await Class.deleteMany({});
      await Room.deleteMany({});
      console.log('🗑️  Cleared existing data');
      console.log('🗑️  පවතින දත්ත ඉවත් කරන ලදී');
    }

    // Sample subjects
    const subjects = [
      {
        subjectId: 'MATH',
        name: { en: 'Mathematics', si: 'ගණිතය' },
        shortName: { en: 'Math', si: 'ගණිත' },
        code: 'MATH',
        category: 'core',
        department: { en: 'Mathematics', si: 'ගණිත අංශය' },
        grades: [
          { grade: 6, isCompulsory: true, defaultPeriodsPerWeek: 6 },
          { grade: 7, isCompulsory: true, defaultPeriodsPerWeek: 6 },
          { grade: 8, isCompulsory: true, defaultPeriodsPerWeek: 6 },
          { grade: 9, isCompulsory: true, defaultPeriodsPerWeek: 6 },
          { grade: 10, isCompulsory: true, defaultPeriodsPerWeek: 6 },
          { grade: 11, isCompulsory: true, defaultPeriodsPerWeek: 6 }
        ],
        color: '#2196F3'
      },
      {
        subjectId: 'SCI',
        name: { en: 'Science', si: 'විද්‍යාව' },
        shortName: { en: 'Sci', si: 'විද්‍යා' },
        code: 'SCI',
        category: 'core',
        department: { en: 'Science', si: 'විද්‍යා අංශය' },
        grades: [
          { grade: 6, isCompulsory: true, defaultPeriodsPerWeek: 4 },
          { grade: 7, isCompulsory: true, defaultPeriodsPerWeek: 4 },
          { grade: 8, isCompulsory: true, defaultPeriodsPerWeek: 4 },
          { grade: 9, isCompulsory: true, defaultPeriodsPerWeek: 4 }
        ],
        color: '#4CAF50'
      },
      {
        subjectId: 'ENG',
        name: { en: 'English', si: 'ඉංග්‍රීසි' },
        shortName: { en: 'Eng', si: 'ඉංග්‍රී' },
        code: 'ENG',
        category: 'language',
        department: { en: 'Languages', si: 'භාෂා අංශය' },
        grades: [
          { grade: 6, isCompulsory: true, defaultPeriodsPerWeek: 5 },
          { grade: 7, isCompulsory: true, defaultPeriodsPerWeek: 5 },
          { grade: 8, isCompulsory: true, defaultPeriodsPerWeek: 5 },
          { grade: 9, isCompulsory: true, defaultPeriodsPerWeek: 5 },
          { grade: 10, isCompulsory: true, defaultPeriodsPerWeek: 5 },
          { grade: 11, isCompulsory: true, defaultPeriodsPerWeek: 5 }
        ],
        color: '#FF9800'
      },
      {
        subjectId: 'SIN',
        name: { en: 'Sinhala', si: 'සිංහල' },
        shortName: { en: 'Sin', si: 'සිං' },
        code: 'SIN',
        category: 'language',
        department: { en: 'Languages', si: 'භාෂා අංශය' },
        grades: [
          { grade: 6, isCompulsory: true, defaultPeriodsPerWeek: 5 },
          { grade: 7, isCompulsory: true, defaultPeriodsPerWeek: 5 },
          { grade: 8, isCompulsory: true, defaultPeriodsPerWeek: 5 },
          { grade: 9, isCompulsory: true, defaultPeriodsPerWeek: 5 },
          { grade: 10, isCompulsory: true, defaultPeriodsPerWeek: 5 },
          { grade: 11, isCompulsory: true, defaultPeriodsPerWeek: 5 }
        ],
        color: '#E91E63'
      },
      {
        subjectId: 'HIST',
        name: { en: 'History', si: 'ඉතිහාසය' },
        shortName: { en: 'Hist', si: 'ඉති' },
        code: 'HIST',
        category: 'core',
        department: { en: 'Social Studies', si: 'සමාජ අධ්‍යයන අංශය' },
        grades: [
          { grade: 6, isCompulsory: true, defaultPeriodsPerWeek: 3 },
          { grade: 7, isCompulsory: true, defaultPeriodsPerWeek: 3 },
          { grade: 8, isCompulsory: true, defaultPeriodsPerWeek: 3 },
          { grade: 9, isCompulsory: true, defaultPeriodsPerWeek: 3 }
        ],
        color: '#795548'
      }
    ];

    // Sample rooms
    const rooms = [
      {
        roomId: 'R001',
        name: { en: 'Main Hall', si: 'ප්‍රධාන ශාලාව' },
        number: '001',
        building: { en: 'Main Building', si: 'ප්‍රධාන ගොඩනැගිල්ල' },
        floor: 1,
        type: 'classroom',
        capacity: 40,
        facilities: {
          hasProjector: true,
          hasWhiteboard: true,
          hasAirConditioning: false
        }
      },
      {
        roomId: 'R002',
        name: { en: 'Science Lab', si: 'විද්‍යා රසායනාගාරය' },
        number: '002',
        building: { en: 'Science Block', si: 'විද්‍යා කොටස' },
        floor: 1,
        type: 'laboratory',
        capacity: 30,
        facilities: {
          hasProjector: true,
          hasWhiteboard: true,
          hasAirConditioning: true
        }
      },
      {
        roomId: 'R003',
        name: { en: 'Computer Lab', si: 'පරිගණක රසායනාගාරය' },
        number: '003',
        building: { en: 'IT Block', si: 'තොරතුරු තාක්ෂණ කොටස' },
        floor: 2,
        type: 'computer-lab',
        capacity: 25,
        facilities: {
          hasProjector: true,
          hasComputers: true,
          computerCount: 25,
          hasAirConditioning: true,
          hasInternet: true
        }
      }
    ];

    // Sample classes
    const classes = [
      {
        classId: 'CLS6A',
        name: { en: 'Grade 6A', si: '6 ශ්‍රේණිය අ' },
        grade: 6,
        section: 'A',
        stream: 'general',
        capacity: 35,
        academicYear: '2024',
        term: '1',
        schedule: {
          periodsPerDay: 8,
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          startTime: '07:30',
          endTime: '13:30'
        }
      },
      {
        classId: 'CLS7A',
        name: { en: 'Grade 7A', si: '7 ශ්‍රේණිය අ' },
        grade: 7,
        section: 'A',
        stream: 'general',
        capacity: 35,
        academicYear: '2024',
        term: '1',
        schedule: {
          periodsPerDay: 8,
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          startTime: '07:30',
          endTime: '13:30'
        }
      }
    ];

    // Insert subjects
    for (const subjectData of subjects) {
      const existingSubject = await Subject.findOne({ subjectId: subjectData.subjectId });
      if (!existingSubject) {
        await Subject.create(subjectData);
        console.log(`✅ Created subject: ${subjectData.name.en}`);
      }
    }

    // Insert rooms
    for (const roomData of rooms) {
      const existingRoom = await Room.findOne({ roomId: roomData.roomId });
      if (!existingRoom) {
        await Room.create(roomData);
        console.log(`✅ Created room: ${roomData.name.en}`);
      }
    }

    // Insert classes
    for (const classData of classes) {
      const existingClass = await Class.findOne({ classId: classData.classId });
      if (!existingClass) {
        await Class.create(classData);
        console.log(`✅ Created class: ${classData.name.en}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('🎉 දත්ත සමුදාය වපසරනවා සාර්ථකව සම්පූර්ණ විය!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('❌ දත්ත සමුදාය වපසරනවේ දෝෂය:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;

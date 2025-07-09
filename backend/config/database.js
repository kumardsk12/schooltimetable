const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB සම්බන්ධ කරන ලදී: ${conn.connection.host}`);

    // Create default admin user if it doesn't exist
    await createDefaultAdmin();

  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('MongoDB සම්බන්ධතා දෝෂය:', error.message);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    const User = require('../models/User');
    
    // Check if admin user exists
    const adminExists = await User.findOne({ 
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@school.lk' 
    });

    if (!adminExists) {
      const defaultAdmin = new User({
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@school.lk',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
        name: {
          en: 'System Administrator',
          si: 'පද්ධති පරිපාලක'
        },
        role: 'admin',
        isActive: true,
        emailVerified: true,
        preferences: {
          language: 'si',
          theme: 'light',
          notifications: {
            email: true,
            push: true
          }
        }
      });

      await defaultAdmin.save();
      console.log('✅ Default admin user created');
      console.log('✅ පෙරනිමි පරිපාලක පරිශීලකයා සාදන ලදී');
      console.log(`📧 Email: ${defaultAdmin.email}`);
      console.log(`🔑 Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}`);
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
    console.error('පෙරනිමි පරිපාලක සෑදීමේ දෝෂය:', error.message);
  }
};

module.exports = connectDB;

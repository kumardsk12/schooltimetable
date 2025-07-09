# School Timetable Management System - Setup Guide
## පාසල් කාලසටහන් කළමනාකරණ පද්ධතිය - සැකසුම් මාර්ගෝපදේශය

This guide will help you set up and run the School Timetable Management System on your local machine.

## 🔧 Prerequisites / පූර්ව අවශ්‍යතා

### Required Software / අවශ්‍ය මෘදුකාංග
1. **Node.js 16+** - [Download](https://nodejs.org/)
2. **MongoDB 4.4+** - [Download](https://www.mongodb.com/try/download/community)
3. **Git** - [Download](https://git-scm.com/)

### Optional / විකල්ප
- **MongoDB Compass** - GUI for MongoDB
- **Postman** - API testing
- **VS Code** - Recommended code editor

## 🚀 Quick Setup / ඉක්මන් සැකසුම්

### 1. Clone the Repository / ගබඩාව ක්ලෝන් කරන්න
```bash
git clone https://github.com/kumardsk12/schooltimetable.git
cd schooltimetable
```

### 2. Run Setup Script / සැකසුම් ස්ක්‍රිප්ට් ධාවනය කරන්න
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Configure Environment / පරිසරය වින්‍යාස කරන්න
Edit `backend/.env` with your MongoDB connection string:
```bash
nano backend/.env
```

Update the MongoDB URI:
```env
MONGODB_URI=mongodb://localhost:27017/schooltimetable
```

### 4. Start the Application / යෙදුම ආරම්භ කරන්න
```bash
npm run dev
```

## 📋 Manual Setup / අතින් සැකසුම්

If the automatic setup doesn't work, follow these steps:

### 1. Install Dependencies / පරායත්තතා ස්ථාපනය
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Environment Configuration / පරිසර වින්‍යාසය
```bash
# Copy environment files
cp backend/.env.example backend/.env
echo "REACT_APP_API_URL=http://localhost:5000/api" > frontend/.env
```

### 3. Database Setup / දත්ත සමුදාය සැකසුම්
```bash
# Start MongoDB (if not running)
sudo systemctl start mongod

# Seed sample data (optional)
npm run seed
```

### 4. Start Development Servers / සංවර්ධන සේවාදායක ආරම්භ කරන්න
```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run server  # Backend only
npm run client  # Frontend only
```

## 🌐 Access the Application / යෙදුමට ප්‍රවේශ වන්න

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 👤 Default Login / පෙරනිමි පිවිසුම්

```
Email: admin@school.lk
Password: admin123
Language: සිංහල (Sinhala)
```

## 🗂️ Project Structure / ව්‍යාපෘති ව්‍යුහය

```
schooltimetable/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database & app configuration
│   ├── middleware/         # Authentication & validation
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── utils/              # Helper functions
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── i18n/           # Translations
│   │   ├── pages/          # Route components
│   │   ├── services/       # API calls
│   │   └── types/          # TypeScript definitions
├── setup.sh               # Automated setup script
└── package.json           # Root package configuration
```

## 🔧 Available Scripts / ලබා ගත හැකි ස්ක්‍රිප්ට්

```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm run test         # Run tests
npm run seed         # Seed sample data
npm run seed-clear   # Clear and seed data
```

## 🐛 Troubleshooting / ගැටළු නිරාකරණය

### MongoDB Connection Issues / MongoDB සම්බන්ධතා ගැටළු
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod
```

### Port Already in Use / වරාය දැනටමත් භාවිතයේ
```bash
# Kill process on port 5000
sudo lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
sudo lsof -ti:3000 | xargs kill -9
```

### Permission Issues / අවසර ගැටළු
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Clear Node Modules / Node Modules ඉවත් කරන්න
```bash
# Remove all node_modules
rm -rf node_modules backend/node_modules frontend/node_modules

# Reinstall
npm run install-all
```

## 🔒 Security Notes / ආරක්ෂක සටහන්

1. **Change default passwords** in production
2. **Update JWT secrets** in `.env`
3. **Use HTTPS** in production
4. **Configure firewall** properly
5. **Regular backups** of MongoDB

## 📱 Mobile Access / ජංගම ප්‍රවේශය

The application is responsive and works on mobile devices. For best experience:
- Use Chrome or Safari on mobile
- Enable JavaScript
- Ensure stable internet connection

## 🌍 Language Support / භාෂා සහාය

- **Primary**: සිංහල (Sinhala) - Full Unicode support
- **Secondary**: English
- **Fonts**: Noto Sans Sinhala for proper rendering
- **Toggle**: Language switcher in header

## 📊 Sample Data / නියැදි දත්ත

The system includes sample data for:
- 5 subjects (Math, Science, English, Sinhala, History)
- 3 rooms (Classroom, Science Lab, Computer Lab)
- 2 classes (Grade 6A, Grade 7A)
- Default admin user

## 🔄 Updates / යාවත්කාලීන

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm run install-all

# Restart application
npm run dev
```

## 📞 Support / සහාය

For issues and questions:
- **GitHub Issues**: [Report bugs](https://github.com/kumardsk12/schooltimetable/issues)
- **Documentation**: Check README.md
- **Email**: support@schooltimetable.lk

## 🎯 Next Steps / ඊළඟ පියවර

1. **Customize school information** in settings
2. **Add teachers, classes, and subjects**
3. **Configure timetable periods**
4. **Generate your first timetable**
5. **Set up user accounts**

---

**Happy Scheduling! / සුභ කාලසටහන් සැකසීමක්!** 🎓

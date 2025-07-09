# School Timetable Management System
## පාසල් කාලසටහන් කළමනාකරණ පද්ධතිය

A comprehensive, teacher-friendly web application for school timetable creation, management, and publishing with native Sinhala language support.

## 🌟 Features

### 👥 User Roles & Access
- **Admin**: Complete system management, timetable generation, user management
- **Teacher**: View personal timetable, mark availability, manage substitutions
- **Student/Parent**: View class timetables and substitution notifications

### 🌐 Language Support
- **Default**: සිංහල (Sinhala) with full Unicode support
- **Secondary**: English with easy toggle
- All UI elements, notifications, and PDF exports in both languages

### 📊 Core Functionality
1. **Auto-scheduling Engine**: Intelligent timetable generation with conflict detection
2. **Manual Editing**: Drag-and-drop interface for fine-tuning schedules
3. **Substitution Management**: Easy absence reporting and replacement suggestions
4. **Room & Resource Booking**: Availability tracking and booking system
5. **Comprehensive Reporting**: Printable timetables, workload analysis, utilization reports
6. **Real-time Notifications**: Instant updates for schedule changes
7. **Mobile Responsive**: Works seamlessly on all devices
8. **Calendar Integration**: Export to Google Calendar, Outlook, iCal

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with role-based access control
- **Real-time**: Socket.IO for live updates
- **PDF Generation**: Puppeteer for reports
- **Email**: Nodemailer for notifications

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) with custom Sinhala theme
- **State Management**: React Query + Context API
- **Routing**: React Router v6
- **Internationalization**: react-i18next
- **Drag & Drop**: react-beautiful-dnd
- **Charts**: Recharts for analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kumardsk12/schooltimetable.git
   cd schooltimetable
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   
   # Frontend environment (optional)
   cd ../frontend
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

4. **Start the application**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend development server on http://localhost:3000

### Default Admin Account
- **Email**: admin@school.lk
- **Password**: admin123
- **Language**: සිංහල (Sinhala)

## 📁 Project Structure

```
schooltimetable/
├── backend/                 # Node.js/Express API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth, validation, logging
│   ├── services/           # Business logic
│   ├── utils/              # Helpers, scheduling engine
│   └── config/             # Database, environment config
├── frontend/               # React application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API calls
│   │   ├── types/          # TypeScript definitions
│   │   ├── utils/          # Helper functions
│   │   └── i18n/           # Sinhala/English translations
├── shared/                 # Common types/interfaces
└── docs/                   # Documentation
```

## 🎯 Key Features Implementation

### Timetable Generation
- **Constraint-based scheduling**: Considers teacher availability, room capacity, subject requirements
- **Conflict detection**: Real-time validation with detailed conflict reports
- **Manual override**: Drag-and-drop editing with automatic conflict checking
- **Multiple views**: Class-wise, teacher-wise, room-wise, subject-wise

### Sinhala Language Support
- **Native fonts**: Noto Sans Sinhala for proper rendering
- **Bidirectional text**: Proper handling of mixed Sinhala-English content
- **PDF generation**: Sinhala-compatible PDF exports
- **Input methods**: Support for Sinhala keyboard input

### Substitution System
- **Absence reporting**: Teachers can mark unavailability
- **Auto-suggestions**: System suggests qualified substitute teachers
- **Notification system**: Real-time alerts to affected parties
- **Approval workflow**: Admin approval for substitutions

### Responsive Design
- **Mobile-first**: Optimized for smartphones and tablets
- **Touch-friendly**: Large touch targets for mobile interaction
- **Offline capability**: Basic functionality works offline
- **Progressive Web App**: Can be installed on mobile devices

## 📱 Mobile Features

- **Touch-optimized timetable grid**: Easy navigation on small screens
- **Swipe gestures**: Navigate between days and periods
- **Push notifications**: Real-time alerts for schedule changes
- **Offline viewing**: Cached timetables available without internet
- **Quick actions**: Fast access to common tasks

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Granular permissions for different user types
- **Rate limiting**: Protection against brute force attacks
- **Input validation**: Comprehensive server-side validation
- **Audit logging**: Track all user actions for accountability
- **Session management**: Automatic logout on inactivity

## 📊 Reporting & Analytics

### Available Reports
- **Class Timetables**: Printable A4 landscape format
- **Teacher Workload**: Hours distribution and free periods
- **Room Utilization**: Occupancy rates and availability
- **Subject Distribution**: Periods allocation across grades
- **Substitution Summary**: Absence patterns and coverage
- **Conflict Analysis**: Scheduling issues and resolutions

### Export Formats
- **PDF**: High-quality printable documents
- **Excel**: Spreadsheet format for further analysis
- **CSV**: Data export for external systems
- **HTML**: Web-friendly format for sharing
- **iCal**: Calendar format for import into calendar apps

## 🛠️ Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Building for Production
```bash
# Build frontend
cd frontend && npm run build

# Start production server
cd backend && npm start
```

### Database Seeding
```bash
cd backend
npm run seed
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Noto Sans Sinhala** font by Google Fonts
- **Material-UI** for the component library
- **aSc TimeTables** for feature inspiration
- Sri Lankan education system requirements

## 📞 Support

For support and questions:
- **Email**: support@schooltimetable.lk
- **Documentation**: [Wiki](https://github.com/kumardsk12/schooltimetable/wiki)
- **Issues**: [GitHub Issues](https://github.com/kumardsk12/schooltimetable/issues)

---

**Built with ❤️ for Sri Lankan schools**
**ශ්‍රී ලංකා පාසල් සඳහා ❤️ සමඟ නිර්මාණය කරන ලදී**

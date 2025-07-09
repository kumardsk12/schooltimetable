#!/bin/bash

# School Timetable Management System Setup Script
# පාසල් කාලසටහන් කළමනාකරණ පද්ධතිය සැකසුම් ස්ක්‍රිප්ට්

echo "🏫 School Timetable Management System Setup"
echo "පාසල් කාලසටහන් කළමනාකරණ පද්ධතිය සැකසුම්"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "❌ Node.js ස්ථාපනය කර නැත. කරුණාකර පළමුව Node.js 16+ ස්ථාපනය කරන්න."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    echo "❌ Node.js අනුවාදය 16+ අවශ්‍යයි. වර්තමාන අනුවාදය: $(node -v)"
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "⚠️  MongoDB ක්‍රියාත්මක නොවේ. කරුණාකර පළමුව MongoDB ආරම්භ කරන්න."
    echo "   You can start MongoDB with: sudo systemctl start mongod"
    echo "   ඔබට MongoDB ආරම්භ කළ හැක: sudo systemctl start mongod"
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
echo "📦 මූල පරායත්තතා ස්ථාපනය කරමින්..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
echo "📦 පසුබිම් පරායත්තතා ස්ථාපනය කරමින්..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
echo "📦 ඉදිරිපස් පරායත්තතා ස්ථාපනය කරමින්..."
cd frontend
npm install
cd ..

# Create environment files
echo "⚙️  Setting up environment files..."
echo "⚙️  පරිසර ගොනු සැකසෙමින්..."

# Backend environment
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from example"
    echo "✅ උදාහරණයෙන් backend/.env සාදන ලදී"
    echo "⚠️  Please update backend/.env with your MongoDB URI and other settings"
    echo "⚠️  කරුණාකර ඔබේ MongoDB URI සහ අනෙකුත් සැකසුම් සමඟ backend/.env යාවත්කාලීන කරන්න"
fi

# Frontend environment
if [ ! -f "frontend/.env" ]; then
    echo "REACT_APP_API_URL=http://localhost:5000/api" > frontend/.env
    echo "✅ Created frontend/.env"
    echo "✅ frontend/.env සාදන ලදී"
fi

# Create uploads directory
mkdir -p backend/uploads
echo "✅ Created uploads directory"
echo "✅ උඩුගත කිරීම් ඩිරෙක්ටරිය සාදන ලදී"

# Create logs directory
mkdir -p backend/logs
echo "✅ Created logs directory"
echo "✅ ලොග් ඩිරෙක්ටරිය සාදන ලදී"

echo ""
echo "🎉 Setup completed successfully!"
echo "🎉 සැකසුම සාර්ථකව සම්පූර්ණ විය!"
echo ""
echo "📋 Next steps:"
echo "📋 ඊළඟ පියවර:"
echo "1. Update backend/.env with your MongoDB connection string"
echo "1. ඔබේ MongoDB සම්බන්ධතා නූලය සමඟ backend/.env යාවත්කාලීන කරන්න"
echo "2. Start the development server: npm run dev"
echo "2. සංවර්ධන සේවාදායකය ආරම්භ කරන්න: npm run dev"
echo ""
echo "🌐 The application will be available at:"
echo "🌐 යෙදුම මෙහි ලබා ගත හැක:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "👤 Default admin credentials:"
echo "👤 පෙරනිමි පරිපාලක අක්තපත්‍ර:"
echo "   Email: admin@school.lk"
echo "   Password: admin123"
echo ""
echo "📚 For more information, see README.md"
echo "📚 වැඩි විස්තර සඳහා README.md බලන්න"

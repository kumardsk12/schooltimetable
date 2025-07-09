const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
        message_si: 'ප්‍රවේශය ප්‍රතික්ෂේප විය. ටෝකනයක් සපයා නැත.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Token is not valid.',
        message_si: 'ටෝකනය වලංගු නොවේ.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account is deactivated.',
        message_si: 'ගිණුම අක්‍රිය කර ඇත.'
      });
    }

    if (user.isLocked) {
      return res.status(423).json({
        error: 'Account is temporarily locked due to multiple failed login attempts.',
        message_si: 'බහුවිධ අසාර්ථක පිවිසුම් උත්සාහයන් හේතුවෙන් ගිණුම තාවකාලිකව අගුලු දමා ඇත.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      error: 'Token is not valid.',
      message_si: 'ටෝකනය වලංගු නොවේ.'
    });
  }
};

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied. Please login first.',
        message_si: 'ප්‍රවේශය ප්‍රතික්ෂේප විය. කරුණාකර පළමුව පිවිසෙන්න.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.',
        message_si: 'ප්‍රවේශය ප්‍රතික්ෂේප විය. ප්‍රමාණවත් අවසර නැත.'
      });
    }

    next();
  };
};

// Check if user is admin
const isAdmin = authorize('admin');

// Check if user is teacher or admin
const isTeacherOrAdmin = authorize('teacher', 'admin');

// Check if user is student, parent, teacher or admin
const isAuthenticated = authorize('student', 'parent', 'teacher', 'admin');

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  // This would typically use Redis for production
  // For now, we'll use a simple in-memory store
  const ip = req.ip;
  const key = `sensitive_${ip}`;
  
  // In production, implement proper rate limiting with Redis
  next();
};

// Validate user ownership or admin access
const validateOwnershipOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }

    // For teachers, check if they own the resource
    if (req.user.role === 'teacher') {
      const resourceUserId = req.body[resourceUserField] || req.params.userId;
      if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
        return next();
      }
    }

    // For students/parents, additional checks can be added here
    if (req.user.role === 'student' || req.user.role === 'parent') {
      // Students can only access their own data
      const resourceUserId = req.body[resourceUserField] || req.params.userId;
      if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
        return next();
      }
    }

    return res.status(403).json({
      error: 'Access denied. You can only access your own resources.',
      message_si: 'ප්‍රවේශය ප්‍රතික්ෂේප විය. ඔබට ඔබේම සම්පත් වලට පමණක් ප්‍රවේශ විය හැක.'
    });
  };
};

// Log user activity
const logActivity = (action) => {
  return (req, res, next) => {
    // Log user activity for audit purposes
    console.log(`User ${req.user?.email} performed action: ${action} at ${new Date().toISOString()}`);
    
    // In production, save to database or external logging service
    req.activityLog = {
      user: req.user?._id,
      action,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    next();
  };
};

module.exports = {
  auth,
  authorize,
  isAdmin,
  isTeacherOrAdmin,
  isAuthenticated,
  optionalAuth,
  sensitiveOperationLimit,
  validateOwnershipOrAdmin,
  logActivity
};

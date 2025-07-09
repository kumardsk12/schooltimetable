import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Chip
} from '@mui/material';
import {
  Dashboard,
  Schedule,
  Person,
  Class,
  Subject,
  Room,
  SwapHoriz,
  Assessment,
  Settings,
  School
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  onItemClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const menuItems = [
    {
      key: 'dashboard',
      label: t('navigation.dashboard'),
      icon: <Dashboard />,
      path: '/dashboard',
      roles: ['admin', 'teacher', 'student', 'parent']
    },
    {
      key: 'timetable',
      label: t('navigation.timetable'),
      icon: <Schedule />,
      path: '/timetable',
      roles: ['admin', 'teacher']
    },
    {
      key: 'teachers',
      label: t('navigation.teachers'),
      icon: <Person />,
      path: '/teachers',
      roles: ['admin']
    },
    {
      key: 'classes',
      label: t('navigation.classes'),
      icon: <Class />,
      path: '/classes',
      roles: ['admin']
    },
    {
      key: 'subjects',
      label: t('navigation.subjects'),
      icon: <Subject />,
      path: '/subjects',
      roles: ['admin']
    },
    {
      key: 'rooms',
      label: t('navigation.rooms'),
      icon: <Room />,
      path: '/rooms',
      roles: ['admin']
    },
    {
      key: 'substitutions',
      label: t('navigation.substitutions'),
      icon: <SwapHoriz />,
      path: '/substitutions',
      roles: ['admin', 'teacher']
    },
    {
      key: 'reports',
      label: t('navigation.reports'),
      icon: <Assessment />,
      path: '/reports',
      roles: ['admin', 'teacher', 'student', 'parent']
    },
    {
      key: 'settings',
      label: t('navigation.settings'),
      icon: <Settings />,
      path: '/settings',
      roles: ['admin']
    }
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const canAccessItem = (roles: string[]) => {
    return user && roles.includes(user.role);
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name[language] || user.name.en || user.name.si;
  };

  const getRoleLabel = () => {
    if (!user) return '';
    const roleLabels = {
      admin: language === 'si' ? 'පරිපාලක' : 'Admin',
      teacher: language === 'si' ? 'ගුරුවරයා' : 'Teacher',
      student: language === 'si' ? 'ශිෂ්‍යයා' : 'Student',
      parent: language === 'si' ? 'දෙමාපියන්' : 'Parent'
    };
    return roleLabels[user.role] || user.role;
  };

  return (
    <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
      {/* Logo and title */}
      <Toolbar sx={{ px: 3 }}>
        <School sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h6" noWrap component="div" color="primary">
          {language === 'si' ? 'පාසල්' : 'School'}
        </Typography>
      </Toolbar>

      <Divider />

      {/* User info */}
      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" fontWeight="bold">
          {getUserDisplayName()}
        </Typography>
        <Chip
          label={getRoleLabel()}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mt: 0.5 }}
        />
      </Box>

      <Divider />

      {/* Navigation menu */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => {
          if (!canAccessItem(item.roles)) {
            return null;
          }

          return (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleItemClick(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.path) ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          {language === 'si' ? 'අනුවාදය' : 'Version'} 1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;

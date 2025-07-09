import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Language,
  Brightness4,
  Brightness7,
  AccountCircle,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme as useThemeContext } from '../../contexts/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useThemeContext();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'si' ? 'en' : 'si');
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name[language] || user.name.en || user.name.si;
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'primary.main'
      }}
    >
      <Toolbar>
        {/* Menu button for mobile */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* App title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {language === 'si' ? 'පාසල් කාලසටහන්' : 'School Timetable'}
        </Typography>

        {/* Header actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Language toggle */}
          <Tooltip title={t('settings.language')}>
            <IconButton color="inherit" onClick={handleLanguageToggle}>
              <Language />
            </IconButton>
          </Tooltip>

          {/* Theme toggle */}
          <Tooltip title={t('settings.theme')}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title={t('settings.notifications')}>
            <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile menu */}
          <Tooltip title={getUserDisplayName()}>
            <IconButton color="inherit" onClick={handleProfileMenuOpen}>
              {user?.profile?.avatar ? (
                <Avatar
                  src={user.profile.avatar}
                  alt={getUserDisplayName()}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Profile menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleProfileMenuClose}>
            <AccountCircle sx={{ mr: 1 }} />
            {t('navigation.profile')}
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            {t('auth.logout')}
          </MenuItem>
        </Menu>

        {/* Notifications menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleNotificationMenuClose}>
            <Typography variant="body2">
              {language === 'si' ? 'නව ආදේශනයක්' : 'New substitution'}
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleNotificationMenuClose}>
            <Typography variant="body2">
              {language === 'si' ? 'කාලසටහන් යාවත්කාලීන' : 'Timetable updated'}
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleNotificationMenuClose}>
            <Typography variant="body2">
              {language === 'si' ? 'නව පණිවිඩයක්' : 'New message'}
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

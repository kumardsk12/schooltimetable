import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const ProfilePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Box>
      <Typography variant="h4" component="h1" mb={3}>
        {t('profile.title')}
      </Typography>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <AccountCircle sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {t('profile.title')} - Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          User profile management will be available here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProfilePage;

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const SettingsPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Box>
      <Typography variant="h4" component="h1" mb={3}>
        {t('settings.title')}
      </Typography>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Settings sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {t('settings.title')} - Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          System settings and configuration will be available here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SettingsPage;

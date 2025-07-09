import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Schedule, Add } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const TimetablePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('timetable.title')}
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          {t('timetable.create')}
        </Button>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Schedule sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {t('timetable.title')} - Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Advanced timetable management features will be available here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TimetablePage;

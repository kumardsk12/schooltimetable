import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Class, Add } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const ClassesPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('classes.title')}
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          {t('classes.add')}
        </Button>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Class sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {t('classes.title')} - Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Class management features will be available here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ClassesPage;

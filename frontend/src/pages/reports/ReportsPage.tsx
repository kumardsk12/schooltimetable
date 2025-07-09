import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Assessment, Add } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const ReportsPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('reports.title')}
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          {t('reports.generate')}
        </Button>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Assessment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {t('reports.title')} - Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Report generation features will be available here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReportsPage;

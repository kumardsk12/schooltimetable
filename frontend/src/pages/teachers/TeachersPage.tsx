import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Person, Add } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const TeachersPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('teachers.title')}
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          {t('teachers.add')}
        </Button>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Person sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {t('teachers.title')} - Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Teacher management features will be available here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TeachersPage;

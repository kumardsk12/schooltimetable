import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Paper sx={{ p: 6, textAlign: 'center', maxWidth: 500 }}>
        <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          {language === 'si' ? 'පිටුව හමු නොවීය' : 'Page Not Found'}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          {language === 'si' 
            ? 'ඔබ සොයන පිටුව නොපවතී හෝ ඉවත් කර ඇත.'
            : 'The page you are looking for does not exist or has been removed.'
          }
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/dashboard')}
          >
            {language === 'si' ? 'මුල් පිටුවට' : 'Go Home'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            {language === 'si' ? 'ආපසු යන්න' : 'Go Back'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;

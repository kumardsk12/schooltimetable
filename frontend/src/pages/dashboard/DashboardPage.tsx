import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip
} from '@mui/material';
import {
  Dashboard,
  People,
  Class,
  Subject,
  Room,
  Schedule,
  SwapHoriz,
  TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name[language] || user.name.en || user.name.si;
  };

  // Mock data for demonstration
  const stats = [
    {
      title: t('dashboard.totalClasses'),
      value: '24',
      icon: <Class />,
      color: '#1976d2'
    },
    {
      title: t('dashboard.totalTeachers'),
      value: '45',
      icon: <People />,
      color: '#388e3c'
    },
    {
      title: t('dashboard.totalSubjects'),
      value: '18',
      icon: <Subject />,
      color: '#f57c00'
    },
    {
      title: t('dashboard.totalRooms'),
      value: '32',
      icon: <Room />,
      color: '#7b1fa2'
    }
  ];

  const recentActivities = [
    {
      title: language === 'si' ? 'නව ආදේශනයක්' : 'New substitution created',
      subtitle: language === 'si' ? '10A පන්තිය - ගණිතය' : 'Class 10A - Mathematics',
      time: '2 hours ago'
    },
    {
      title: language === 'si' ? 'කාලසටහන් යාවත්කාලීන' : 'Timetable updated',
      subtitle: language === 'si' ? '11B පන්තිය' : 'Class 11B',
      time: '4 hours ago'
    },
    {
      title: language === 'si' ? 'නව ගුරුවරයෙකු එකතු' : 'New teacher added',
      subtitle: language === 'si' ? 'ප්‍රියා සිල්වා - ඉංග්‍රීසි' : 'Priya Silva - English',
      time: '1 day ago'
    }
  ];

  return (
    <Box>
      {/* Welcome header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('dashboard.welcome')}, {getUserDisplayName()}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {language === 'si' 
            ? 'ඔබේ පාසල් කාලසටහන් කළමනාකරණ උපකරණ පුවරුවට සාදරයෙන් පිළිගනිමු'
            : 'Welcome to your school timetable management dashboard'
          }
        </Typography>
      </Box>

      {/* Statistics cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.quickActions')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Schedule />}
                  sx={{ py: 2 }}
                >
                  {t('dashboard.createTimetable')}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SwapHoriz />}
                  sx={{ py: 2 }}
                >
                  {t('dashboard.addSubstitution')}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  sx={{ py: 2 }}
                >
                  {t('dashboard.viewReports')}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<People />}
                  sx={{ py: 2 }}
                >
                  {t('dashboard.manageUsers')}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.recentActivity')}
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem key={index} divider={index < recentActivities.length - 1}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Dashboard />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {activity.subtitle}
                        </Typography>
                        <Chip
                          label={activity.time}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

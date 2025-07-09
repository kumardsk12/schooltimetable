import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import 'react-toastify/dist/ReactToastify.css';

// Import i18n
import './i18n';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeContextProvider } from './contexts/ThemeContext';

// Import components
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load pages
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const TimetablePage = React.lazy(() => import('./pages/timetable/TimetablePage'));
const TeachersPage = React.lazy(() => import('./pages/teachers/TeachersPage'));
const ClassesPage = React.lazy(() => import('./pages/classes/ClassesPage'));
const SubjectsPage = React.lazy(() => import('./pages/subjects/SubjectsPage'));
const RoomsPage = React.lazy(() => import('./pages/rooms/RoomsPage'));
const SubstitutionsPage = React.lazy(() => import('./pages/substitutions/SubstitutionsPage'));
const ReportsPage = React.lazy(() => import('./pages/reports/ReportsPage'));
const SettingsPage = React.lazy(() => import('./pages/settings/SettingsPage'));
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'));
const NotFoundPage = React.lazy(() => import('./pages/error/NotFoundPage'));

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create theme with Sinhala font support
const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans Sinhala',
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'Noto Sans Sinhala, Roboto, Arial, sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          fontFamily: 'Noto Sans Sinhala, Roboto, Arial, sans-serif',
        },
      },
    },
  },
});

// Loading fallback component
const PageLoadingFallback: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="60vh"
  >
    <LoadingSpinner size={60} />
  </Box>
);

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <ThemeContextProvider>
            {({ theme }) => (
              <ThemeProvider theme={createAppTheme(theme)}>
                <CssBaseline />
                <AuthProvider>
                  <Router>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<LoginPage />} />
                        
                        {/* Protected routes */}
                        <Route path="/" element={
                          <ProtectedRoute>
                            <Layout />
                          </ProtectedRoute>
                        }>
                          <Route index element={<Navigate to="/dashboard" replace />} />
                          <Route path="dashboard" element={<DashboardPage />} />
                          
                          {/* Admin and Teacher routes */}
                          <Route path="timetable/*" element={
                            <ProtectedRoute roles={['admin', 'teacher']}>
                              <TimetablePage />
                            </ProtectedRoute>
                          } />
                          
                          {/* Admin only routes */}
                          <Route path="teachers/*" element={
                            <ProtectedRoute roles={['admin']}>
                              <TeachersPage />
                            </ProtectedRoute>
                          } />
                          <Route path="classes/*" element={
                            <ProtectedRoute roles={['admin']}>
                              <ClassesPage />
                            </ProtectedRoute>
                          } />
                          <Route path="subjects/*" element={
                            <ProtectedRoute roles={['admin']}>
                              <SubjectsPage />
                            </ProtectedRoute>
                          } />
                          <Route path="rooms/*" element={
                            <ProtectedRoute roles={['admin']}>
                              <RoomsPage />
                            </ProtectedRoute>
                          } />
                          
                          {/* Teacher and Admin routes */}
                          <Route path="substitutions/*" element={
                            <ProtectedRoute roles={['admin', 'teacher']}>
                              <SubstitutionsPage />
                            </ProtectedRoute>
                          } />
                          
                          {/* All authenticated users */}
                          <Route path="reports/*" element={<ReportsPage />} />
                          <Route path="profile/*" element={<ProfilePage />} />
                          
                          {/* Admin only */}
                          <Route path="settings/*" element={
                            <ProtectedRoute roles={['admin']}>
                              <SettingsPage />
                            </ProtectedRoute>
                          } />
                        </Route>
                        
                        {/* 404 route */}
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </Router>
                  
                  {/* Toast notifications */}
                  <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                  />
                </AuthProvider>
              </ThemeProvider>
            )}
          </ThemeContextProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;

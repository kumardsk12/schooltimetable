import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api/authAPI';
import { User, LoginCredentials, RegisterData } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  // Update axios default headers when token changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
      // Set default authorization header for all API requests
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      localStorage.removeItem('token');
      delete authAPI.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authAPI.post('/auth/login', credentials);
      const { user, token, message_si, message } = response.data;

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });

      // Show success message in user's preferred language
      const successMessage = user.preferences?.language === 'si' ? message_si : message;
      toast.success(successMessage || 'Login successful');

      return true;
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' });
      
      const errorMessage = error.response?.data?.message_si || 
                          error.response?.data?.error || 
                          'Login failed';
      toast.error(errorMessage);
      
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authAPI.post('/auth/register', data);
      const { user, token, message_si, message } = response.data;

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });

      // Show success message in user's preferred language
      const successMessage = user.preferences?.language === 'si' ? message_si : message;
      toast.success(successMessage || 'Registration successful');

      return true;
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' });
      
      const errorMessage = error.response?.data?.message_si || 
                          error.response?.data?.error || 
                          'Registration failed';
      toast.error(errorMessage);
      
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to handle any server-side cleanup
      await authAPI.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if server call fails
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
      toast.info('Logged out successfully');
    }
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      dispatch({ type: 'AUTH_FAILURE' });
      return;
    }

    try {
      dispatch({ type: 'AUTH_START' });
      
      // Set token in headers for this request
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await authAPI.get('/auth/me');
      const { user } = response.data;

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
    } catch (error: any) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      
      // Only show error if it's not a 401 (unauthorized)
      if (error.response?.status !== 401) {
        toast.error('Authentication check failed');
      }
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

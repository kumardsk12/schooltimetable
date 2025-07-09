export interface User {
  id: string;
  email: string;
  name: {
    en: string;
    si: string;
  };
  role: 'admin' | 'teacher' | 'student' | 'parent';
  preferences: {
    language: 'si' | 'en';
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  profile?: {
    phone?: string;
    address?: {
      en?: string;
      si?: string;
    };
    avatar?: string;
    dateOfBirth?: string;
    nic?: string;
  };
  teacherId?: string;
  studentId?: string;
  subjects?: string[];
  classes?: string[];
  children?: string[];
  lastLogin?: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: {
    en: string;
    si: string;
  };
  role: 'admin' | 'teacher' | 'student' | 'parent';
  teacherId?: string;
  studentId?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
  message_si: string;
}

export interface AuthError {
  error: string;
  message_si: string;
  details?: any[];
}

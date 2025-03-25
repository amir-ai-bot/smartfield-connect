
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  phone_number?: string;
  email_verified?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string, phone_number?: string) => Promise<void>;
  isAdmin: () => boolean;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (code: string, password: string) => Promise<void>;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone_number?: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface NewPasswordFormData {
  code: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailFormData {
  code: string;
}

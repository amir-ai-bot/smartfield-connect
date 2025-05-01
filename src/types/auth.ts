
// Define user preferences type
export type UserPreferences = {
  language?: 'fr' | 'en' | 'ar';
  notifications?: {
    email?: boolean;
    app?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
};

// Define user roles
export type UserRole = 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur';

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone_number?: string;
  email_verified?: boolean;
  address?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  preferences?: UserPreferences;
}

// Project data type
export interface ProjectData {
  id: string;
  title: string;
  description?: string;
  status: 'planning' | 'active' | 'completed';
  user_id: string;
  created_at?: string;
  updated_at?: string;
  image?: string;
  crop?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  progress: number;
  isPublic: boolean;
  user_name?: string;
  user_avatar?: string;
}

// Auth response types
export interface AuthResponse {
  user: User | null;
  error: Error | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
}

export interface ForgotPasswordCredentials {
  email: string;
}

export interface ResetPasswordCredentials {
  password: string;
  code: string;
}

export interface VerifyEmailCredentials {
  email: string;
  code: string;
}

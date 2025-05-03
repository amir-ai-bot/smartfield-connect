
export interface UserPreferences {
  language: 'fr' | 'en' | 'ar';
  notifications: {
    email: boolean;
    app: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  avatar?: string;
  phone_number?: string;
  email_verified: boolean;
  address?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  preferences?: UserPreferences;
  display_name?: string; // Added for compatibility
}

export interface Profile {
  id: string;
  email?: string;
  display_name?: string;
  avatar?: string;
  role?: UserRole;
  phone_number?: string;
  address?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  preferences?: UserPreferences;
  name?: string; // Added for compatibility
}

export type UserRole = 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur';

export interface AuthResponse {
  user: User | null;
  error: any;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  phone_number?: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
  code?: string;
}

export interface VerifyEmailFormData {
  code: string;
  email?: string;
}

export interface Rating {
  id: string;
  user_id: string;
  supplier_id: string;
  fournisseur_id?: string; // Added for compatibility
  rating: number;
  comment?: string;
  created_at: string;
  profiles?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'completed';
  user_id: string;
  owner_id?: string; // Added for compatibility
  created_at?: string;
  updated_at?: string;
  image?: string;
  crop: string;
  location: string;
  startDate: string;
  endDate: string;
  start_date?: string; // Added for compatibility
  end_date?: string; // Added for compatibility
  progress: number;
  isPublic: boolean;
  is_public?: boolean; // Added for compatibility
  user_name?: string;
  user_avatar?: string;
  name?: string; // Added for compatibility
  creator_name?: string; // For admin view
  creator_avatar?: string; // For admin view
  creator_email?: string; // For admin view
  crop_type?: string; // Added for compatibility
}

export interface ProjectFormProps {
  onSubmit: (data: Partial<ProjectData>) => void;
  onCancel: () => void;
  project?: ProjectData | null;
  onProjectCreated?: (newProject: ProjectData) => void;
}

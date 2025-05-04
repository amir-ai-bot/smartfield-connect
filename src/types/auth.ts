
// User type definition
export interface User {
  id: string;
  email: string;
  email_verified?: boolean;
  display_name?: string;
  avatar?: string;
  role?: string;
  created_at?: string;
}

// Authentication related types
export interface AuthResponse {
  session: any;
  user: User | null;
  error?: any;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirm_password: string;
  name?: string;
}

export interface ResetPasswordFormData {
  token: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface VerifyEmailFormData {
  email: string;
  token: string;
}

// Project types
export interface ProjectData {
  id: string;
  title: string;
  description?: string;
  image?: string;
  crop?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  progress?: number;
  status: 'planning' | 'active' | 'completed';
  owner_id?: string;
  user_id?: string; // For backward compatibility
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
}

export interface ProjectFormProps {
  project?: ProjectData;
  onSubmit: (data: ProjectData) => void;
  onCancel?: () => void;
}

// Rating types
export interface Rating {
  id?: string;
  user_id: string;
  fournisseur_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at?: string;
}

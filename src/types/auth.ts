
// User type definition
export interface User {
  id: string;
  email: string;
  email_verified?: boolean;
  display_name?: string;
  name?: string; // Add name property
  avatar?: string;
  role?: string;
  created_at?: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  preferences?: UserPreferences;
  updated_at?: string;
}

// User preferences
export interface UserPreferences {
  language?: 'fr' | 'en' | 'ar';
  notifications?: {
    email?: boolean;
    app?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
}

export type UserRole = 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur';

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
  phone_number?: string; // Add phone_number
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
  code?: string; // Add code property
}

// Project types
export interface ProjectData {
  id: string;
  title: string;
  name?: string; // Add name property for compatibility
  description?: string;
  image?: string;
  crop?: string;
  crop_type?: string; // Add for compatibility
  location?: string;
  startDate?: string;
  start_date?: string; // Add for compatibility
  endDate?: string;
  end_date?: string; // Add for compatibility
  progress?: number;
  status: 'planning' | 'active' | 'completed';
  owner_id?: string;
  user_id?: string; // For backward compatibility
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
  isPublic?: boolean; // For compatibility
  // Added extra fields for compatibility with APIs
  creator_name?: string;
  creator_email?: string;
  creator_avatar?: string;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
  timeAgo?: string;
}

export interface ProjectFormProps {
  project?: ProjectData;
  onSubmit: (data: ProjectData | Partial<ProjectData>) => void;
  onCancel?: () => void;
  onProjectCreated?: (project: ProjectData) => void;
}

// Conversation types
export interface ConversationData {
  id: string;
  participant: ParticipantProfile;
  lastMessageAt: string;
  createdAt: string;
  userId: string;
}

export interface ParticipantProfile {
  id: string;
  name: string;
  avatar?: string;
}

export interface MessageData {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read?: boolean;
}

// Rating types
export interface Rating {
  id?: string;
  user_id: string;
  fournisseur_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at?: string;
  user?: {
    id: string;
    name?: string;
    avatar?: string;
  };
}

import { User as SupabaseUser } from '@supabase/supabase-js';

export type Role = 'user' | 'admin' | 'agriculteur' | 'fournisseur' | 'pending_fournisseur';

export interface UserPreferences {
  language: string;
  notifications: {
    email: boolean;
    app: boolean;
  };
  theme: 'light' | 'dark';
}

export interface User extends Omit<SupabaseUser, 'role'> {
  name: string;
  role: Role;
  avatar?: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  preferences: UserPreferences;
  email_verified: boolean;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  preferences: UserPreferences;
  email_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextProps {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  isAdmin: () => boolean;
  isAgriculteur: () => boolean;
  isFournisseur: () => boolean;
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
  isFournisseur: () => boolean;
  isPendingFournisseur: () => boolean;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (code: string, password: string) => Promise<void>;
  becomeFournisseur: () => Promise<void>;
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

export interface ProfileUpdateFormData {
  name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  avatar?: File | null;
}

export interface ProjectData {
  id: string;
  title: string;
  crop: string;
  location: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'active' | 'planning' | 'completed';
  image?: string;
  description?: string;
  user_id: string;
  isPublic?: boolean;
  user_name?: string;
  user_avatar?: string;
}

export const CROP_TYPES = [
  'Blé',
  'Orge',
  'Maïs',
  'Avoine',
  'Tomates',
  'Pommes de terre',
  'Carottes',
  'Oignons',
  'Olives',
  'Agrumes',
  'Dattes',
  'Amandes',
  'Raisins',
  'Figues',
  'Pastèques',
  'Melons',
  'Piments',
  'Concombres',
  'Aubergines',
  'Courgettes',
  'Poivrons',
  'Laitue',
  'Épinards',
  'Haricots',
  'Pois',
  'Lentilles',
  'Fèves',
  'Pois chiches',
  'Tournesol',
  'Colza',
  'Soja',
  'Luzerne',
  'Trèfle',
  'Autre'
];

export interface SupportMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  resolved: boolean;
}

export interface FournisseurRating {
  id: string;
  user_id: string;
  fournisseur_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  fournisseur_id: string;
  created_at: string;
  updated_at: string;
  user?: User;
  fournisseur?: User;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface FournisseurData {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  category: string;
  products: string[];
}

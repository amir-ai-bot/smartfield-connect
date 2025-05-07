export interface User {
  id: string;
  display_name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur';
  phone_number?: string;
  email_verified?: boolean;
  address?: string;
  bio?: string;
  preferences?: {
    language?: 'fr' | 'en' | 'ar';
    notifications?: {
      email?: boolean;
      app?: boolean;
    };
    theme?: 'light' | 'dark' | 'system';
  };
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
  refreshUser: () => Promise<void>;
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
  display_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  avatar?: File | null;
}

export interface UserPreferences {
  language?: 'fr' | 'en' | 'ar';
  notifications?: {
    email?: boolean;
    app?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
}

export interface ProjectData {
  id: string;
  name: string;
  crop: string;
  location: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: 'active' | 'planning' | 'completed';
  image?: string;
  description?: string;
  owner_id: string;
  is_public?: boolean;
  user_display_name?: string;
  user_avatar?: string;
  // For compatibility with existing code
  title?: string;
  startDate?: string;
  endDate?: string;
  user_id?: string;
  user_name?: string;
  isOwnProject?: boolean;
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


export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar?: string;
  role: "user" | "admin" | "fournisseur" | "pending_fournisseur";
  bio?: string;
  address?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  description?: string;
  location: string;
  phone: string;
  email?: string;
  website?: string;
  products?: string[];
  avatar?: string;
  user_id?: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Rating {
  id: string;
  user_id: string;
  supplier_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ProjectData {
  id: string;
  name: string;
  title?: string;
  description?: string;
  status: string;
  image?: string;
  owner_id: string;
  crop?: string;
  location?: string;
  progress?: number;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
  user_name?: string;
  user_avatar?: string;
}

export interface Json {
  [key: string]: any;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  read?: boolean;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
  created_at: string;
}

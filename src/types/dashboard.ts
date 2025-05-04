
export interface ProjectData {
  id: string;
  title: string;
  name?: string;
  description?: string;
  image?: string;
  crop: string;
  crop_type?: string;
  location: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  progress?: number;
  status: 'planning' | 'active' | 'completed';
  owner_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
  isPublic?: boolean;
  // Added extra fields for compatibility with APIs
  creator_name?: string;
  creator_email?: string;
  creator_avatar?: string;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
  timeAgo?: string;
}

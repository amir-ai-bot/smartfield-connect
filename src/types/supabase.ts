
// Media item type for messages
export interface MediaItem {
  id: string;
  message_id: string;
  media_type: "image" | "document" | "audio";
  media_url: string;
  created_at: string;
}

// Add any additional Supabase types you need here

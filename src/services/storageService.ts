
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Function to upload a profile avatar
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      toast.error("Erreur lors du téléchargement de l'avatar");
      throw new Error(uploadError.message);
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      toast.error("Erreur lors de la récupération de l'URL de l'avatar");
      throw new Error("Couldn't get public URL");
    }

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

// Function to delete an old avatar if needed
export const deleteAvatar = async (avatarUrl: string): Promise<void> => {
  if (!avatarUrl || !avatarUrl.includes('avatars')) return;
  
  try {
    // Extract path from the URL
    const urlParts = avatarUrl.split('avatars/');
    if (urlParts.length < 2) return;
    
    const path = urlParts[1];
    if (!path) return;
    
    await supabase.storage
      .from('avatars')
      .remove([path]);
      
  } catch (error) {
    console.error('Error deleting avatar:', error);
    // We don't throw here as this is a cleanup operation
  }
};

// Function to upload a project image
export const uploadProjectImage = async (file: File, userId: string): Promise<string> => {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('projects')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading project image:', uploadError);
      toast.error("Erreur lors du téléchargement de l'image");
      throw new Error(uploadError.message);
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('projects')
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      toast.error("Erreur lors de la récupération de l'URL de l'image");
      throw new Error("Couldn't get public URL");
    }

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading project image:', error);
    throw error;
  }
};

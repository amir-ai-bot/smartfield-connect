
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Upload avatar to storage and return the public URL
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${uuidv4()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL for the file
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    toast.error('Erreur lors du téléchargement de l\'avatar');
    throw error;
  }
};

// Upload project image to storage and return the public URL
export const uploadProjectImage = async (file: File, projectId: string): Promise<string> => {
  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${projectId}-${uuidv4()}.${fileExt}`;
    const filePath = `projects/${fileName}`;

    // Upload file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('projects')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL for the file
    const { data } = supabase.storage
      .from('projects')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading project image:', error);
    toast.error('Erreur lors du téléchargement de l\'image');
    throw error;
  }
};

// Delete a file from storage
export const deleteFile = async (path: string, bucket: string = 'avatars'): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    toast.error('Erreur lors de la suppression du fichier');
    return false;
  }
};

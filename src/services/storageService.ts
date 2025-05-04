
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Upload file to storage
export const uploadFile = async (file: File, bucket: string, folder: string = ''): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${folder ? `${folder}/` : ''}${uuidv4()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    // Get public URL for the uploaded file
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
};

// Upload avatar image
export const uploadAvatar = async (file: File): Promise<string | null> => {
  return uploadFile(file, 'avatars');
};

// Upload project image
export const uploadProjectImage = async (file: File): Promise<string | null> => {
  return uploadFile(file, 'projects');
};

// Delete file from storage
export const deleteFile = async (url: string): Promise<boolean> => {
  try {
    // Extract the path from the URL
    const path = url.split('/').slice(-2).join('/');
    const bucket = url.split('/').slice(-3, -2)[0];
    
    if (!path || !bucket) {
      console.error('Invalid file URL format');
      return false;
    }
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
};

// Delete avatar
export const deleteAvatar = async (url: string): Promise<boolean> => {
  return deleteFile(url);
};

// Upload an image (generic function for components)
export const uploadImage = async (file: File, bucket: string = 'avatars', folder: string = ''): Promise<string | null> => {
  return uploadFile(file, bucket, folder);
};

// Get default project image when none is provided
export const getDefaultProjectImage = (): string => {
  return 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
};

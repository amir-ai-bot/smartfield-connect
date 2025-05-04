
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Upload image to storage
export const uploadImage = async (
  file: File,
  bucket: string = 'projects',
  folder: string = 'images'
): Promise<string | null> => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Error uploading image');
    return null;
  }
};

// Upload project image function
export const uploadProjectImage = async (
  file: File,
  userId: string
): Promise<string | null> => {
  return uploadImage(file, 'projects', `project_images/${userId}`);
};

// Upload avatar function
export const uploadAvatar = async (
  file: File,
  userId: string
): Promise<string | null> => {
  return uploadImage(file, 'avatars', `user_avatars/${userId}`);
};

// Delete image from storage
export const deleteImage = async (
  url: string,
  bucket: string = 'projects'
): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2];
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    toast.error('Error deleting image');
    return false;
  }
};

// Get a default project image
export const getDefaultProjectImage = (): string => {
  return 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1950&q=80';
};

// Get a default user avatar
export const getDefaultUserAvatar = (): string => {
  return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
};

// Upload file to storage (generic function)
export const uploadFile = async (
  file: File,
  bucket: string,
  folder: string
): Promise<string | null> => {
  return uploadImage(file, bucket, folder);
};

// Download file from storage
export const downloadFile = async (
  filePath: string,
  bucket: string
): Promise<Blob | null> => {
  try {
    const { data, error } = await supabase.storage.from(bucket).download(filePath);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error downloading file:', error);
    toast.error('Error downloading file');
    return null;
  }
};

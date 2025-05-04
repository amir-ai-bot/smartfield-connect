
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Upload a file to Supabase storage
export const uploadFile = async (file: File, bucket: string, folder: string = ''): Promise<string | null> => {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder ? `${folder}/` : ''}${uuidv4()}.${fileExt}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.error('Failed to upload file');
    return null;
  }
};

// Delete a file from Supabase storage
export const deleteFile = async (filePath: string, bucket: string): Promise<boolean> => {
  try {
    // Extract file name from URL
    const fileName = filePath.split('/').pop();
    if (!fileName) return false;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get default images for various entity types
export const getDefaultProfileImage = (): string => {
  return 'https://api.dicebear.com/6.x/avataaars/svg?seed=default-user';
};

export const getDefaultProjectImage = (): string => {
  return 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
};

export const getDefaultSupplierImage = (): string => {
  return 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1636&q=80';
};

// Generate a random avatar based on a name
export const generateAvatarUrl = (name: string): string => {
  return `https://api.dicebear.com/6.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
};

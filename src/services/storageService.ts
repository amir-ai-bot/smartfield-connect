
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
    const { error: uploadError, data: uploadData } = await supabase.storage
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

    // Verify the uploaded image is accessible
    try {
      const response = await fetch(data.publicUrl, { method: 'HEAD' });
      if (!response.ok) {
        console.warn(`Uploaded avatar is not accessible: ${data.publicUrl}`);
        throw new Error("Image upload failed - not accessible");
      }
    } catch (e) {
      console.error('Error verifying avatar accessibility:', e);
      throw new Error("Image upload verification failed");
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

// A default list of vegetable images from GitHub - more diverse and appropriate for agriculture
const DEFAULT_PROJECT_IMAGES = [
  'https://raw.githubusercontent.com/agrismartapp/project-images/main/wheat_field.jpg',
  'https://raw.githubusercontent.com/agrismartapp/project-images/main/corn_field.jpg',
  'https://raw.githubusercontent.com/agrismartapp/project-images/main/tomato_plants.jpg',
  'https://raw.githubusercontent.com/agrismartapp/project-images/main/olive_trees.jpg',
  'https://raw.githubusercontent.com/agrismartapp/project-images/main/potato_field.jpg',
  'https://raw.githubusercontent.com/agrismartapp/project-images/main/carrot_harvest.jpg',
  'https://raw.githubusercontent.com/agrismartapp/project-images/main/citrus_orchard.jpg',
  'https://raw.githubusercontent.com/agrismartapp/project-images/main/date_palms.jpg',
];

// Public domain free vegetable images that are actually accessible
const FALLBACK_PROJECT_IMAGES = [
  'https://cdn.pixabay.com/photo/2016/07/23/16/17/wheat-1536987_1280.jpg',
  'https://cdn.pixabay.com/photo/2016/09/21/04/46/barley-field-1684052_1280.jpg',
  'https://cdn.pixabay.com/photo/2018/07/12/13/23/green-onion-3533075_1280.jpg',
  'https://cdn.pixabay.com/photo/2015/09/09/20/17/tomatoes-933207_1280.jpg',
  'https://cdn.pixabay.com/photo/2014/08/06/20/32/potatoes-411975_1280.jpg',
  'https://cdn.pixabay.com/photo/2015/03/14/19/45/suit-673697_1280.jpg',
  'https://cdn.pixabay.com/photo/2018/06/10/17/40/olives-3466908_1280.jpg',
  'https://cdn.pixabay.com/photo/2019/05/27/19/45/watermelon-4233029_1280.jpg',
];

// Get a random default image
export const getDefaultProjectImage = (): string => {
  // First try the GitHub hosted images
  const randomIndex = Math.floor(Math.random() * DEFAULT_PROJECT_IMAGES.length);
  const image = DEFAULT_PROJECT_IMAGES[randomIndex];
  
  // Also prepare a fallback image in case the GitHub one isn't available
  const fallbackIndex = Math.floor(Math.random() * FALLBACK_PROJECT_IMAGES.length);
  const fallbackImage = FALLBACK_PROJECT_IMAGES[fallbackIndex];
  
  // Return the image, with fetch handling fallback in the component
  return image || fallbackImage;
};

// Function to upload a project image
export const uploadProjectImage = async (file: File | null, userId: string): Promise<string> => {
  // If no file is provided, return a default image
  if (!file) {
    return getDefaultProjectImage();
  }
  
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

    // Verify the image is accessible
    try {
      const response = await fetch(data.publicUrl, { method: 'HEAD' });
      if (!response.ok) {
        console.warn(`Uploaded project image is not accessible: ${data.publicUrl}`);
        return getDefaultProjectImage(); // Fallback to default image
      }
    } catch (e) {
      console.error('Error verifying project image accessibility:', e);
      return getDefaultProjectImage(); // Fallback to default image
    }

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading project image:', error);
    return getDefaultProjectImage(); // Fallback to default image
  }
};

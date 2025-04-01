
/**
 * Utility functions for handling images
 */

/**
 * Checks if an image URL is valid by attempting to load it
 * @param url The image URL to check
 * @returns Promise that resolves to true if the image is accessible, false otherwise
 */
export const isImageUrlValid = async (url: string): Promise<boolean> => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn(`Error checking image URL: ${url}`, error);
    return false;
  }
};

/**
 * Gets a fallback image URL based on text
 * @param text Text to use for generating the fallback image
 * @returns URL for a placeholder image
 */
export const getFallbackImageUrl = (text: string): string => {
  const placeholders = [
    "https://images.unsplash.com/photo-1585004607620-ce91fd9e0f5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1599832413454-320a7a35ee8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1603507414391-06fe6162dc65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ];
  
  // Use a hash of the text to consistently select the same image for the same text
  const hashCode = text.split('').reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0);
  }, 0);
  
  const index = Math.abs(hashCode) % placeholders.length;
  return placeholders[index];
};

/**
 * Gets an avatar URL from a name
 * @param name The name to use for the avatar
 * @returns URL for an avatar image
 */
export const getAvatarUrl = (name: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};

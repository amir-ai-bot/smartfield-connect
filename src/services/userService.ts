
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { deleteAvatar } from './storageService';

// Function to fetch a user's profile
export const fetchUserProfile = async (userId: string): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('User profile not found');
  }

  // Convert to our User type - we'll add email_verified later
  const user: User = {
    id: data.id,
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    role: data.role as 'admin' | 'user' | 'fournisseur',
    phone_number: data.phone_number || undefined,
    address: data.address,
    bio: data.bio,
    email_verified: false, // Default to false
  };

  // Check if email is verified
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      user.email_verified = userData.user.email_confirmed_at !== null;
    }
  } catch (e) {
    console.error('Error checking email verification status:', e);
  }

  return user;
};

// Function to update a user's profile
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  // If there's a new avatar and an old one, delete the old one
  if (updates.avatar && updates.avatar !== 'pending-upload') {
    try {
      const { data: currentUser } = await supabase
        .from('profiles')
        .select('avatar')
        .eq('id', userId)
        .single();
      
      if (currentUser?.avatar && currentUser.avatar !== updates.avatar) {
        await deleteAvatar(currentUser.avatar);
      }
    } catch (error) {
      console.error('Error deleting old avatar:', error);
    }
  }
  
  // Filter out non-profile fields and undefined values
  const profileUpdates: any = {
    name: updates.name,
    phone_number: updates.phone_number,
    avatar: updates.avatar,
    role: updates.role,
    address: updates.address,
    bio: updates.bio,
    preferences: updates.preferences,
  };
  
  // Remove undefined values
  Object.keys(profileUpdates).forEach(key => 
    profileUpdates[key] === undefined && delete profileUpdates[key]
  );
  
  // Only update if there are valid profile updates
  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId);
  
    if (error) {
      throw new Error(error.message);
    }
  }
  
  // If email is being updated, update auth credentials
  if (updates.email) {
    const { error } = await supabase.auth.updateUser({
      email: updates.email,
    });
  
    if (error) {
      throw new Error(error.message);
    }
  }
  
  // Return updated profile
  return await fetchUserProfile(userId);
};

// Function to become a fournisseur
export const becomeFournisseur = async (userId: string): Promise<User> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'fournisseur' })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return fetchUserProfile(userId);
};

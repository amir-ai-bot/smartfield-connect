
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { deleteAvatar } from './storageService';
import { toast } from 'sonner';
import { isImageUrlValid, getAvatarUrl } from '@/utils/imageUtils';

// Function to fetch a user's profile
export const fetchUserProfile = async (userId: string): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      throw new Error(error.message);
    }

    if (!data) {
      console.error('User profile not found');
      throw new Error('User profile not found');
    }

    // Convert to our User type - we'll add email_verified later
    const user: User = {
      id: data.id,
      name: data.display_name || data.name, // Handle both display_name and name
      email: data.email,
      avatar: data.avatar,
      role: data.role as 'admin' | 'user' | 'fournisseur',
      phone_number: data.phone_number || undefined,
      address: data.address,
      bio: data.bio,
      email_verified: false, // Default to false
    };

    // Verify if the avatar URL is valid
    if (user.avatar) {
      try {
        const isValid = await isImageUrlValid(user.avatar);
        if (!isValid) {
          console.warn(`Avatar URL is not accessible: ${user.avatar}`);
          user.avatar = user.name ? getAvatarUrl(user.name) : undefined;
        }
      } catch (e) {
        console.warn(`Error checking avatar URL: ${user.avatar}`, e);
        user.avatar = user.name ? getAvatarUrl(user.name) : undefined;
      }
    } else if (user.name) {
      // If no avatar but we have a name, use a generated avatar
      user.avatar = getAvatarUrl(user.name);
    }

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
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    throw error;
  }
};

// Function to update a user's profile
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  try {
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
      display_name: updates.name, // Use display_name instead of name
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
        console.error('Error updating profile:', error.message);
        toast.error("Erreur lors de la mise à jour du profil");
        throw new Error(error.message);
      }
    }

    // If email is being updated, update auth credentials
    if (updates.email) {
      const { error } = await supabase.auth.updateUser({
        email: updates.email,
      });

      if (error) {
        console.error('Error updating email:', error.message);
        toast.error("Erreur lors de la mise à jour de l'email");
        throw new Error(error.message);
      }
    }

    // Return updated profile
    return await fetchUserProfile(userId);
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
};

// Function to become a fournisseur
export const becomeFournisseur = async (userId: string): Promise<User> => {
  try {
    // Get current user role
    const { data: userData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    // Determine the new role based on current role
    let newRole = 'pending_fournisseur';

    // If user is already an admin, we'll keep their admin privileges
    // by setting a special role that indicates both admin and fournisseur
    if (userData?.role === 'admin') {
      newRole = 'admin_fournisseur';
      console.log('Admin becoming fournisseur with role:', newRole);
    }

    // Update the user's role
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Error becoming fournisseur:', error.message);
      toast.error("Erreur lors du changement de rôle");
      throw new Error(error.message);
    }

    // If the user is an admin, we need to create a supplier entry for them
    if (userData?.role === 'admin') {
      try {
        // Import the addSupplier function from supplierService
        const { addSupplier } = await import('./supplierService');

        // Create a supplier entry for the admin
        await addSupplier(
          userId,
          'Administration', // Default category for admin suppliers
          'Non spécifié', // Default location
          ['Services administratifs'], // Default products
          undefined // No phone number by default
        );

        toast.success("Vous êtes maintenant un fournisseur avec privilèges d'administrateur");
      } catch (supplierError) {
        console.error('Error creating supplier entry for admin:', supplierError);
        // Continue even if there's an error creating the supplier entry
      }
    } else {
      toast.success("Votre demande a été soumise et est en attente d'approbation");
    }

    return fetchUserProfile(userId);
  } catch (error) {
    console.error('Error in becomeFournisseur:', error);
    throw error;
  }
};

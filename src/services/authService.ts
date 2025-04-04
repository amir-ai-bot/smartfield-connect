import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { generateRandomCode } from '@/lib/utils';
import { fetchUserProfile, updateUserProfile } from './userService';
import { toast } from 'sonner';

// Function to login a user
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error from Supabase:', error);
      throw new Error(error.message);
    }

    if (!data?.user) {
      throw new Error('User not found');
    }

    // Fetch profile data
    const profile = await fetchUserProfile(data.user.id);
    
    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  } catch (error: any) {
    console.error('Error in login function:', error);
    
    // Check if the user exists by email
    try {
      const { data: userByEmail } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
        
      if (userByEmail) {
        throw new Error('Mot de passe incorrect. Veuillez réessayer.');
      } else {
        throw new Error('Aucun compte trouvé avec cet email. Veuillez vous inscrire.');
      }
    } catch (innerError) {
      console.error('Error checking user email:', innerError);
      // If there's an error checking the email, throw the original error
      throw error;
    }
  }
};

// Function to signup a new user
export const signup = async (
  name: string, 
  email: string, 
  password: string,
  phone_number?: string
): Promise<User> => {
  try {
    // First register the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone_number
        },
        emailRedirectTo: `${window.location.origin}/verify-email`
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.user) {
      throw new Error('Failed to create user');
    }

    // Wait for the trigger to create a profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if profile was created successfully
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile after signup:', profileError);
    }

    // If profile wasn't created by trigger, create it manually
    if (!profileData) {
      console.log('Profile not created by trigger, creating manually');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name,
          email,
          phone_number,
          role: 'user'
        });

      if (insertError) {
        console.error('Error creating profile manually:', insertError);
      }
    }

    // Now fetch the profile safely
    const profile = await fetchUserProfile(data.user.id);
    
    if (!profile) {
      throw new Error('Failed to create or fetch profile');
    }

    // Send the verification email
    const { error: emailError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`
      }
    });

    if (emailError) {
      console.error('Error sending verification email:', emailError);
      throw new Error('Failed to send verification email');
    }

    return profile;
  } catch (error: any) {
    console.error('Error in signup function:', error);
    throw error;
  }
};

// Function to logout a user
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

// Helper function to generate and store email verification code
export const generateEmailVerificationCode = async (userId: string): Promise<string> => {
  try {
    // Generate a random code
    const code = generateRandomCode(6);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Code expires in 24 hours

    // Get user's email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    // Store the verification code
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        user_id: userId,
        code,
        type: 'email_verification',
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error storing verification code:', insertError);
      throw new Error('Failed to store verification code');
    }

    // Send the verification email using signInWithOtp
    const { error: emailError } = await supabase.auth.signInWithOtp({
      email: userData.email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: {
          code: code
        }
      }
    });

    if (emailError) {
      console.error('Error sending verification email:', emailError);
      throw new Error('Failed to send verification email');
    }

    toast.success(`Un code de vérification a été envoyé à votre adresse email.`, {
      duration: 6000
    });
    
    return code;
  } catch (error: any) {
    console.error('Error in generateEmailVerificationCode:', error);
    throw error;
  }
};

// Function to verify email
export const verifyEmail = async (email: string, code: string): Promise<void> => {
  try {
    console.log('Verifying email:', email, 'with code:', code);

    // Get user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userError || !userData) {
      console.error('User not found:', userError);
      throw new Error('User not found');
    }

    console.log('Found user:', userData.id);

    // Verify the code
    const { data: codeData, error: codeError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('user_id', userData.id)
      .eq('code', code)
      .eq('type', 'email_verification')
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (codeError) {
      console.error('Error verifying code:', codeError);
      throw new Error('Error verifying code');
    }

    if (!codeData) {
      console.error('Invalid or expired code');
      throw new Error('Code invalide ou expiré');
    }

    console.log('Code verified successfully:', codeData);

    // Mark the code as used
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', codeData.id);

    if (updateError) {
      console.error('Error marking code as used:', updateError);
      throw new Error('Error marking code as used');
    }

    // Mark email as verified in auth
    const { error: authError } = await supabase.auth.updateUser({
      data: { email_verified: true }
    });

    if (authError) {
      console.error('Error updating auth user:', authError);
      throw new Error('Error updating auth user');
    }

    console.log('Email verified successfully');
    toast.success('Email vérifié avec succès!');
  } catch (error: any) {
    console.error('Error in verifyEmail:', error);
    toast.error(error.message || 'Erreur lors de la vérification de l\'email');
    throw error;
  }
};

// Function to request password reset
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    // Generate a 6-digit code for password reset
    const code = generateRandomCode(6);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Code expires in 24 hours
    
    // Get user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userError || !userData) {
      console.error('User not found:', userError);
      throw new Error('User not found');
    }
    
    // Store the verification code
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        user_id: userData.id,
        code,
        type: 'password_reset',
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error storing reset code:', insertError);
      throw new Error('Failed to store reset code');
    }

    // Send the password reset email using Supabase's built-in method with updated options
    const { error: emailError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password?code=${code}`
    });

    if (emailError) {
      console.error('Error sending password reset email:', emailError);
      throw new Error('Failed to send password reset email');
    }

    toast.success(`Un code de réinitialisation a été envoyé à votre adresse email.`, {
      duration: 6000
    });
  } catch (error: any) {
    console.error('Error in requestPasswordReset:', error);
    throw error;
  }
};

// Function to confirm password reset
export const confirmPasswordReset = async (code: string, newPassword: string): Promise<void> => {
  try {
    console.log('Confirming password reset with code:', code);
    
    // Verify the code
    const { data: codeData, error: codeError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('code', code)
      .eq('type', 'password_reset')
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (codeError) {
      console.error('Error verifying reset code:', codeError);
      throw new Error('Error verifying reset code');
    }

    if (!codeData) {
      console.error('Invalid or expired reset code');
      throw new Error('Code invalide ou expiré');
    }

    // Mark the code as used
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', codeData.id);

    if (updateError) {
      console.error('Error marking code as used:', updateError);
      throw new Error('Error marking code as used');
    }

    // Get the user's email from the profile
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', codeData.user_id)
      .maybeSingle();

    if (userError || !userData || !userData.email) {
      throw new Error('User not found');
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error('Error updating password:', error);
      throw new Error(error.message);
    }
    
    toast.success('Mot de passe réinitialisé avec succès');
  } catch (error: any) {
    console.error('Error in confirmPasswordReset:', error);
    throw error;
  }
};

// Function to create an admin account
export const createAdminAccount = async (
  name: string,
  email: string,
  password: string
): Promise<User> => {
  try {
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'admin'
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.user) {
      throw new Error('Failed to create admin user');
    }

    // Wait for the trigger to create a profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the user's role to admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', data.user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Fetch the updated profile
    const profile = await fetchUserProfile(data.user.id);
    
    return profile;
  } catch (error: any) {
    console.error('Error creating admin account:', error);
    throw error;
  }
};

// Re-export functions from userService, projectService, conversationService
export { 
  fetchUserProfile, 
  updateUserProfile, 
  becomeFournisseur 
} from './userService';

export { 
  createProject,
  getUserProjects,
  getPublicProjects,
  updateProject,
  deleteProject
} from './projectService';

export {
  createConversation,
  sendMessage,
  getConversationMessages,
  getUserConversations,
  markMessagesAsRead,
  toggleFavoriteFournisseur,
  rateFournisseur,
  isFournisseurFavorite,
  getFavoriteFournisseurs
} from './conversationService';

// Function to verify the verification_codes table structure
export const verifyTableStructure = async () => {
  try {
    // Check if the table exists
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error checking table structure:', error);
      throw new Error('Verification codes table does not exist. Please create it using the SQL editor.');
    }
    
    console.log('Table structure verified:', data);
  } catch (error) {
    console.error('Error in verifyTableStructure:', error);
    throw error;
  }
};

// Call this function when the app starts
verifyTableStructure().catch(console.error);

// Function to delete expired verification codes
export const deleteExpiredCodes = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('verification_codes')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error deleting expired codes:', error);
      throw new Error('Failed to delete expired codes');
    }

    console.log('Successfully deleted expired verification codes');
  } catch (error) {
    console.error('Error in deleteExpiredCodes:', error);
    throw error;
  }
};

// Call this function periodically to clean up expired codes
setInterval(deleteExpiredCodes, 1000 * 60 * 60); // Run every hour

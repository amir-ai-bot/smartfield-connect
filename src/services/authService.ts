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

    // Generate and insert verification code
    await generateEmailVerificationCode(data.user.id);

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
  const code = generateRandomCode(6);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Code expires in 24 hours

  const { error } = await supabase
    .from('verification_codes')
    .insert({
      user_id: userId,
      code,
      type: 'email_verification',
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    throw new Error(error.message);
  }

  // In a real app, you would send the code via email here
  console.log(`Email verification code for user ${userId}: ${code}`);
  
  // Display the code via toast so users can see it during testing
  // This is a temporary solution for testing - in production, this would be sent via email
  toast.success(`Code de vérification: ${code}`, {
    duration: 10000 // Show for longer so user can see the code
  });
  
  return code;
};

// Function to verify email
export const verifyEmail = async (email: string, code: string): Promise<void> => {
  // Get user by email
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (userError || !userData) {
    throw new Error('User not found');
  }

  // Verify the code
  const { data, error } = await supabase
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

  if (error || !data) {
    throw new Error('Invalid or expired verification code');
  }

  // Mark the code as used
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('id', data.id);

  // Mark email as verified in auth
  const { error: updateError } = await supabase.auth.updateUser({
    data: { email_verified: true }
  });

  if (updateError) {
    throw new Error(updateError.message);
  }
};

// Function to request password reset
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    // Check if user exists
    const { data: userData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!userData) {
      throw new Error('User not found');
    }

    // Generate and store a random code
    const code = generateRandomCode(6);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Code expires in 1 hour

    const { error: codeError } = await supabase
      .from('verification_codes')
      .insert({
        user_id: userData.id,
        code,
        type: 'password_reset',
        expires_at: expiresAt.toISOString(),
      });

    if (codeError) {
      throw new Error(codeError.message);
    }

    // In a real app, you would send the code via email here
    console.log(`Password reset code for ${email}: ${code}`);
    
    // Display the code to the user for testing purposes
    toast.success(`Code de réinitialisation: ${code}`, {
      duration: 10000 // Show for longer so user can see the code
    });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    throw error;
  }
};

// Function to confirm password reset
export const confirmPasswordReset = async (code: string, newPassword: string): Promise<void> => {
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

  if (codeError || !codeData) {
    throw new Error('Invalid or expired reset code');
  }

  // Mark the code as used
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('id', codeData.id);

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
  const { error } = await supabase.auth.resetPasswordForEmail(
    userData.email,
    { redirectTo: window.location.origin }
  );

  if (error) {
    throw new Error(error.message);
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

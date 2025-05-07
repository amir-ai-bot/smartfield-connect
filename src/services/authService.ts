
import { supabase } from '@/integrations/supabase/client';

export const signUp = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'user'
        }
      }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const updatePassword = async (password: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const updateEmail = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      email
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

export const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return data.user;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Record<string, any>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .rpc('admin_get_all_users');

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

export const verifyUserByAdmin = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('admin_verify_user', { user_id: userId });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error verifying user:', error);
    throw error;
  }
};

export const deleteUserByAdmin = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('admin_delete_user', { user_id: userId });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const createUserByAdmin = async (name: string, email: string, password: string, role: string = 'user') => {
  try {
    const { data, error } = await supabase
      .rpc('admin_create_user', { 
        user_name: name, 
        user_email: email, 
        user_password: password, 
        user_role: role 
      });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUserPasswordByAdmin = async (userId: string, newPassword: string) => {
  try {
    const { data, error } = await supabase
      .rpc('admin_update_user_password', { 
        user_id: userId, 
        new_password: newPassword 
      });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

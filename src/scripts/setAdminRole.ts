import { supabase } from '@/integrations/supabase/client';

export async function setAdminRole() {
  try {
    // Update the user's role to admin in the profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('email', 'yassindhibi100@gmail.com');

    if (updateError) {
      console.error('Failed to update user role:', updateError);
      return false;
    }

    // Get the user's ID from their email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'yassindhibi100@gmail.com')
      .single();

    if (profileError || !profile) {
      console.error('Failed to get user profile:', profileError);
      return false;
    }

    // Update the user's metadata in auth.users
    const { error: metadataError } = await supabase.auth.admin.updateUserById(
      profile.id,
      { user_metadata: { role: 'admin' } }
    );

    if (metadataError) {
      console.error('Failed to update user metadata:', metadataError);
      return false;
    }

    console.log('Successfully set user as admin');
    return true;
  } catch (error) {
    console.error('Error setting user as admin:', error);
    return false;
  }
} 
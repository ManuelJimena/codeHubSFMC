import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Avatar handling functions
export const uploadAvatar = async (file, userId) => {
  try {
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('La imagen no puede ser mayor a 2MB');
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

export const deleteAvatar = async (url) => {
  try {
    if (!url) return;

    // Extract file name from URL
    const fileName = url.split('/').pop();

    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) return null;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    // If profile doesn't exist, create it
    if (!profile) {
      const isAdmin = session.user.email === 'manuel.jimena29@gmail.com';
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{
          id: session.user.id,
          email: session.user.email,
          username: session.user.email.split('@')[0],
          is_admin: isAdmin
        }])
        .select()
        .single();

      if (createError) throw createError;
      return {
        ...session.user,
        ...newProfile
      };
    }

    // Return combined user data
    return {
      ...session.user,
      ...profile
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear local storage and force reload
    window.localStorage.clear();
    window.location.reload();
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
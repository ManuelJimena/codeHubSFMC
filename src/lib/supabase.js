import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  // Use hardcoded values as fallback in development only
  if (import.meta.env.DEV) {
    console.warn('Using fallback Supabase credentials for development only');
  } else {
    throw new Error('Missing Supabase environment variables');
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://trojpsbnoofpoxwbhfhe.supabase.co', 
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyb2pwc2Jub29mcG94d2JoZmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY4MzksImV4cCI6MjA1NjU4MjgzOX0.9IK1s8M1zFsb9LPE0JTfeML7cFrpCz2KhRLyy0pJ_LM', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Habilitamos la detección automática para facilitar el flujo PKCE
      detectSessionInUrl: true,
      storage: window.localStorage,
      flowType: 'pkce', // Usar PKCE para mayor seguridad en OAuth
      debug: import.meta.env.DEV // Habilitar registro de debug en desarrollo
    }
  }
);

// Avatar handling functions
export const uploadAvatar = async (file, userId) => {
  try {
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('La imagen no puede ser mayor a 2MB');
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Delete existing avatar if any
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list('', {
        limit: 1,
        search: userId
      });

    if (existingFiles?.length > 0) {
      await supabase.storage
        .from('avatars')
        .remove([`avatars/${existingFiles[0].name}`]);
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

export const deleteAvatar = async (url) => {
  try {
    if (!url) return;

    const fileName = url.split('/').pop();
    if (!fileName) return;

    const { error } = await supabase.storage
      .from('avatars')
      .remove([`avatars/${fileName}`]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    console.log('Obteniendo sesión de usuario...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error al obtener la sesión:', sessionError);
      throw sessionError;
    }
    
    if (!session?.user) {
      console.log('No hay sesión de usuario activa');
      return null;
    }
    
    console.log('Sesión activa encontrada para:', session.user.email);

    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 es el código cuando no se encuentra el registro
        console.error('Error al obtener el perfil:', profileError);
        throw profileError;
      }

      // If profile doesn't exist, create it
      if (!profile) {
        console.log('Perfil no encontrado, creando uno nuevo');
        const isAdmin = session.user.email === 'manuel.jimena29@gmail.com';
        
        try {
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

          if (createError) {
            console.error('Error al crear el perfil:', createError);
            throw createError;
          }
          
          console.log('Perfil creado correctamente');
          return {
            ...session.user,
            ...newProfile
          };
        } catch (createError) {
          console.error('Error al crear perfil de usuario:', createError);
          // Devolver solo la información de sesión si no podemos crear el perfil
          return {
            ...session.user,
            username: session.user.email.split('@')[0],
            is_admin: session.user.email === 'manuel.jimena29@gmail.com'
          };
        }
      }

      console.log('Perfil recuperado correctamente');
      return {
        ...session.user,
        ...profile
      };
    } catch (profileError) {
      console.error('Error al gestionar el perfil:', profileError);
      // En caso de error con el perfil, devolver al menos la información básica del usuario
      return {
        ...session.user,
        username: session.user.email?.split('@')[0] || 'usuario',
        is_admin: session.user.email === 'manuel.jimena29@gmail.com'
      };
    }
  } catch (error) {
    console.error('Error general al obtener usuario actual:', error);
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear all local storage
    window.localStorage.clear();
    
    // Force page reload to clear any cached data
    window.location.href = '/';
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
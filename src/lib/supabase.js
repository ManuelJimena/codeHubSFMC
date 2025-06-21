import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno de Supabase. Por favor, verifica tu archivo .env.');
  throw new Error('Faltan variables de entorno de Supabase');
}

// SINGLE CLIENT - Exportar desde un único archivo para evitar instancias duplicadas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage          // ← eliminada la línea flowType: 'pkce'
  }
});

// Limpiar el lock al hacer HMR en desarrollo
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    console.log('HMR: Limpiando auto-refresh de Supabase');
    supabase.auth.stopAutoRefresh();
  });
}

// Funciones de manejo de avatares
export const uploadAvatar = async (file, userId) => {
  try {
    // Validar tamaño del archivo (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('La imagen no puede ser mayor a 2MB');
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Eliminar avatar existente si existe
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

    // Subir nuevo avatar
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error al subir el avatar:', error);
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

// FUNCIÓN SIMPLE - No invocar Auth dentro de callbacks
export const getCurrentUser = async () => {
  try {
    console.log('Obteniendo usuario actual...');
    
    // Solo usar getSession() una vez, sin timeouts complejos
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
      // Obtener perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Error al obtener el perfil:', profileError);
      }

      // Si no existe perfil, crear uno
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
          // Devolver información básica si no se puede crear el perfil
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
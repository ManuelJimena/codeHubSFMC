import { createClient } from '@supabase/supabase-js';
import { withAuthLock } from './authLock.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno de Supabase. Por favor, verifica tu archivo .env.');
  throw new Error('Faltan variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce'
  }
});

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

// Función para crear un timeout cancelable
const createCancelableTimeout = (promise, timeoutMs, errorMessage) => {
  let timeoutId;
  
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    timeoutPromise
  ]);
};

// Función para reintentar operaciones con backoff exponencial
const retryWithBackoff = async (operation, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Backoff exponencial: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Intento ${attempt} falló, reintentando en ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const getCurrentUser = async () => {
  try {
    console.log('Obteniendo sesión de usuario...');
    
    // Operación con timeout y reintentos
    const sessionOperation = async () => {
      const { data: { session }, error: sessionError } = await withAuthLock(() => supabase.auth.getSession());
      
      if (sessionError) {
        console.error('Error al obtener la sesión:', sessionError);
        throw sessionError;
      }
      
      return session;
    };

    // Timeout de 30 segundos para la sesión
    const session = await createCancelableTimeout(
      retryWithBackoff(sessionOperation, 2, 1000),
      30000,
      'Timeout al obtener la sesión'
    );
    
    if (!session?.user) {
      console.log('No hay sesión de usuario activa');
      return null;
    }
    
    console.log('Sesión activa encontrada para:', session.user.email);

    try {
      // Operación para obtener el perfil con timeout y reintentos
      const profileOperation = async () => {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error al obtener el perfil:', profileError);
          throw profileError;
        }

        return profile;
      };

      // Timeout de 20 segundos para el perfil
      const profile = await createCancelableTimeout(
        retryWithBackoff(profileOperation, 2, 1000),
        20000,
        'Timeout al obtener el perfil'
      );

      // If profile doesn't exist, create it
      if (!profile) {
        console.log('Perfil no encontrado, creando uno nuevo');
        const isAdmin = session.user.email === 'manuel.jimena29@gmail.com';
        
        try {
          const createProfileOperation = async () => {
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
            
            return newProfile;
          };

          // Timeout de 15 segundos para crear perfil
          const newProfile = await createCancelableTimeout(
            retryWithBackoff(createProfileOperation, 2, 1000),
            15000,
            'Timeout al crear el perfil'
          );
          
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
    
    // Si es un error de timeout, intentar limpiar el estado
    if (error.message.includes('Timeout')) {
      console.log('Timeout detectado, limpiando estado...');
      try {
        // Intentar refrescar la sesión
        await withAuthLock(() => supabase.auth.refreshSession());
      } catch (refreshError) {
        console.error('Error al refrescar sesión:', refreshError);
      }
    }
    
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await withAuthLock(() => supabase.auth.signOut());
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
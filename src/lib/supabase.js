import { createClient } from '@supabase/supabase-js';

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

// Sistema de cola para evitar conflictos de lock en Supabase Auth
class AuthQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.lastSessionCheck = null;
    this.sessionCache = null;
    this.cacheExpiry = null;
  }

  async add(operation) {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const { operation, resolve, reject } = this.queue.shift();
      
      try {
        const result = await operation();
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      // Pequeña pausa entre operaciones para evitar colisiones
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessing = false;
  }

  // Cache de sesión para evitar llamadas innecesarias
  getCachedSession() {
    if (this.sessionCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      return this.sessionCache;
    }
    return null;
  }

  setCachedSession(session) {
    this.sessionCache = session;
    // Cache válido por 30 segundos
    this.cacheExpiry = Date.now() + 30000;
  }

  clearCache() {
    this.sessionCache = null;
    this.cacheExpiry = null;
  }
}

const authQueue = new AuthQueue();

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

// Función principal para obtener usuario actual con sistema de cola
export const getCurrentUser = async () => {
  return authQueue.add(async () => {
    try {
      console.log('Obteniendo usuario actual...');
      
      // Verificar cache primero
      const cachedSession = authQueue.getCachedSession();
      if (cachedSession) {
        console.log('Usando sesión desde cache');
        if (!cachedSession.user) {
          return null;
        }
        
        // Obtener perfil actualizado
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', cachedSession.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.warn('Error al obtener perfil desde cache:', profileError);
          }

          return {
            ...cachedSession.user,
            ...(profile || {
              username: cachedSession.user.email?.split('@')[0] || 'usuario',
              is_admin: cachedSession.user.email === 'manuel.jimena29@gmail.com'
            })
          };
        } catch (profileError) {
          console.warn('Error al obtener perfil:', profileError);
          return {
            ...cachedSession.user,
            username: cachedSession.user.email?.split('@')[0] || 'usuario',
            is_admin: cachedSession.user.email === 'manuel.jimena29@gmail.com'
          };
        }
      }

      // Obtener sesión con timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout al obtener la sesión')), 10000);
      });

      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]);
      
      if (sessionError) {
        console.error('Error al obtener la sesión:', sessionError);
        authQueue.clearCache();
        throw sessionError;
      }
      
      if (!session?.user) {
        console.log('No hay sesión de usuario activa');
        authQueue.clearCache();
        return null;
      }
      
      console.log('Sesión activa encontrada para:', session.user.email);
      
      // Guardar en cache
      authQueue.setCachedSession(session);

      try {
        // Obtener perfil con timeout
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const profileTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout al obtener el perfil')), 8000);
        });

        const { data: profile, error: profileError } = await Promise.race([
          profilePromise,
          profileTimeoutPromise
        ]);

        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('Error al obtener el perfil:', profileError);
        }

        // Si no existe perfil, crear uno
        if (!profile) {
          console.log('Perfil no encontrado, creando uno nuevo');
          const isAdmin = session.user.email === 'manuel.jimena29@gmail.com';
          
          try {
            const createProfilePromise = supabase
              .from('profiles')
              .insert([{
                id: session.user.id,
                email: session.user.email,
                username: session.user.email.split('@')[0],
                is_admin: isAdmin
              }])
              .select()
              .single();

            const createTimeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Timeout al crear el perfil')), 8000);
            });

            const { data: newProfile, error: createError } = await Promise.race([
              createProfilePromise,
              createTimeoutPromise
            ]);
            
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
      authQueue.clearCache();
      
      // Si es un error de timeout, no intentar refrescar para evitar más conflictos
      if (error.message.includes('Timeout')) {
        console.log('Timeout detectado, limpiando cache...');
      }
      
      return null;
    }
  });
};

export const signOut = async () => {
  return authQueue.add(async () => {
    try {
      authQueue.clearCache();
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
  });
};
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, getCurrentUser } from '../lib/supabase';
import toast from 'react-hot-toast';

// Crear contexto y hook
const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

// Utilidades de cache
const USER_CACHE_KEY = 'codehub_user_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const saveUserToCache = (user) => {
  if (!user) {
    localStorage.removeItem(USER_CACHE_KEY);
    return;
  }
  
  try {
    const cacheData = {
      user,
      timestamp: Date.now()
    };
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Error saving user to cache:', error);
  }
};

const getUserFromCache = () => {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (!cached) return null;
    
    const { user, timestamp } = JSON.parse(cached);
    
    // Verificar si el cache no ha expirado
    if (Date.now() - timestamp < CACHE_DURATION) {
      return user;
    }
    
    // Cache expirado, limpiar
    localStorage.removeItem(USER_CACHE_KEY);
    return null;
  } catch (error) {
    console.warn('Error reading user from cache:', error);
    localStorage.removeItem(USER_CACHE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Referencias para evitar estados de carrera
  const refreshInProgress = useRef(false);
  const mountedRef = useRef(true);

  const updateUser = (newUser, isFromCache = false) => {
    if (!mountedRef.current) return;
    
    setUser(newUser);
    
    // Solo guardar en cache si no viene del cache
    if (!isFromCache) {
      saveUserToCache(newUser);
    }
  };

  const refreshUser = async (silent = false) => {
    // Evitar refreshes simultáneos
    if (refreshInProgress.current) {
      console.log('Refresh ya en progreso, saltando...');
      return user;
    }

    try {
      refreshInProgress.current = true;
      
      if (silent) {
        setIsRefreshing(true);
      }
      
      console.log('Refrescando usuario...');
      const currentUser = await getCurrentUser();
      
      if (mountedRef.current) {
        updateUser(currentUser);
        
        if (silent) {
          setIsRefreshing(false);
        }
      }
      
      return currentUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      
      if (mountedRef.current) {
        if (silent) {
          setIsRefreshing(false);
          // En refresh silencioso, mantener usuario actual si hay error
          console.log('Error en refresh silencioso, manteniendo usuario actual');
        } else {
          updateUser(null);
        }
      }
      
      return null;
    } finally {
      refreshInProgress.current = false;
    }
  };

  // Inicialización con cache
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        console.log('Iniciando autenticación...');
        
        // 1. Intentar cargar desde cache primero
        const cachedUser = getUserFromCache();
        if (cachedUser && isMounted) {
          console.log('Usuario cargado desde cache');
          updateUser(cachedUser, true);
          setLoading(false); // Mostrar datos del cache inmediatamente
        }
        
        // 2. Obtener datos frescos en paralelo
        const currentUser = await getCurrentUser();
        
        if (isMounted) {
          updateUser(currentUser);
          setLoading(false);
          setInitialized(true);
          console.log('Inicialización de AuthContext completada');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        
        if (isMounted) {
          // Si hay cache, mantenerlo; si no, limpiar
          const cachedUser = getUserFromCache();
          if (!cachedUser) {
            updateUser(null);
          }
          setLoading(false);
          setInitialized(true);
          console.log('Inicialización de AuthContext completada con errores');
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listener de auth state changes
  useEffect(() => {
    if (!initialized) return;

    let subscription;
    
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event);
        
        switch (event) {
          case 'SIGNED_IN':
            console.log('Usuario ha iniciado sesión');
            // Refresh completo para obtener datos del perfil
            await refreshUser(false);
            break;
            
          case 'SIGNED_OUT':
            console.log('Usuario ha cerrado sesión');
            updateUser(null);
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('Token refrescado automáticamente');
            // Refresh silencioso para mantener UX fluida
            await refreshUser(true);
            break;
            
          case 'USER_UPDATED':
            console.log('Usuario actualizado');
            // Refresh silencioso
            await refreshUser(true);
            break;
        }
      });
      
      subscription = data.subscription;
    } catch (error) {
      console.error('Error setting up auth listener:', error);
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [initialized]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      updateUser(null);
      window.localStorage.clear();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const value = {
    user,
    loading,
    isRefreshing, // Nuevo estado para refreshes silenciosos
    signOut,
    refreshUser: () => refreshUser(false), // Refresh manual (no silencioso)
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false
  };

  // Renderizar loading solo si realmente está cargando y no hay cache
  if (!initialized && loading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Debounce para refreshUser para evitar llamadas múltiples
  let refreshTimeout = null;
  
  const refreshUser = async () => {
    // Cancelar refresh anterior si existe
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
    
    return new Promise((resolve) => {
      refreshTimeout = setTimeout(async () => {
        try {
          console.log('Refrescando usuario...');
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          resolve(currentUser);
        } catch (error) {
          console.error('Error refreshing user:', error);
          setUser(null);
          resolve(null);
        }
      }, 100); // Debounce de 100ms
    });
  };

  // Verificación inicial de sesión
  useEffect(() => {
    let isMounted = true;
    let initTimeout;
    
    const initAuth = async () => {
      try {
        console.log('Iniciando autenticación...');
        
        const currentUser = await getCurrentUser();
        
        console.log('Estado de usuario:', currentUser ? 'Autenticado' : 'No autenticado');
        
        if (isMounted) {
          setUser(currentUser);
          setLoading(false);
          setInitialized(true);
          console.log('Inicialización de AuthContext completada');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        
        if (isMounted) {
          setUser(null);
          setLoading(false);
          setInitialized(true);
          console.log('Inicialización de AuthContext completada con errores');
        }
      }
    };

    // Timeout de seguridad más conservador
    initTimeout = setTimeout(() => {
      if (!initialized && isMounted) {
        console.warn('Timeout de seguridad activado, forzando inicialización');
        setLoading(false);
        setInitialized(true);
        setUser(null);
      }
    }, 15000); // Reducido a 15 segundos

    initAuth();

    return () => {
      isMounted = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, []); // Solo ejecutar una vez

  // Escucha cambios en el estado de autenticación con debouncing
  useEffect(() => {
    if (!initialized) return;

    let subscription;
    let eventTimeout = null;
    
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event);
        
        // Cancelar evento anterior si existe
        if (eventTimeout) {
          clearTimeout(eventTimeout);
        }
        
        // Debounce para evitar múltiples llamadas rápidas
        eventTimeout = setTimeout(async () => {
          switch (event) {
            case 'SIGNED_IN':
              console.log('Usuario ha iniciado sesión');
              await refreshUser();
              break;
            case 'SIGNED_OUT':
              console.log('Usuario ha cerrado sesión');
              setUser(null);
              break;
            case 'TOKEN_REFRESHED':
              console.log('Token refrescado');
              // Solo refrescar si no tenemos usuario o si ha pasado tiempo suficiente
              if (!user) {
                await refreshUser();
              }
              break;
            case 'USER_UPDATED':
              console.log('Usuario actualizado');
              await refreshUser();
              break;
          }
        }, 200); // Debounce de 200ms
      });
      
      subscription = data.subscription;
    } catch (error) {
      console.error('Error setting up auth listener:', error);
    }

    return () => {
      if (eventTimeout) {
        clearTimeout(eventTimeout);
      }
      subscription?.unsubscribe();
    };
  }, [initialized, user]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
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
    signOut,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false
  };

  // Renderizar loading solo si realmente está cargando y no ha pasado mucho tiempo
  if (!initialized) {
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
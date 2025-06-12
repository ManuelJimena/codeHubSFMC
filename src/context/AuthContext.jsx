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

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      return null;
    }
  };

  // Verificación inicial de sesión con timeout más agresivo
  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    
    const initAuth = async () => {
      try {
        console.log('Iniciando autenticación...');
        
        // Timeout más corto para evitar cargas infinitas
        const authPromise = refreshUser();
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Auth timeout')), 3000); // Reducido a 3 segundos
        });
        
        const currentUser = await Promise.race([authPromise, timeoutPromise]);
        
        if (timeoutId) clearTimeout(timeoutId);
        
        console.log('Estado de usuario:', currentUser ? 'Autenticado' : 'No autenticado');
        
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
          console.log('Inicialización de AuthContext completada');
        }
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        console.error('Error initializing auth:', error);
        
        if (isMounted) {
          // En caso de error o timeout, marcar como inicializado de todos modos
          setUser(null);
          setLoading(false);
          setInitialized(true);
          console.log('Inicialización de AuthContext completada con errores');
          
          // Mostrar toast de error solo si es un error de red
          if (error.message.includes('fetch') || error.message.includes('timeout')) {
            toast.error('Problema de conexión. Verifica tu internet y recarga la página.');
          }
        }
      }
    };

    // Timeout de seguridad más agresivo
    const safetyTimeout = setTimeout(() => {
      if (!initialized && isMounted) {
        console.warn('Timeout de seguridad activado, forzando inicialización');
        setLoading(false);
        setInitialized(true);
        setUser(null);
        toast.error('Problema de conexión. Por favor, recarga la página.');
      }
    }, 2000); // Reducido a 2 segundos

    initAuth();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      clearTimeout(safetyTimeout);
    };
  }, []); // Solo ejecutar una vez

  // Escucha cambios en el estado de autenticación
  useEffect(() => {
    if (!initialized) return;

    let subscription;
    
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event);
        
        switch (event) {
          case 'SIGNED_IN':
            await refreshUser();
            break;
          case 'SIGNED_OUT':
            setUser(null);
            break;
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            await refreshUser();
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
          <p className="text-gray-600 dark:text-gray-400">Conectando...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Si esto tarda mucho, verifica tu conexión a internet
          </p>
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
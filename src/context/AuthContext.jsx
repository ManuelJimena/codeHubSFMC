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

  // Verificación inicial de sesión
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        console.log('Iniciando autenticación...');
        const currentUser = await refreshUser();
        console.log('Estado de usuario:', currentUser ? 'Autenticado' : 'No autenticado');
        
        // Solo actualizar el estado si el componente sigue montado
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
          console.log('Inicialización de AuthContext completada');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Incluso en caso de error, debemos marcar como inicializado
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
          console.log('Inicialización de AuthContext completada con errores');
        }
      }
    };

    // Configurar un tiempo máximo para la inicialización
    const timeoutId = setTimeout(() => {
      if (!initialized && isMounted) {
        console.warn('La inicialización está tardando demasiado, forzando renderizado');
        setLoading(false);
        setInitialized(true);
      }
    }, 3000); // 3 segundos máximo para inicializar

    initAuth();

    // Limpieza
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Escucha cambios en el estado de autenticación
  useEffect(() => {
    if (!initialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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

  return (
    <AuthContext.Provider value={value}>
      {initialized ? children : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};
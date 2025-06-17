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
      console.log('Refrescando usuario...');
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

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Solo ejecutar una vez

  // REGLA #1: No invocar Auth dentro del callback
  // Solo setear la sesión, nada más
  useEffect(() => {
    if (!initialized) return;

    let subscription;
    
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event);
        
        // CRÍTICO: Solo setear estado, NO llamar a getCurrentUser() ni otras funciones Auth
        switch (event) {
          case 'SIGNED_IN':
            console.log('Usuario ha iniciado sesión');
            // Solo setear la sesión básica, el refresh se hará desde fuera
            if (session?.user) {
              setUser({
                ...session.user,
                username: session.user.email?.split('@')[0] || 'usuario',
                is_admin: session.user.email === 'manuel.jimena29@gmail.com'
              });
            }
            break;
          case 'SIGNED_OUT':
            console.log('Usuario ha cerrado sesión');
            setUser(null);
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refrescado automáticamente');
            // No hacer nada, el SDK ya maneja el refresh
            break;
          case 'USER_UPDATED':
            console.log('Usuario actualizado');
            // Solo actualizar si tenemos la información básica
            if (session?.user) {
              setUser(prevUser => ({
                ...session.user,
                ...prevUser, // Mantener datos del perfil si los tenemos
                username: prevUser?.username || session.user.email?.split('@')[0] || 'usuario',
                is_admin: prevUser?.is_admin || session.user.email === 'manuel.jimena29@gmail.com'
              }));
            }
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

  // Renderizar loading solo si realmente está cargando
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
import { createContext, useContext, useState, useEffect } from 'react';
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
      console.error('Error al refrescar usuario:', error);
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
        console.error('Error al inicializar autenticación:', error);

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

  // Listener global de cambios de Auth
  useEffect(() => {
    if (!initialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Cambio de estado de autenticación:', event);

      switch (event) {
        case 'SIGNED_IN': {
          console.log('Usuario ha iniciado sesión');
          if (session?.user) {
            // Si ya tenemos usuario, no lo pisamos; si no, establecemos datos mínimos
            setUser(prevUser => {
              if (prevUser) return prevUser;
              return {
                ...session.user,
                username: session.user.email?.split('@')[0] || 'usuario',
                is_admin: session.user.email === 'manuel.jimena29@gmail.com'
              };
            });
            // Refrescar perfil completo fuera del lock interno de Supabase
            setTimeout(() => {
              refreshUser().catch(console.error);
            }, 0);
          }
          break;
        }
        case 'SIGNED_OUT':
          console.log('Usuario ha cerrado sesión');
          setUser(null);
          break;
        case 'TOKEN_REFRESHED':
          console.log('Token refrescado automáticamente');
          // Vuelve a recuperar el perfil una vez liberado el lock
          setTimeout(() => {
            refreshUser().catch(console.error);
          }, 0);
          break;
        case 'USER_UPDATED':
          console.log('Usuario actualizado');
          if (session?.user) {
            setUser(prevUser => ({
              ...prevUser, // conserva avatar y username existentes
              ...session.user,
              username: prevUser?.username || session.user.email?.split('@')[0] || 'usuario',
              is_admin: prevUser?.is_admin || session.user.email === 'manuel.jimena29@gmail.com'
            }));
          }
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      window.localStorage.clear();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const value = {
    user,
    loading,
    signOut,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: !!user?.is_admin
  };

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
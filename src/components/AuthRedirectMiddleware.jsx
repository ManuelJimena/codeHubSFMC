import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthRedirectMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Función para manejar redirecciones de autenticación de Supabase
    const handleAuthRedirect = async () => {
      // Caso 1: Hash con access_token (formato antiguo de Supabase)
      if (window.location.hash && window.location.hash.includes('access_token')) {
        try {
          console.log('Detectado hash con access_token');
          
          // Parsear los parámetros del hash
          const params = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');
          
          if (accessToken && type === 'recovery') {
            console.log('Procesando enlace de recuperación con hash');
            
            // Configurar la sesión con los tokens
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) throw error;
            
            // Limpiar la URL y redirigir
            window.history.replaceState(null, '', window.location.pathname);
            navigate('/update-password?source=recovery');
            toast.success('Por favor, establece tu nueva contraseña');
            return;
          }
        } catch (error) {
          console.error('Error procesando el enlace de recuperación (hash):', error);
          toast.error('Error al procesar el enlace de recuperación');
          navigate('/login');
          return;
        }
      }
      
      // Caso 2: Redirección con token en la URL (formato nuevo de Supabase)
      // Este es el formato que suele usar Supabase con sus redirecciones más recientes
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const type = params.get('type');
      
      if (token && type === 'recovery') {
        try {
          console.log('Detectado token de recuperación en la URL');
          
          // Verificar que estamos en la página correcta, si no, redirigir
          if (location.pathname !== '/update-password') {
            console.log('Redirigiendo a la página de actualización de contraseña');
            navigate('/update-password?source=recovery');
            return;
          }
        } catch (error) {
          console.error('Error procesando el enlace de recuperación (URL):', error);
          toast.error('Error al procesar el enlace de recuperación');
          navigate('/login');
        }
      }
    };

    // Ejecutar inmediatamente para manejar enlaces de recuperación
    handleAuthRedirect();
  }, [location, navigate]);

  return null;
};

export default AuthRedirectMiddleware;
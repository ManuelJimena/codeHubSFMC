import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthRedirectMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Detectar el hash de recuperación de contraseña en la URL
    if (window.location.hash && window.location.hash.includes('access_token') && window.location.hash.includes('type=recovery')) {
      console.log('Detectado enlace de recuperación de contraseña');
      
      // Extraer los parámetros del hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      // Función asíncrona para establecer la sesión y redirigir
      const handleRecovery = async () => {
        try {
          // Establecer la sesión con los tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) throw error;
          
          // Limpiar el hash de la URL
          window.history.replaceState(null, document.title, window.location.pathname);
          
          // Redirigir a la página de actualización de contraseña
          navigate('/update-password', { replace: true });
          
          toast.success('Por favor, establece tu nueva contraseña');
        } catch (error) {
          console.error('Error procesando la recuperación de contraseña:', error);
          toast.error('Error al procesar la recuperación de contraseña');
          navigate('/login');
        }
      };
      
      // Ejecutar inmediatamente
      handleRecovery();
    }
  }, [navigate, location]);
  
  return null;
};

export default AuthRedirectMiddleware;
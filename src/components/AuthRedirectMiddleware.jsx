import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthRedirectMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Check if we have a hash with auth parameters
      if (window.location.hash && window.location.hash.includes('access_token')) {
        try {
          // Parse the hash string into an object
          const params = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');
          
          if (accessToken && type === 'recovery') {
            console.log('Procesando enlace de recuperación de contraseña');
            
            // Configura la sesión con el token
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) throw error;
            
            // Limpia la URL y redirige
            window.history.replaceState(null, '', window.location.pathname);
            navigate('/update-password?type=recovery');
            toast.success('Por favor, establece tu nueva contraseña');
            return;
          }
        } catch (error) {
          console.error('Error procesando el enlace de recuperación:', error);
          toast.error('Error al procesar el enlace de recuperación');
          navigate('/login');
        }
      }
    };

    // Ejecutar inmediatamente para manejar enlaces de recuperación
    handleAuthRedirect();
  }, [location.hash, navigate]);  // Dependencia específica en el hash

  return null;
};

export default AuthRedirectMiddleware;
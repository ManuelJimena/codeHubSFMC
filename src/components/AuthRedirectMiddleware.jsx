import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthRedirectMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // Extraer los parámetros del hash
        const hash = location.hash.substring(1); // Remover el #
        const params = new URLSearchParams(hash);
        
        // Verificar si es una redirección de recuperación de contraseña
        const type = params.get('type');
        const accessToken = params.get('access_token');
        
        if (type === 'recovery' && accessToken) {
          // Establecer la sesión con el token
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data.session) {
            navigate('/update-password?type=recovery');
          }
        }

      } catch (error) {
        console.error('Error handling auth redirect:', error);
        toast.error('Error al procesar la autenticación');
      }
    };

    // Solo procesar si hay un hash en la URL
    if (location.hash) {
      handleAuthRedirect();
    }
    
  }, [location, navigate]);

  return null;
};

export default AuthRedirectMiddleware;
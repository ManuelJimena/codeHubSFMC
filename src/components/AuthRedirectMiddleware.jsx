import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthRedirectMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const hash = window.location.hash;
      
      if (hash.includes('access_token') && hash.includes('type=recovery')) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            navigate('/update-password?type=recovery');
            toast.success('Por favor, establece tu nueva contraseña');
          } else {
            navigate('/login');
            toast.error('Sesión no válida');
          }
        } catch (error) {
          console.error('Error handling auth redirect:', error);
          navigate('/login');
          toast.error('Error al procesar la autenticación');
        }
      }
    };

    handleAuthRedirect();
  }, [location, navigate]);

  return null;
};

export default AuthRedirectMiddleware;
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
        const { data: { session } } = await supabase.auth.getSession();
        const params = new URLSearchParams(location.search);
        const isRecovery = params.get('type') === 'recovery';

        // Si hay una sesión y es una redirección de recuperación
        if (session && isRecovery) {
          navigate('/update-password?type=recovery');
        }
      } catch (error) {
        console.error('Error handling auth redirect:', error);
        toast.error('Error al procesar la autenticación');
      }
    };

    handleAuthRedirect();
  }, [location, navigate]);

  return null;
};

export default AuthRedirectMiddleware;
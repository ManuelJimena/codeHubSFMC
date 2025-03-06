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
          const hashParams = Object.fromEntries(
            new URLSearchParams(window.location.hash.substring(1))
          );

          if (hashParams.type === 'recovery') {
            // Set the session with the tokens
            const { error } = await supabase.auth.setSession({
              access_token: hashParams.access_token,
              refresh_token: hashParams.refresh_token
            });

            if (error) throw error;
          
            // Clear the hash and redirect
            window.location.hash = '';
            navigate('/update-password?type=recovery');
            toast.success('Por favor, establece tu nueva contraseña');
          }
        } catch (error) {
          console.error('Error handling auth redirect:', error);
          toast.error('Error al procesar el enlace de recuperación');
          navigate('/login');
        }
      }
    };

    handleAuthRedirect();
  }, [location, navigate]);

  return null;
};

export default AuthRedirectMiddleware;
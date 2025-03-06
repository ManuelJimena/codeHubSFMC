import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthRedirectMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      const type = params.get('type');
      
      if (accessToken && type === 'recovery') {
        try {
          // Set the access token in the session
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: params.get('refresh_token')
          });
          
          // Redirect to update password page
          navigate('/update-password?type=recovery');
        } catch (error) {
          console.error('Error handling auth redirect:', error);
          navigate('/login');
        }
      }
    };

    handleAuthRedirect();
  }, [location, navigate]);

  return null;
};

export default AuthRedirectMiddleware;
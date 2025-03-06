import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthRedirectMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      
      if (hash.includes('access_token') && (hash.includes('type=recovery') || params.get('type') === 'recovery')) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            navigate('/update-password');
          } else {
            navigate('/login');
          }
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
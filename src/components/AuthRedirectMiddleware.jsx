import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthRedirectMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthRedirect = () => {
      // Si la URL contiene un token de acceso y es de tipo recovery
      if (location.hash.includes('access_token') && location.hash.includes('type=recovery')) {
        // Redirigir a la página de actualización de contraseña
        navigate('/update-password');
      }
    };

    handleAuthRedirect();
  }, [location, navigate]);

  return null;
};

export default AuthRedirectMiddleware;
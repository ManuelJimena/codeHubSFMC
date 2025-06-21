import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthRedirectMiddleware = () => {
  const { search, pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Si ya estamos en /update-password, no tocamos nada
    if (pathname === '/update-password') return;

    const qs   = new URLSearchParams(search);
    const type = qs.get('type');        // null | login | signup | recovery

    if (type === 'recovery') {
      // Mantenemos el querystring para que la página lo procese
      navigate(`/update-password${search}`, { replace: true });
    }
  }, [search, pathname, navigate]);

  return null;
};

export default AuthRedirectMiddleware;
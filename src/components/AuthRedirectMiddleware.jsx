import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

/**
 * Middleware de redirección:
 * • Si la URL trae ?code=... (PKCE) y NO estamos en /update-password,
 *   canjea el código y redirige según el tipo.
 * • Si estamos ya en /update-password, no hace nada: el componente se encarga.
 * • Soporta también el hash legacy access_token=...&type=recovery.
 */
const AuthRedirectMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();

  /* ────────── 1. PKCE (?code=...) ────────── */
  useEffect(() => {
    (async () => {
      if (location.pathname === '/update-password') return; // → dejar paso

      const params = new URLSearchParams(window.location.search);
      const code   = params.get('code');
      if (!code) return;                                    // no PKCE

      const { error } = await supabase.auth.exchangeCodeForSession();
      if (error) {
        console.error('PKCE error:', error);
        toast.error('No se pudo procesar el enlace');
        navigate('/login', { replace: true });
        return;
      }

      const type = params.get('type');                      // login | recovery
      window.history.replaceState(null, '', location.pathname); // limpia ?code

      if (type === 'recovery') {
        navigate('/update-password', { replace: true });
        toast.success('Establece tu nueva contraseña', { duration: 4500 });
      } else {
        navigate('/', { replace: true });
        toast.success('Sesión iniciada', { duration: 3000 });
      }
    })();
  }, [location, navigate]);

  /* ──────── 2. Hash legacy (access_token...) ──────── */
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('access_token') || !hash.includes('type=recovery')) return;

    const p = new URLSearchParams(hash.slice(1));
    const access_token  = p.get('access_token');
    const refresh_token = p.get('refresh_token');

    (async () => {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) {
        console.error('Hash recovery error:', error);
        toast.error('No se pudo procesar el enlace de recuperación');
        navigate('/login', { replace: true });
        return;
      }
      window.history.replaceState(null, '', location.pathname); // limpia #
      navigate('/update-password', { replace: true });
      toast.success('Establece tu nueva contraseña', { duration: 4500 });
    })();
  }, [location, navigate]);

  return null;
};

export default AuthRedirectMiddleware;
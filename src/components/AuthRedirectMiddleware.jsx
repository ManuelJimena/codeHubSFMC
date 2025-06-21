import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

/**
 * Este middleware sólo se encarga de:
 *   1. Intercambiar el ?code=... (PKCE) en rutas *distintas* de /update-password
 *   2. Manejar el hash legacy (access_token...) en caso de que aparezca
 * En /update-password delegamos el flujo al propio componente
 */
const AuthRedirectMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();

  /* ────────────────────────────────
     1. PKCE (?code=…)  ⇢   sesión
  ────────────────────────────────── */
  useEffect(() => {
    const run = async () => {
      // ① si ya estamos en /update-password, NO tocamos nada
      if (location.pathname === '/update-password') return;

      const params = new URLSearchParams(window.location.search);
      const code   = params.get('code');
      if (!code) return;                              // no PKCE → salir

      // canjea el código; detectSessionInUrl ya lo hace,
      // pero lo forzamos para asegurarnos
      const { error } = await supabase.auth.exchangeCodeForSession();
      if (error) {
        console.error('PKCE error:', error);
        toast.error('No se pudo iniciar la sesión');
        navigate('/login', { replace: true });
        return;
      }

      // ¿es recuperación o login normal?
      const type = params.get('type');                // puede ser null
      window.history.replaceState(null, '', location.pathname); // limpia ?code

      if (type === 'recovery') {
        navigate('/update-password', { replace: true });
        toast.success('Establece tu nueva contraseña', { duration: 4500 });
      } else {
        navigate('/', { replace: true });
        toast.success('Sesión iniciada correctamente', { duration: 3000 });
      }
    };

    run();
  }, [location, navigate]);

  /* ────────────────────────────────
     2. Hash legacy (access_token…)  ⇢   sesión
  ────────────────────────────────── */
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('access_token') || !hash.includes('type=recovery')) return;

    const params = new URLSearchParams(hash.substring(1));
    const access_token  = params.get('access_token');
    const refresh_token = params.get('refresh_token');

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
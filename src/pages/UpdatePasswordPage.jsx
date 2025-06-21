import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const navigate = useNavigate();

  /* ---------------------------------------------------------
   * Paso 1 ▸ Intercambiar el código (PKCE) por sesión
   * ------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession();
      if (error && error.name !== 'AuthSessionMissingError') {
        console.error('Error al intercambiar código:', error);
        toast.error('Enlace inválido o caducado', { duration: 6000 });
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate]);

  /* ---------------------------------------------------------
   * Paso 2 ▸ Verificar que la sesión sea válida
   * ------------------------------------------------------- */
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!session) {
          toast.error('Enlace de recuperación inválido o caducado', { duration: 6000 });
          navigate('/login', { replace: true });
          return;
        }

        // Sesión correcta
        setSessionValid(true);

        // Limpiar la URL para que no quede el code o el hash
        if (window.location.search || window.location.hash) {
          window.history.replaceState(null, document.title, '/update-password');
        }

        toast.success('Introduce tu nueva contraseña', { duration: 4500 });

        // Avisar si el usuario intenta salir sin cambiarla
        const beforeUnload = (e) => {
          const msg = '¿Seguro que quieres salir? Aún no has actualizado tu contraseña.';
          e.returnValue = msg;
          return msg;
        };
        window.addEventListener('beforeunload', beforeUnload);
        return () => window.removeEventListener('beforeunload', beforeUnload);
      } catch (err) {
        console.error('Error verificando la sesión:', err);
        toast.error('Error desconocido. Vuelve a intentarlo.', { duration: 5000 });
        navigate('/login', { replace: true });
      }
    };

    verifySession();
  }, [navigate]);

  /* ---------------------------------------------------------
   * Paso 3 ▸ Actualizar la contraseña
   * ------------------------------------------------------- */
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success('Contraseña actualizada correctamente', { duration: 4500 });

      // Cerrar sesión para obligar a login con la nueva clave
      await supabase.auth.signOut();
      window.localStorage.clear();

      toast.success('Sesión cerrada. Redirigiendo…', { duration: 4000 });
      setTimeout(() => (window.location.href = '/login'), 2500);
    } catch (err) {
      console.error('Error al actualizar contraseña:', err);
      toast.error(err.message || 'No se pudo actualizar la contraseña', { duration: 7000 });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------
   * Renderizado
   * ------------------------------------------------------- */
  if (!sessionValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Verificando enlace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Actualizar contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Ingresa tu nueva contraseña
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleUpdatePassword}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nueva contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmar contraseña
              </label>
              <div className="mt-1">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando…
                  </span>
                ) : (
                  <span className="flex items-center">
                    <KeyRound className="h-4 w-4 mr-2" />
                    Actualizar contraseña
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;

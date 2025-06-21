import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const UpdatePasswordPage = () => {
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading,         setLoading]         = useState(false);
  const [sessionOK,       setSessionOK]       = useState(false);
  const navigate = useNavigate();

  /* ---------------------------------------------------------
     1. Verificar que existe sesión (flujo implícito)
  --------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      // Comprobamos la sesión almacenada por Supabase (detectSessionInUrl: true)
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        toast.error('Enlace de recuperación inválido o caducado', { duration: 6000 });
        navigate('/login', { replace: true });
        return;
      }

      // Éxito → habilitamos el formulario
      setSessionOK(true);

      // Limpiar hash/querystring para no dejar tokens en la barra de direcciones
      window.history.replaceState(null, document.title, '/update-password');

      toast.success('Establece tu nueva contraseña', { duration: 4500 });

      // Aviso al cerrar pestaña sin terminar
      const handler = (e) => {
        const msg = '¿Seguro que quieres salir? No has actualizado tu contraseña.';
        e.returnValue = msg;
        return msg;
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    })();
  }, [navigate]);

  /* ---------------------------------------------------------
     2. Enviar nueva contraseña
  --------------------------------------------------------- */
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden'); return;
    }
    if (password.length < 6) {
      toast.error('Debe tener al menos 6 caracteres'); return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success('Contraseña actualizada correctamente', { duration: 5000 });

      // Cerrar sesión y redirigir
      await supabase.auth.signOut();
      window.localStorage.clear();
      toast.success('Sesión cerrada. Redirigiendo…', { duration: 4500 });
      setTimeout(() => (window.location.href = '/login'), 2500);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'No se pudo actualizar la contraseña', { duration: 7000 });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------
     3. Render
  --------------------------------------------------------- */
  if (!sessionOK) return null; // evita parpadeo mientras valida

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
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmar contraseña
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Actualizando…' : (
                <span className="flex items-center">
                  <KeyRound className="h-4 w-4 mr-2" />
                  Actualizar contraseña
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;

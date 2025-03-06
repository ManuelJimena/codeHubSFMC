import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const UpdatePasswordPage = () => {
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verifica si es una recuperación de contraseña
        const params = new URLSearchParams(location.search);
        const isRecovery = params.get('type') === 'recovery';
        
        // Verifica si hay una sesión activa
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isRecovery || !session) {
          console.log('No es una recuperación válida o no hay sesión', { isRecovery, hasSession: !!session });
          navigate('/login');
          toast.error('Enlace de recuperación no válido o expirado');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        navigate('/login');
        toast.error('Error al verificar la sesión');
      }
    };

    checkSession();
  }, [navigate, location]);

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
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Cerrar sesión después de actualizar la contraseña para garantizar un estado limpio
      await supabase.auth.signOut();
      
      // Limpiar el almacenamiento local para forzar el cierre de sesión completo
      window.localStorage.clear();
      
      toast.success('Contraseña actualizada correctamente');
      
      // Pequeña espera antes de redirigir para asegurar que la sesión se haya cerrado
      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

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
                    Actualizando...
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
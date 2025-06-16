import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { withAuthLock } from '../lib/authLock.js';
import { KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const navigate = useNavigate();

  // Verificar sesión al cargar
  useEffect(() => {
    const checkSessionAndUpdate = async () => {
      try {
        const { data: { session }, error } = await withAuthLock(() => supabase.auth.getSession());
        
        if (error) {
          throw error;
        }
        
        if (!session) {
          toast.error('Por favor, utiliza un enlace de recuperación válido', { duration: 5000 });
          navigate('/login', { replace: true });
          return;
        }
        
        setSessionValid(true);
        
        // Asegurar que estamos en la página de updatePassword sin parámetros adicionales
        if (window.location.search || window.location.hash) {
          window.history.replaceState(null, document.title, '/update-password');
        }
        
        // Mostrar mensaje de ayuda
        toast.success('Por favor, establece tu nueva contraseña', { duration: 5000 });
        
        // Añadir un listener para alertar si el usuario intenta abandonar la página
        const handleBeforeUnload = (e) => {
          const message = "¿Estás seguro que deseas salir? No has actualizado tu contraseña.";
          e.returnValue = message;
          return message;
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      } catch (error) {
        console.error('Error verificando sesión:', error);
        toast.error('Ha ocurrido un error. Por favor, intenta de nuevo', { duration: 5000 });
        navigate('/login', { replace: true });
      }
    };
    
    checkSessionAndUpdate();
  }, [navigate]);

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
      // Verificar sesión activa
      const { data: { session }, error: sessionError } = await withAuthLock(() => supabase.auth.getSession());
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (!session) {
        throw new Error('No hay una sesión activa para actualizar la contraseña');
      }
      
      // Usar la API directa de updateUser para mayor control y evitar problemas con el SDK
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apiKey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          password: password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      await response.json();
      
      // Notificar éxito y preparar redirección
      toast.success('Contraseña actualizada correctamente', { duration: 5000 });
      
      // Cerrar sesión de manera segura
      await withAuthLock(() => supabase.auth.signOut());
      window.localStorage.clear();
      
      // Mostrar mensaje y redirigir
      toast.success('Sesión cerrada. Redirigiendo al login...', { duration: 5000 });
      
      setTimeout(() => {
        // Forzar recarga completa de la página
        window.location.href = '/login';
      }, 3000);
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      toast.error(`Error: ${error.message || 'Error al actualizar la contraseña'}`, { duration: 8000 });
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
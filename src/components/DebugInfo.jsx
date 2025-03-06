import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const DebugInfo = () => {
  const { user, isAdmin } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [info, setInfo] = useState({
    supabaseConnected: 'Comprobando...',
    env: {},
    authStatus: 'Comprobando...',
    browserInfo: {}
  });

  useEffect(() => {
    // Comprobar conexión con Supabase
    const checkSupabaseConnection = async () => {
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        return error ? `Error: ${error.message}` : 'Conectado';
      } catch (err) {
        return `Error: ${err.message}`;
      }
    };

    // Comprobar estado de autenticación
    const checkAuthStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) return `Error: ${error.message}`;
        return data.session ? `Autenticado como ${data.session.user.email}` : 'No autenticado';
      } catch (err) {
        return `Error: ${err.message}`;
      }
    };

    const getInfo = async () => {
      const supabaseConnected = await checkSupabaseConnection();
      const authStatus = await checkAuthStatus();
      
      setInfo({
        supabaseConnected,
        env: {
          'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL ? 'Configurado' : 'No configurado',
          'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurado' : 'No configurado',
        },
        authStatus,
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          cookiesEnabled: navigator.cookieEnabled,
          localStorage: typeof localStorage !== 'undefined' ? 'Disponible' : 'No disponible',
        }
      });
    };

    getInfo();
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Solo renderizamos el componente si el usuario es administrador
  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleVisibility}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg"
        title="Mostrar información de depuración"
      >
        🐞
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl w-80 text-xs overflow-auto max-h-96">
          <h3 className="font-bold mb-2 text-sm">Información de depuración</h3>
          
          <div className="mb-2">
            <h4 className="font-semibold">Supabase</h4>
            <p>Estado de conexión: {info.supabaseConnected}</p>
          </div>
          
          <div className="mb-2">
            <h4 className="font-semibold">Variables de entorno</h4>
            <ul>
              {Object.entries(info.env).map(([key, value]) => (
                <li key={key}>{key}: {value}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-2">
            <h4 className="font-semibold">Autenticación</h4>
            <p>{info.authStatus}</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Navegador</h4>
            <ul>
              {Object.entries(info.browserInfo).map(([key, value]) => (
                <li key={key}>{key}: {value}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugInfo;
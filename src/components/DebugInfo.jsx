import React, { useState, useEffect, memo, useCallback } from 'react';
import { supabase, testSupabaseConnection } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const DebugInfo = memo(({ alwaysVisible = false }) => {
  const { user, isAdmin } = useAuth();
  const [isVisible, setIsVisible] = useState(alwaysVisible);
  const [info, setInfo] = useState({
    supabaseConnected: 'Comprobando...',
    env: {},
    authStatus: 'Comprobando...',
    browserInfo: {},
    connectionTest: 'No probado'
  });

  const checkSupabaseConnection = useCallback(async () => {
    try {
      const isConnected = await testSupabaseConnection();
      return isConnected ? 'Conectado' : 'Error de conexión';
    } catch (err) {
      return `Error: ${err.message}`;
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) return `Error: ${error.message}`;
      return data.session ? `Autenticado como ${data.session.user.email}` : 'No autenticado';
    } catch (err) {
      return `Error: ${err.message}`;
    }
  }, []);

  const testConnection = useCallback(async () => {
    try {
      const result = await testSupabaseConnection();
      setInfo(prev => ({
        ...prev,
        connectionTest: result ? 'Conexión exitosa' : 'Conexión fallida'
      }));
    } catch (error) {
      setInfo(prev => ({
        ...prev,
        connectionTest: `Error: ${error.message}`
      }));
    }
  }, []);

  useEffect(() => {
    const getInfo = async () => {
      const supabaseConnected = await checkSupabaseConnection();
      const authStatus = await checkAuthStatus();
      
      setInfo({
        supabaseConnected,
        env: {
          'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL ? 'Configurado' : 'No configurado',
          'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurado' : 'No configurado',
          'NODE_ENV': import.meta.env.MODE,
          'BASE_URL': import.meta.env.BASE_URL
        },
        authStatus,
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          cookiesEnabled: navigator.cookieEnabled,
          localStorage: typeof localStorage !== 'undefined' ? 'Disponible' : 'No disponible',
          online: navigator.onLine ? 'En línea' : 'Sin conexión'
        },
        connectionTest: 'No probado'
      });
    };

    getInfo();
  }, [checkSupabaseConnection, checkAuthStatus]);

  const toggleVisibility = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  // Solo renderizamos el componente si el usuario es administrador
  if (!isAdmin && !alwaysVisible) return null;

  // Si es alwaysVisible (en el panel de admin) mostramos diferente UI
  if (alwaysVisible) {
    return (
      <div className="w-full">
        <h3 className="font-bold mb-2 text-sm text-gray-900 dark:text-white">Información de depuración</h3>
        
        <div className="mb-2">
          <h4 className="font-semibold text-gray-800 dark:text-gray-300">Supabase</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Estado de conexión: {info.supabaseConnected}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Test de conexión: {info.connectionTest}</p>
          <button 
            onClick={testConnection}
            className="mt-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Probar conexión
          </button>
        </div>
        
        <div className="mb-2">
          <h4 className="font-semibold text-gray-800 dark:text-gray-300">Variables de entorno</h4>
          <ul className="text-sm">
            {Object.entries(info.env).map(([key, value]) => (
              <li key={key} className="text-gray-600 dark:text-gray-400">{key}: {value}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-2">
          <h4 className="font-semibold text-gray-800 dark:text-gray-300">Autenticación</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{info.authStatus}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-300">Navegador</h4>
          <ul className="text-sm">
            {Object.entries(info.browserInfo).map(([key, value]) => (
              <li key={key} className="text-gray-600 dark:text-gray-400">{key}: {value}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  
  // Versión flotante para el botón de administrador 
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
            <p>Test de conexión: {info.connectionTest}</p>
            <button 
              onClick={testConnection}
              className="mt-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Probar conexión
            </button>
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
});

DebugInfo.displayName = 'DebugInfo';

export default DebugInfo;
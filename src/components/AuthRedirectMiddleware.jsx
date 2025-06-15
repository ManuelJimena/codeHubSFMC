import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthRedirectMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Monitoreo básico de cambios en la URL
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('URL actualizada:', window.location.pathname + window.location.search);
    }
  }, [location]);
  
  // Manejar flujo PKCE (con parámetro code en la URL)
  useEffect(() => {
    const handlePKCEFlow = async () => {
      // Evitar procesamiento duplicado
      if (isProcessing) return;
      
      try {
        // Verificar si tenemos un parámetro 'code' en la URL (flujo PKCE)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        
        if (code) {
          setIsProcessing(true);
          
          // Timeout aumentado para evitar cuelgues
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Session timeout')), 15000);
          });
          
          const { data: { session }, error: sessionError } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]);
          
          if (sessionError) {
            throw sessionError;
          }
          
          if (!session) {
            throw new Error('No se pudo establecer una sesión con el código proporcionado');
          }
          
          // Limpiar la URL
          window.history.replaceState(null, document.title, window.location.pathname);
          
          // Si venimos de un enlace de recuperación, redirigir a la página de actualización de contraseña
          const type = searchParams.get('type');
          
          if (type === 'recovery') {
            navigate('/update-password', { replace: true });
            toast.success('Por favor, establece tu nueva contraseña', { duration: 5000 });
          } else {
            // Es un inicio de sesión regular, redirigir a la página principal
            navigate('/', { replace: true });
            toast.success('Sesión iniciada correctamente', { duration: 3000 });
          }
        }
      } catch (error) {
        console.error('Error procesando autenticación:', error);
        toast.error('Error al procesar la autenticación');
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Ejecutar la función de detección solo si hay un parámetro 'code' y no estamos procesando ya
    if (window.location.search.includes('code=') && !isProcessing) {
      handlePKCEFlow();
    }
  }, [navigate, location, isProcessing]);
  
  // Manejar flujo hash (con hash en la URL - método anterior)
  useEffect(() => {
    // Función para detectar y manejar el hash de recuperación (método alternativo/anterior)
    const detectAndHandleRecoveryHash = async () => {
      // Evitar procesamiento duplicado
      if (isProcessing) return;
      
      try {
        // Detectar el hash de recuperación de contraseña en la URL
        const hash = window.location.hash;
        
        if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
          setIsProcessing(true);
          
          // Extraer los parámetros del hash
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (!accessToken || !refreshToken) {
            throw new Error('Tokens no encontrados en la URL');
          }
          
          // Establecer la sesión con los tokens explícitamente
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            throw error;
          }
          
          // Desactivar detectSessionInUrl temporalmente limpiando el hash
          window.history.replaceState(null, document.title, window.location.pathname);
          
          // Redirigir a la página de actualización de contraseña
          navigate('/update-password', { replace: true });
          
          toast.success('Por favor, establece tu nueva contraseña', { duration: 5000 });
        }
      } catch (error) {
        console.error('Error procesando la recuperación de contraseña:', error);
        toast.error('Error al procesar la recuperación de contraseña');
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Ejecutar la función de detección solo si hay un hash y no estamos procesando ya
    if (window.location.hash && !isProcessing) {
      detectAndHandleRecoveryHash();
    }
  }, [navigate, location, isProcessing]);
  
  return null;
};

export default AuthRedirectMiddleware;
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthRedirectMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mostrar información de la URL para depuración
  useEffect(() => {
    console.log('URL actual:', window.location.href);
    console.log('Hash de URL:', window.location.hash);
    console.log('AuthRedirectMiddleware se ha montado/actualizado');
  }, [location]);
  
  useEffect(() => {
    // Función para detectar y manejar el hash de recuperación
    const detectAndHandleRecoveryHash = async () => {
      // Evitar procesamiento duplicado
      if (isProcessing) return;
      
      try {
        // Detectar el hash de recuperación de contraseña en la URL
        const hash = window.location.hash;
        console.log('Analizando hash de URL:', hash);
        
        if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
          setIsProcessing(true);
          console.log('¡Detectado enlace de recuperación de contraseña!');
          
          // Extraer los parámetros del hash
          const hashParams = new URLSearchParams(hash.substring(1));
          console.log('Parámetros del hash:', Object.fromEntries(hashParams.entries()));
          
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (!accessToken || !refreshToken) {
            throw new Error('Tokens no encontrados en la URL');
          }
          
          // Establecer la sesión con los tokens explícitamente
          console.log('Intentando establecer sesión con tokens');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Error al establecer sesión con tokens:', error);
            throw error;
          }
          
          console.log('Sesión establecida correctamente:', !!data.session);
          
          // Desactivar detectSessionInUrl temporalmente limpiando el hash
          window.history.replaceState(null, document.title, window.location.pathname);
          console.log('Hash limpiado de la URL');
          
          // Redirigir a la página de actualización de contraseña
          navigate('/update-password', { replace: true });
          
          toast.success('Por favor, establece tu nueva contraseña', { duration: 5000 });
        } else {
          console.log('No se detectó un hash de recuperación en esta URL');
        }
      } catch (error) {
        console.error('Error procesando la recuperación de contraseña:', error);
        toast.error('Error al procesar la recuperación de contraseña: ' + error.message);
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Ejecutar la función de detección solo si hay un hash y no estamos procesando ya
    if (window.location.hash && !isProcessing) {
      console.log('Ejecutando detección de hash de recuperación');
      detectAndHandleRecoveryHash();
    }
  }, [navigate, location, isProcessing]);
  
  return null;
};

export default AuthRedirectMiddleware;
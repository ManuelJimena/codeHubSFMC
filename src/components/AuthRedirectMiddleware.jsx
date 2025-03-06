import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthRedirectMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    console.log('AuthRedirectMiddleware se ha montado/actualizado');
    
    // Función para detectar y manejar el hash de recuperación
    const detectAndHandleRecoveryHash = async () => {
      // Evitar procesamiento duplicado
      if (isProcessing) return;
      
      try {
        // Detectar el hash de recuperación de contraseña en la URL
        if (window.location.hash && window.location.hash.includes('access_token') && window.location.hash.includes('type=recovery')) {
          setIsProcessing(true);
          console.log('Detectado enlace de recuperación de contraseña en AuthRedirectMiddleware');
          
          // Extraer los parámetros del hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (!accessToken || !refreshToken) {
            throw new Error('Tokens no encontrados en la URL');
          }
          
          // Establecer la sesión con los tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) throw error;
          
          // Limpiar el hash de la URL
          window.history.replaceState(null, document.title, window.location.pathname);
          
          // Redirigir a la página de actualización de contraseña
          navigate('/update-password', { replace: true });
          
          toast.success('Por favor, establece tu nueva contraseña');
        }
      } catch (error) {
        console.error('Error procesando la recuperación de contraseña:', error);
        toast.error('Error al procesar la recuperación de contraseña');
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Ejecutar la función de detección
    detectAndHandleRecoveryHash();
  }, [navigate, location, isProcessing]);
  
  return null;
};

export default AuthRedirectMiddleware;
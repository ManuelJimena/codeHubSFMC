import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { supabase } from './lib/supabase';
import toast from 'react-hot-toast';

// Función para manejar hash de recuperación de contraseña antes de cargar el resto de la aplicación
const handlePasswordRecoveryFlow = async () => {
  // Verificar si hay un hash de recuperación en la URL
  if (window.location.hash && window.location.hash.includes('access_token') && window.location.hash.includes('type=recovery')) {
    console.log('Interceptando hash de recuperación de contraseña desde main.jsx');
    
    try {
      // Extraer parámetros del hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      // Establecer la sesión
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (error) throw error;
      
      // Limpiar el hash y redirigir
      window.location.href = '/update-password';
      return true; // Indicar que hemos manejado el hash
    } catch (error) {
      console.error('Error al procesar el enlace de recuperación:', error);
      // Limpia el hash y continua normalmente
      window.location.href = '/login?error=recovery';
      return true;
    }
  }
  
  return false; // Indicar que no hay hash o no se ha manejado
};

// Verificar primero si hay un hash de recuperación
if (!handlePasswordRecoveryFlow()) {
  // Continuar con la renderización normal si no hay hash o no se ha manejado
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AuthProvider>
        <ThemeProvider>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </StrictMode>
  );
}
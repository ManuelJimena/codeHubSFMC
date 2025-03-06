import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import toast from 'react-hot-toast';

// Renderizar directamente la aplicación - el manejo del hash se hace en AuthRedirectMiddleware
console.log('Iniciando la aplicación...');

try {
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
  console.log('App renderizada correctamente');
} catch (error) {
  console.error('Error al renderizar la aplicación:', error);
  // Si hay un error en la renderización, mostramos un mensaje en el DOM directamente
  document.body.innerHTML = `
    <div style="font-family: system-ui; padding: 2rem; text-align: center;">
      <h1>Error al cargar la aplicación</h1>
      <p>Ha ocurrido un problema al inicializar la aplicación. Por favor, recarga la página o contacta con soporte.</p>
      <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; text-align: left; overflow: auto;">
        ${error.message}
      </pre>
      <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: blue; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 1rem;">
        Reintentar
      </button>
    </div>
  `;
}
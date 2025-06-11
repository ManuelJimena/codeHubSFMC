import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

console.log('Iniciando la aplicación...');

// Función para renderizar la aplicación con manejo de errores
const renderApp = () => {
  try {
    const root = createRoot(document.getElementById('root'));
    
    root.render(
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
    
    // Fallback UI en caso de error crítico
    document.body.innerHTML = `
      <div style="font-family: system-ui; padding: 2rem; text-align: center; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626; margin-bottom: 1rem;">Error al cargar la aplicación</h1>
        <p style="margin-bottom: 1rem; color: #374151;">
          Ha ocurrido un problema al inicializar la aplicación. 
          Esto puede deberse a problemas de conectividad o configuración.
        </p>
        <details style="margin: 1rem 0; text-align: left;">
          <summary style="cursor: pointer; font-weight: bold; margin-bottom: 0.5rem;">
            Detalles del error
          </summary>
          <pre style="background: #f3f4f6; padding: 1rem; border-radius: 4px; overflow: auto; font-size: 0.875rem;">
${error.message}
${error.stack || ''}
          </pre>
        </details>
        <div style="margin-top: 2rem;">
          <button 
            onclick="location.reload()" 
            style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; margin-right: 1rem;"
          >
            Reintentar
          </button>
          <button 
            onclick="localStorage.clear(); location.reload()" 
            style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;"
          >
            Limpiar datos y reintentar
          </button>
        </div>
      </div>
    `;
  }
};

// Verificar que el DOM esté listo antes de renderizar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
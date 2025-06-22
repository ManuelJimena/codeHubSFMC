import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Code, Save, Share2, Star, Bot, Heart } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTheme } from '../context/ThemeContext';

const HomePage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  // Manejar redirecciones de autenticación
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const params = new URLSearchParams(location.search);
      const isRecovery = params.get('type') === 'recovery';

      if (session && isRecovery) {
        navigate('/update-password?type=recovery');
      }
    };

    handleAuthRedirect();
  }, [navigate, location]);
  const codeExample = `/* Ejemplo de SSJS */
// Obtener datos de una Data Extension
Platform.Load("Core", "1.1.1");
var prox = Platform.Function.CreateObject("ProxyDE");
Platform.Function.SetObjectProperty(prox, "Name", "MyDataExtension");
var fields = Platform.Function.CreateObject("Fields");
Platform.Function.AddObjectArrayItem(fields, "Field", "EmailAddress");
Platform.Function.AddObjectArrayItem(fields, "Field", "FirstName");
Platform.Function.SetObjectProperty(prox, "Fields", fields);
var data = Platform.Function.InvokeRetrieve(prox);`;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
              Guarda código que funciona
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Almacena y comparte fragmentos de código de Marketing Cloud que realmente funcionan. Deja de buscar cuando los necesites, ¡están todos aquí!
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/explore"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Explorar Snippets
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Crear Cuenta Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Guarda fragmentos de código
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
              <div className="text-blue-500 mb-4">
                <Save className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Guarda en la nube
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Almacena tus fragmentos en la nube y accede desde cualquier lugar
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
              <div className="text-blue-500 mb-4">
                <Code className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Organiza snippets
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Clasifica por lenguaje: SSJS, SQL, AMPscript
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
              <div className="text-blue-500 mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Guarda favoritos
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Marca y accede a los mejores snippets de otros usuarios
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
              <div className="text-blue-500 mb-4">
                <Bot className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Asistente IA
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Consulta dudas sobre SFMC con nuestro asistente de IA
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Comparte fragmentos de código
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <Code className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Sintaxis resaltada
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      Resaltado de sintaxis para SSJS, SQL y AMPscript
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <Share2 className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Compartir público/privado
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      Elige si tus snippets son públicos o privados
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="absolute -top-4 -right-4">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm">
                    Vista previa
                  </div>
                </div>
                <SyntaxHighlighter 
                  language="javascript"
                  style={atomOneDark}
                  customStyle={{ 
                    padding: '1.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.550rem',
                    backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5'
                  }}
                  wrapLines={true}
                  showLineNumbers={true}
                  lineNumberStyle={{ 
                    color: darkMode ? '#6b7280' : '#9ca3af',
                    minWidth: '2.5em',
                    paddingRight: '1em',
                    textAlign: 'right'
                  }}
                >
                  {codeExample}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            ¿Listo para empezar?
          </h2>
          <div className="flex justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
            >
              Crear cuenta gratis
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-700"
            >
              Explorar snippets
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
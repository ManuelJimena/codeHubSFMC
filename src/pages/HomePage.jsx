import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Code, Save, Share2, Star, Bot, Heart, ArrowRight, Sparkles } from 'lucide-react';
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

  const codeExample = `-- Consulta SQL para Marketing Cloud
SELECT 
  EmailAddress,
  FirstName,
  LastName,
  SubscriberKey
FROM Subscribers 
WHERE Status = 'Active'
  AND DateJoined >= DATEADD(DAY, -30, GETDATE())
ORDER BY DateJoined DESC`;

  const features = [
    {
      icon: Save,
      title: "Guarda en la nube",
      description: "Almacena tus fragmentos en la nube y accede desde cualquier lugar",
      color: "blue"
    },
    {
      icon: Code,
      title: "Organiza snippets",
      description: "Clasifica por lenguaje: SSJS, SQL, AMPscript",
      color: "green"
    },
    {
      icon: Heart,
      title: "Guarda favoritos",
      description: "Marca y accede a los mejores snippets de otros usuarios",
      color: "red"
    },
    {
      icon: Bot,
      title: "Asistente IA",
      description: "Consulta dudas sobre SFMC con nuestro asistente de IA",
      color: "purple"
    }
  ];

  const getFeatureColorClasses = (color) => {
    const colors = {
      blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20",
      green: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20",
      red: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20",
      purple: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative container-responsive py-12 sm:py-16 lg:py-20">
          <div className="text-center animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 text-xs sm:text-sm font-medium text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Plataforma para desarrolladores SFMC
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight px-4 sm:px-0">
              Guarda código que{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                funciona
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Almacena y comparte fragmentos de código de Marketing Cloud que realmente funcionan.
              <span className="hidden sm:inline"> Deja de buscar cuando los necesites, ¡están todos aquí!</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4 sm:px-0">
              <Link
                to="/explore"
                className="w-full sm:w-auto btn-primary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold group"
                aria-label="Explorar fragmentos de código disponibles"
              >
                Explorar Snippets
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/signup"
                className="w-full sm:w-auto btn-secondary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold"
                aria-label="Crear cuenta gratuita"
              >
                Crear Cuenta Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="container-responsive">
          <div className="text-center mb-12 sm:mb-16 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Guarda fragmentos de código
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4 sm:px-0">
              Una plataforma completa para gestionar y compartir tu conocimiento de Marketing Cloud
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="card-interactive p-4 sm:p-6 text-center group animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl mb-3 sm:mb-4 ${getFeatureColorClasses(feature.color)} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Preview Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="container-responsive">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="animate-slide-up order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Comparte fragmentos de código
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start group">
                  <div className="flex-shrink-0 mr-3 sm:mr-4">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                      <Code className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                      Sintaxis resaltada
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Resaltado de sintaxis profesional para SSJS, SQL y AMPscript con numeración de líneas
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 mr-3 sm:mr-4">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
                      <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                      Compartir público/privado
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Control total sobre la visibilidad de tus fragmentos con opciones públicas y privadas
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 mr-3 sm:mr-4">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                      Sistema de favoritos
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Guarda y organiza los mejores fragmentos de la comunidad para acceso rápido
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-scale-in order-1 lg:order-2">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
              
              <div className="relative card p-3 sm:p-6 overflow-hidden">
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
                  <div className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                    Vista previa
                  </div>
                </div>
                
                {/* Contenedor responsive para el código */}
                <div className="w-full overflow-hidden rounded-lg">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-0" style={{ minWidth: '280px' }}>
                      <SyntaxHighlighter 
                        language="sql"
                        style={atomOneDark}
                        customStyle={{ 
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa',
                          margin: 0,
                          width: '100%',
                          maxWidth: '100%'
                        }}
                        className="text-xs sm:text-sm"
                        wrapLines={false}
                        showLineNumbers={true}
                        lineNumberStyle={{ 
                          color: darkMode ? '#6b7280' : '#9ca3af',
                          minWidth: '1.5em',
                          paddingRight: '0.5em',
                          textAlign: 'right',
                        }}
                      >
                        {codeExample}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 sm:py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-primary"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative container-responsive text-center">
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4 sm:px-0">
              ¿Listo para empezar?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
              Únete a la comunidad de desarrolladores de Marketing Cloud y comparte tu conocimiento
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-blue-600 bg-white rounded-lg shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-200 hover:shadow-xl active:scale-95 group"
                aria-label="Crear cuenta gratuita"
              >
                Crear cuenta gratis
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white border-2 border-white/30 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-200 active:scale-95"
                aria-label="Explorar fragmentos de código"
              >
                Explorar snippets
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CreateSnippetPage = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('ssjs');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateInput = () => {
    if (!title.trim()) {
      toast.error('El título es obligatorio');
      console.log('Validación fallida: título vacío');
      return false;
    }
    if (!code.trim()) {
      toast.error('El código es obligatorio');
      console.log('Validación fallida: código vacío');
      return false;
    }
    if (title.length > 100) {
      toast.error('El título no puede tener más de 100 caracteres');
      console.log('Validación fallida: título demasiado largo');
      return false;
    }
    if (code.length > 10000) {
      toast.error('El código no puede tener más de 10000 caracteres');
      console.log('Validación fallida: código demasiado largo');
      return false;
    }
    console.log('Validación exitosa');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar autenticación
    if (!user) {
      toast.error('Debes iniciar sesión para crear un fragmento de código');
      navigate('/login');
      return;
    }

    // Validar entrada
    if (!validateInput()) return;

    setLoading(true);

    try {
      console.log('Creando fragmento:', {
        title: title.trim(),
        description: description.trim(),
        code: code.trim(),
        language,
        is_public: isPublic,
        user_id: user.id
      });

      // Crear snippet con timeout más conservador y reintentos
      let attempts = 0;
      const maxAttempts = 3;
      let snippet = null;

      while (attempts < maxAttempts && !snippet) {
        attempts++;
        
        try {
          console.log(`Intento ${attempts} de ${maxAttempts} para crear fragmento`);
          
          const createSnippetPromise = supabase
            .from('snippets')
            .insert([{
              title: title.trim(),
              description: description.trim(),
              code: code.trim(),
              language,
              is_public: isPublic,
              user_id: user.id
            }])
            .select()
            .single();

          // Timeout más conservador de 15 segundos
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Tiempo de espera agotado: La operación está tardando demasiado')), 15000);
          });

          const { data, error } = await Promise.race([
            createSnippetPromise,
            timeoutPromise
          ]);

          if (error) {
            throw error;
          }

          if (!data) {
            throw new Error('No se pudo crear el fragmento de código');
          }

          snippet = data;
          console.log('Fragmento creado exitosamente:', snippet);
          break;

        } catch (attemptError) {
          console.error(`Error en intento ${attempts}:`, attemptError);
          
          if (attempts === maxAttempts) {
            throw attemptError;
          }
          
          // Esperar antes del siguiente intento (backoff exponencial)
          const delay = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
          console.log(`Esperando ${delay}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      if (!snippet) {
        throw new Error('No se pudo crear el fragmento después de varios intentos');
      }

      toast.success('¡Fragmento de código creado exitosamente!');
      navigate(`/snippet/${snippet.id}`);

    } catch (error) {
      console.error('Error al crear fragmento:', error);
      
      if (error.message.includes('Tiempo de espera agotado')) {
        toast.error('La operación está tardando demasiado. Por favor, intenta de nuevo.');
      } else if (error.message.includes('network')) {
        toast.error('Error de conexión. Verifica tu conexión a internet.');
      } else {
        toast.error(error.message || 'Error al crear el fragmento de código');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          No has iniciado sesión
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Debes iniciar sesión para crear fragmentos de código.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Crear nuevo fragmento de código
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Comparte tu conocimiento con la comunidad o guarda fragmentos para uso personal
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Título
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Ej: Consulta SQL para obtener clientes activos"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {title.length}/100 caracteres
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Describe brevemente para qué sirve este fragmento de código"
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lenguaje
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="ssjs">SSJS</option>
              <option value="sql">SQL</option>
              <option value="ampscript">AMPscript</option>
            </select>
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Código
            </label>
            <textarea
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              rows={10}
              maxLength={10000}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Pega tu código aquí..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {code.length}/10000 caracteres
            </p>
          </div>

          <div className="flex items-center">
            <input
              id="is-public"
              name="is-public"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="is-public" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Hacer público (visible para todos los usuarios)
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !code.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSnippetPage;
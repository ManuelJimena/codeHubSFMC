import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EditSnippetPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('ssjs');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSnippet = async () => {
      if (!id) return;
      
      try {
        setError(null);
        setFetchLoading(true);
        
        const { data, error } = await supabase
          .from('snippets')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          throw new Error('Fragmento no encontrado');
        }
        
        // Verificar que el usuario es el propietario
        if (user?.id !== data.user_id) {
          throw new Error('No tienes permiso para editar este fragmento');
        }
        
        // Establecer los datos del snippet en el formulario
        setTitle(data.title);
        setDescription(data.description || '');
        setCode(data.code);
        setLanguage(data.language);
        setIsPublic(data.is_public);
      } catch (error) {
        console.error('Error fetching snippet:', error);
        setError(error.message || 'Error al cargar el fragmento de código');
        toast.error(error.message || 'Error al cargar el fragmento de código');
      } finally {
        setFetchLoading(false);
      }
    };
    
    if (user) {
      fetchSnippet();
    }
  }, [id, user]);

  const validateInput = () => {
    if (!title.trim()) {
      toast.error('El título es obligatorio');
      return false;
    }
    if (!code.trim()) {
      toast.error('El código es obligatorio');
      return false;
    }
    if (title.length > 100) {
      toast.error('El título no puede tener más de 100 caracteres');
      return false;
    }
    if (code.length > 10000) {
      toast.error('El código no puede tener más de 10000 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Debes iniciar sesión para editar un fragmento de código');
      navigate('/login');
      return;
    }

    if (!validateInput()) return;

    setLoading(true);

    try {
      // Actualizar el snippet
      const { data, error } = await supabase
        .from('snippets')
        .update({
          title: title.trim(),
          description: description.trim(),
          code: code.trim(),
          language,
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id) // Asegura que solo el propietario puede editar
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No se pudo actualizar el fragmento de código');
      }

      toast.success('¡Fragmento de código actualizado exitosamente!');
      navigate(`/snippet/${data.id}`);
    } catch (error) {
      console.error('Error updating snippet:', error);
      toast.error(error.message || 'Error al actualizar el fragmento de código');
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
          Debes iniciar sesión para editar fragmentos de código.
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

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {error}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Lo sentimos, no se pudo cargar el fragmento de código para edición.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Editar fragmento de código
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Actualiza la información de tu fragmento de código
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
              onClick={() => navigate(`/snippet/${id}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
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
                  Guardar cambios
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSnippetPage;
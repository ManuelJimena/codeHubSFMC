import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Code, Plus, Search } from 'lucide-react';
import CodeCard from '../components/CodeCard';
import toast from 'react-hot-toast';

const UserSnippetsPage = () => {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [visibility, setVisibility] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserSnippets();
  }, [user, selectedLanguage, visibility]);

  const fetchUserSnippets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('snippets')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedLanguage !== 'all') {
        query = query.eq('language', selectedLanguage);
      }

      if (visibility === 'public') {
        query = query.eq('is_public', true);
      } else if (visibility === 'private') {
        query = query.eq('is_public', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSnippets(data || []);
    } catch (error) {
      console.error('Error fetching user snippets:', error);
      toast.error('Error al cargar los fragmentos de código');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSnippet = async (snippetId) => {
    try {
      const { error } = await supabase
        .from('snippets')
        .delete()
        .eq('id', snippetId);

      if (error) throw error;
      
      setSnippets(snippets.filter(s => s.id !== snippetId));
      toast.success('Fragmento eliminado correctamente');
    } catch (error) {
      console.error('Error deleting snippet:', error);
      toast.error('Error al eliminar el fragmento');
    }
  };

  const filteredSnippets = snippets.filter(snippet => 
    (snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          No has iniciado sesión
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Debes iniciar sesión para ver tus fragmentos de código.
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mis fragmentos de código
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Gestiona tus fragmentos de código públicos y privados
          </p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear nuevo
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar en tus fragmentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Language filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLanguage('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedLanguage === 'all'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Lenguaje: Todos
              </button>
              <button
                onClick={() => setSelectedLanguage('ssjs')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedLanguage === 'ssjs'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                SSJS
              </button>
              <button
                onClick={() => setSelectedLanguage('sql')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedLanguage === 'sql'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                SQL
              </button>
              <button
                onClick={() => setSelectedLanguage('ampscript')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedLanguage === 'ampscript'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                AMPscript
              </button>
            </div>

            {/* Visibility filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setVisibility('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  visibility === 'all'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Visibilidad: Todos
              </button>
              <button
                onClick={() => setVisibility('public')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  visibility === 'public'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Públicos
              </button>
              <button
                onClick={() => setVisibility('private')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  visibility === 'private'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Privados
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSnippets.length > 0 ? (
            filteredSnippets.map(snippet => (
              <CodeCard
                key={snippet.id}
                snippet={snippet}
                onDelete={() => handleDeleteSnippet(snippet.id)}
                showActions={true}
              />
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Code className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No se encontraron fragmentos de código
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery
                  ? 'No hay resultados para tu búsqueda'
                  : 'Comienza creando tu primer fragmento de código'}
              </p>
              <Link
                to="/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear fragmento
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSnippetsPage;
import React, { useState, useEffect, useRef } from 'react';
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const searchDebounce = useRef(null);
  const [error, setError] = useState(null);
  const abortController = useRef(null);
  const initialLoadDone = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Cancelar cualquier petición pendiente
    if (abortController.current) {
      abortController.current.abort();
    }

    if (initialLoadDone.current) {
      setLoading(true);
      fetchUserSnippets();
    } else if (user) {
      initialLoadDone.current = true;
      fetchUserSnippets();
    }
    
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [user, activeFilter]);

  const fetchUserSnippets = async () => {
    if (!user) return;

    try {
      if (!snippets.length) {
        setLoading(true);
      }
      setError(null);
      
      let query = supabase
        .from('snippets')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      // Aplicar filtros
      switch (activeFilter) {
        case 'ssjs':
        case 'sql':
        case 'ampscript':
          query = query.eq('language', activeFilter);
          break;
        case 'private':
          query = query.eq('is_public', false);
          break;
        // 'all' no necesita filtrado adicional
      }

      const { data, error } = await query;

      if (error) throw error;
      setSnippets(data || []);
    } catch (error) {
      // Solo mostrar error si no fue abortado
      if (error.name !== 'AbortError') {
        console.error('Error al obtener fragmentos del usuario:', error);
        setError('Error al cargar los fragmentos de código');
        toast.error('Error al cargar los fragmentos de código');
      }
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
      console.error('Error al eliminar fragmento:', error);
      toast.error('Error al eliminar el fragmento');
    }
  };

  const filteredSnippets = React.useMemo(() => {
    const query = searchQuery.toLowerCase();
    return snippets.filter(snippet => 
      snippet.title.toLowerCase().includes(query) ||
      snippet.description?.toLowerCase().includes(query) ||
      snippet.code.toLowerCase().includes(query)
    );
  }, [snippets, searchQuery]);

  // Manejar búsqueda con debounce
  const handleSearchChange = (e) => {
    if (searchDebounce.current) {
      clearTimeout(searchDebounce.current);
    }
    searchDebounce.current = setTimeout(() => {
      setSearchQuery(e.target.value);
    }, 300);
  };

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
              defaultValue={searchQuery}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Language filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === 'all'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveFilter(activeFilter === 'ssjs' ? 'all' : 'ssjs')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === 'ssjs'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                SSJS
              </button>
              <button
                onClick={() => setActiveFilter(activeFilter === 'sql' ? 'all' : 'sql')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === 'sql'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                SQL
              </button>
              <button
                onClick={() => setActiveFilter(activeFilter === 'ampscript' ? 'all' : 'ampscript')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === 'ampscript'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                AMPscript
              </button>
              <button
                onClick={() => setActiveFilter(activeFilter === 'private' ? 'all' : 'private')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === 'private'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
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
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando fragmentos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchUserSnippets()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
          </div>
        </>
      )}
    </div>
  );
};

export default UserSnippetsPage;
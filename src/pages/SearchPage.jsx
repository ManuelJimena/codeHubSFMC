import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import CodeCard from '../components/CodeCard';
import { Search as SearchIcon } from 'lucide-react';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState([]);
  // Cargar datos iniciales
  useEffect(() => {
    fetchUserFavorites();
  }, []);

  const fetchUserFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('favorites')
        .select('snippet_id')
        .eq('user_id', user.id);
      
      if (!error && data) {
        setFavorites(data.map(fav => fav.snippet_id));
      }
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      let query = supabase
        .from('snippets')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('is_public', true)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%`);
      
      if (selectedLanguage !== 'all') {
        query = query.eq('language', selectedLanguage);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error searching snippets:', error);
      } else {
        setSnippets(data || []);
      }
    } catch (error) {
      console.error('Error searching snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (snippetId) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Redirect to login or show a message
      return;
    }
    
    const isFavorite = favorites.includes(snippetId);
    
    if (isFavorite) {
      // Eliminar de favoritos
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('snippet_id', snippetId);
      
      if (!error) {
        setFavorites(favorites.filter(id => id !== snippetId));
        
        // Decrementar contador de votos
        const { error: updateError } = await supabase.rpc('decrement_votes', {
          snippet_id: snippetId
        });
        
        if (!updateError) {
          setSnippets(snippets.map(snippet => 
            snippet.id === snippetId 
              ? { ...snippet, votes: snippet.votes - 1 } 
              : snippet
          ));
        }
      }
    } else {
      // Añadir a favoritos
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, snippet_id: snippetId });
      
      if (!error) {
        setFavorites([...favorites, snippetId]);
        
        // Incrementar contador de votos
        const { error: updateError } = await supabase.rpc('increment_votes', {
          snippet_id: snippetId
        });
        
        if (!updateError) {
          setSnippets(snippets.map(snippet => 
            snippet.id === snippetId 
              ? { ...snippet, votes: snippet.votes + 1 } 
              : snippet
          ));
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buscar fragmentos de código</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Encuentra fragmentos de código por título, descripción o contenido
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, descripción o contenido..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filtrar por lenguaje
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedLanguage('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedLanguage === 'all'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
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
                type="button"
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
                type="button"
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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buscando...
                </span>
              ) : (
                <span className="flex items-center">
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Buscar
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      {searched && (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {snippets.length > 0
                    ? `Resultados de búsqueda (${snippets.length})`
                    : 'No se encontraron resultados'}
                </h2>
              </div>

              {snippets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {snippets.map(snippet => (
                    <CodeCard
                      key={snippet.id}
                      snippet={snippet}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={favorites.includes(snippet.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <p className="text-gray-500 dark:text-gray-400">
                    No se encontraron fragmentos de código que coincidan con tu búsqueda.
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Intenta con diferentes términos o filtros.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
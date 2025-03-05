import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import CodeCard from '../components/CodeCard';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const HomePage = () => {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        await Promise.all([
          fetchSnippets(),
          user && fetchUserFavorites()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
        toast.error('Error al cargar los datos');
      }
    };

    loadData();
  }, [selectedLanguage, user]);

  const fetchSnippets = async () => {
    try {
      let query = supabase
        .from('snippets')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (selectedLanguage !== 'all') {
        query = query.eq('language', selectedLanguage);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setSnippets(data || []);
    } catch (error) {
      console.error('Error fetching snippets:', error);
      throw new Error('Error al cargar los fragmentos de código');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('snippet_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setFavorites(data?.map(fav => fav.snippet_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  };

  const handleToggleFavorite = async (snippetId) => {
    if (!user) {
      toast.error('Debes iniciar sesión para añadir a favoritos');
      return;
    }
    
    try {
      const isFavorite = favorites.includes(snippetId);
      
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('snippet_id', snippetId);
        
        if (error) throw error;
        
        setFavorites(favorites.filter(id => id !== snippetId));
        
        // Decrement vote count
        await supabase.rpc('decrement_votes', {
          snippet_id: snippetId
        });
        
        setSnippets(snippets.map(snippet => 
          snippet.id === snippetId 
            ? { ...snippet, votes: snippet.votes - 1 } 
            : snippet
        ));

        toast.success('Eliminado de favoritos');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, snippet_id: snippetId });
        
        if (error) throw error;
        
        setFavorites([...favorites, snippetId]);
        
        // Increment vote count
        await supabase.rpc('increment_votes', {
          snippet_id: snippetId
        });
        
        setSnippets(snippets.map(snippet => 
          snippet.id === snippetId 
            ? { ...snippet, votes: snippet.votes + 1 } 
            : snippet
        ));

        toast.success('Añadido a favoritos');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error al actualizar favoritos');
    }
  };

  const filteredSnippets = snippets.filter(snippet => 
    snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Explora el Pinterest del Código
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
          Descubre nuevos fragmentos guardados por la comunidad
        </p>
        
        <div className="mt-8 max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Buscar fragmentos de código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="mb-8 flex justify-center">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedLanguage === 'all'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setSelectedLanguage('all')}
          >
            Todos
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedLanguage === 'ssjs'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setSelectedLanguage('ssjs')}
          >
            SSJS
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedLanguage === 'sql'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setSelectedLanguage('sql')}
          >
            SQL
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedLanguage === 'ampscript'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setSelectedLanguage('ampscript')}
          >
            AMPscript
          </button>
        </div>
      </div>
      
      {error ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-red-500 dark:text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
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
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.includes(snippet.id)}
                  />
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No se encontraron fragmentos de código.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
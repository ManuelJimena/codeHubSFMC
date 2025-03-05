import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CodeCard from '../components/CodeCard';

const FavoritesPage = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          snippet_id,
          snippets:snippets(
            *,
            user:profiles(username, avatar_url)
          )
        `)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching favorites:', error);
      } else {
        const favoriteSnippets = data
          .map(item => item.snippets)
          .filter(Boolean);
        
        setSnippets(favoriteSnippets);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (snippetId) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;
    
    // Remove from favorites
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('snippet_id', snippetId);
    
    if (!error) {
      // Decrement vote count
      await supabase.rpc('decrement_votes', {
        snippet_id: snippetId
      });
      
      // Update local state
      setSnippets(snippets.filter(snippet => snippet.id !== snippetId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tus favoritos</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Fragmentos de código que has guardado como favoritos
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {snippets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snippets.map(snippet => (
                <CodeCard
                  key={snippet.id}
                  snippet={snippet}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tienes favoritos</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Explora fragmentos de código y añádelos a tus favoritos para verlos aquí
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoritesPage;
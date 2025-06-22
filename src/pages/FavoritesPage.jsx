import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CodeCard from '../components/CodeCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FavoritesPage = () => {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);

    try {
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
        throw new Error('Error al cargar los favoritos');
      } else {
        const favoriteSnippets = data
          .map(item => item.snippets)
          .filter(Boolean);
        
        if (!favoriteSnippets.length) {
          console.log('No se encontraron favoritos');
        }
        
        setSnippets(favoriteSnippets);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError(error.message);
      toast.error(error.message || 'Error al cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (snippetId) => {
    if (!user) {
      toast.error('Debes iniciar sesión para gestionar favoritos');
      return;
    }
    
    try {
      // Eliminar de favoritos
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('snippet_id', snippetId);
      
      if (error) throw error;
      
      // Decrementar contador de votos
      await supabase.rpc('decrement_votes', {
        snippet_id: snippetId
      });
      
      // Actualizar estado local
      setSnippets(snippets.filter(snippet => snippet.id !== snippetId));
      toast.success('Eliminado de favoritos');
    } catch (error) {
      console.error('Error updating vote count:', error);
      toast.error('Error al eliminar de favoritos');
      toast.error('Error al actualizar el contador de votos');
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
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando favoritos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchFavorites()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
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
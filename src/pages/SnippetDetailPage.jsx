import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Heart, Copy, Edit, Trash2, ArrowLeft, Share2 } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const SnippetDetailPage = () => {
  const { id } = useParams();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  useEffect(() => {
    // Cargar datos cuando el componente se monta
    const loadData = async () => {
      try {
        setError(null);
        await Promise.all([
          fetchSnippet(),
          user && checkIfFavorite(id)
        ]);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos');
        toast.error('Error al cargar los datos');
      }
    };

    if (id) {
      loadData();
    }
  }, [id, user]);

  const fetchSnippet = async () => {
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setSnippet(data);
    } catch (error) {
      console.error('Error al obtener fragmento:', error);
      throw new Error('Error al cargar el fragmento de código');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async (snippetId) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('snippet_id', snippetId)
        .maybeSingle();
      
      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error al verificar estado de favorito:', error);
      throw error;
    }
  };

  const handleToggleFavorite = async () => {
    if (!snippet || !user) {
      toast.error('Debes iniciar sesión para añadir a favoritos');
      navigate('/login');
      return;
    }
    
    try {
      if (isFavorite) {
        // Eliminar de favoritos
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('snippet_id', snippet.id);
        
        if (error) throw error;
        
        // Decrementar contador de votos
        await supabase.rpc('decrement_votes', {
          snippet_id: snippet.id
        });
        
        setSnippet({
          ...snippet,
          votes: snippet.votes - 1
        });
        setIsFavorite(false);
        toast.success('Eliminado de favoritos');
      } else {
        // Añadir a favoritos
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, snippet_id: snippet.id });
        
        if (error) throw error;
        
        // Incrementar contador de votos
        await supabase.rpc('increment_votes', {
          snippet_id: snippet.id
        });
        
        setSnippet({
          ...snippet,
          votes: snippet.votes + 1
        });
        setIsFavorite(true);
        toast.success('Añadido a favoritos');
      }
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
      toast.error('Error al actualizar favoritos');
    }
  };

  const handleCopyCode = () => {
    if (!snippet) return;
    
    navigator.clipboard.writeText(snippet.code);
    toast.success('Código copiado al portapapeles');
  };

  const handleShareSnippet = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('URL copiada al portapapeles');
  };

  const handleDeleteSnippet = async () => {
    if (!snippet || !user) return;
    
    if (user.id !== snippet.user_id) {
      toast.error('No tienes permiso para eliminar este fragmento');
      return;
    }
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este fragmento de código? Esta acción no se puede deshacer.')) {
      try {
        const { error } = await supabase
          .from('snippets')
          .delete()
          .eq('id', snippet.id);
        
        if (error) throw error;
        
        toast.success('Fragmento de código eliminado exitosamente');
        navigate('/');
      } catch (error) {
        console.error('Error al eliminar fragmento:', error);
        toast.error('Error al eliminar el fragmento de código');
      }
    }
  };

  const getLanguageLabel = (language) => {
    switch (language) {
      case 'ssjs':
        return 'SSJS';
      case 'sql':
        return 'SQL';
      case 'ampscript':
        return 'AMPscript';
      default:
        return language;
    }
  };

  const getLanguageForHighlighter = (language) => {
    switch (language) {
      case 'ssjs':
        return 'javascript';
      case 'sql':
        return 'sql';
      case 'ampscript':
        return 'markup';
      default:
        return 'javascript';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {error || 'Fragmento no encontrado'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          El fragmento de código que estás buscando no existe o ha sido eliminado.
        </p>
        <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al inicio
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{snippet.title}</h1>
              <div className="flex items-center mt-2">
                {snippet.user && (
                  <div className="flex items-center mr-4">
                    {snippet.user.avatar_url ? (
                      <img
                        src={snippet.user.avatar_url}
                        alt={snippet.user.username}
                        className="h-6 w-6 rounded-full mr-2"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 mr-2"></div>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-300">{snippet.user.username}</span>
                  </div>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(snippet.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                snippet.language === 'ssjs' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                snippet.language === 'sql' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              }`}>
                {getLanguageLabel(snippet.language)}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                snippet.is_public ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {snippet.is_public ? 'Público' : 'Privado'}
              </span>
            </div>
          </div>
          
          {snippet.description && (
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300">{snippet.description}</p>
            </div>
          )}
          
          <div className="bg-gray-900 dark:bg-gray-950 rounded-md overflow-hidden mb-6 relative">
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={handleCopyCode}
                className="p-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                title="Copiar código"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <SyntaxHighlighter 
              language={getLanguageForHighlighter(snippet.language)}
              style={darkMode ? atomOneDark : atomOneLight}
              customStyle={{ 
                padding: '1.5rem', 
                borderRadius: '0.375rem', 
                fontSize: '0.875rem',
                backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5'
              }}
              wrapLines={true}
              showLineNumbers={true}
              lineNumberStyle={{ color: darkMode ? '#6b7280' : '#9ca3af', minWidth: '2.5em', paddingRight: '1em', textAlign: 'right' }}
            >
              {snippet.code}
            </SyntaxHighlighter>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleToggleFavorite}
                className={`flex items-center ${isFavorite ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'}`}
              >
                <Heart className="h-5 w-5 mr-1" fill={isFavorite ? 'currentColor' : 'none'} />
                <span>{snippet.votes}</span>
              </button>
              <button
                onClick={handleShareSnippet}
                className="flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Share2 className="h-5 w-5 mr-1" />
                <span>Compartir</span>
              </button>
            </div>
            
            {user && user.id === snippet.user_id && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/edit/${snippet.id}`}
                  className="flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Edit className="h-5 w-5 mr-1" />
                  <span>Editar</span>
                </Link>
                <button
                  onClick={handleDeleteSnippet}
                  className="flex items-center text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                >
                  <Trash2 className="h-5 w-5 mr-1" />
                  <span>Eliminar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetDetailPage;
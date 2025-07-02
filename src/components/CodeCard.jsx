import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Copy, ExternalLink } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const CodeCard = memo(({ snippet, onToggleFavorite, isFavorite = false }) => {
  const { darkMode } = useTheme();
  
  const getLanguageLabel = React.useCallback((language) => {
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
  }, []);

  const getLanguageForHighlighter = React.useCallback((language) => {
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
  }, []);

  const getLanguageColorClasses = React.useCallback((language) => {
    switch (language) {
      case 'ssjs':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'sql':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'ampscript':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }, []);

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const truncateCode = (code, maxLength = 200) => {
    return truncateText(code, maxLength);
  };
  
  const truncatedTitle = truncateText(snippet.title, 50);
  const truncatedDescription = truncateText(snippet.description, 80);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(snippet.id);
    }
  };

  const handleCopyCode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(snippet.code);
    toast.success('Código copiado al portapapeles');
  };

  return (
    <div className="card-interactive group overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <Link 
            to={`/snippet/${snippet.id}`} 
            className="flex-1 mr-3"
            title={snippet.title}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
              {truncatedTitle}
            </h3>
          </Link>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLanguageColorClasses(snippet.language)}`}>
              {getLanguageLabel(snippet.language)}
            </span>
          </div>
        </div>
        
        {/* Description */}
        {snippet.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2" title={snippet.description}>
            {truncatedDescription}
          </p>
        )}
        
        {/* Code Preview */}
        <div className="relative bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden mb-4 group-hover:shadow-lg transition-shadow duration-300">
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopyCode}
              className="p-1.5 bg-gray-700/80 hover:bg-gray-600 text-gray-300 hover:text-white rounded transition-colors"
              title="Copiar código"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <SyntaxHighlighter 
            language={getLanguageForHighlighter(snippet.language)}
            style={darkMode ? atomOneDark : atomOneLight}
            customStyle={{ 
              padding: '1rem', 
              borderRadius: '0.5rem', 
              fontSize: '0.75rem',
              backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa',
              margin: 0,
              maxHeight: '120px',
              overflow: 'hidden'
            }}
            wrapLines={true}
            showLineNumbers={false}
          >
            {truncateCode(snippet.code)}
          </SyntaxHighlighter>
          {snippet.code.length > 200 && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent dark:from-gray-950"></div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleFavoriteClick}
              className={`flex items-center space-x-1 transition-colors ${
                isFavorite 
                  ? 'text-red-500 dark:text-red-400' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'
              }`}
              title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
              <span className="font-medium">{snippet.votes || 0}</span>
            </button>
            
            <Link 
              to={`/snippet/${snippet.id}`} 
              className="flex items-center space-x-1 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              title="Ver fragmento completo"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver</span>
            </Link>
          </div>
          
          {/* Author */}
          {snippet.user && (
            <div className="flex items-center space-x-2">
              {snippet.user.avatar_url ? (
                <img 
                  src={snippet.user.avatar_url} 
                  alt={snippet.user.username}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {snippet.user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                {snippet.user.username}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CodeCard.displayName = 'CodeCard';

export default CodeCard;
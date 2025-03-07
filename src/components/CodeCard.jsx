import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTheme } from '../context/ThemeContext';

const CodeCard = ({ snippet, onToggleFavorite, isFavorite = false }) => {
  const { darkMode } = useTheme();
  
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

  // Función genérica para truncar texto
  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  const truncateCode = (code, maxLength = 200) => {
    return truncateText(code, maxLength);
  };
  
  const truncatedTitle = truncateText(snippet.title, 28);
  const truncatedDescription = truncateText(snippet.description, 38);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/snippet/${snippet.id}`} className="text-lg font-semibold text-gray-800 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400" title={snippet.title}>
            {truncatedTitle}
          </Link>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              snippet.language === 'ssjs' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
              snippet.language === 'sql' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
              'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            }`}>
              {getLanguageLabel(snippet.language)}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3" title={snippet.description}>{truncatedDescription}</p>
        
        <div className="bg-gray-900 dark:bg-gray-950 rounded-md overflow-hidden mb-3">
          <SyntaxHighlighter 
            language={getLanguageForHighlighter(snippet.language)}
            style={darkMode ? atomOneDark : atomOneLight}
            customStyle={{ 
              padding: '1rem', 
              borderRadius: '0.375rem', 
              fontSize: '0.875rem',
              backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5'
            }}
            wrapLines={true}
            showLineNumbers={true}
            lineNumberStyle={{ color: darkMode ? '#6b7280' : '#9ca3af', minWidth: '2.5em', paddingRight: '1em', textAlign: 'right' }}
          >
            {truncateCode(snippet.code)}
          </SyntaxHighlighter>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onToggleFavorite && onToggleFavorite(snippet.id)}
              className={`flex items-center ${isFavorite ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'}`}
            >
              <Heart className="h-4 w-4 mr-1" fill={isFavorite ? 'currentColor' : 'none'} />
              <span>{snippet.votes}</span>
            </button>
            <Link to={`/snippet/${snippet.id}`} className="flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
              <Eye className="h-4 w-4 mr-1" />
              <span>Ver</span>
            </Link>
          </div>
          
          {snippet.user && (
            <div className="flex items-center">
              {snippet.user.avatar_url ? (
                <img 
                  src={snippet.user.avatar_url} 
                  alt={snippet.user.username}
                  className="h-5 w-5 rounded-full mr-1"
                />
              ) : (
                <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-600 mr-1"></div>
              )}
              <span>{snippet.user.username}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeCard;
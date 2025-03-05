import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, Copy, Check } from 'lucide-react';
import OpenAI from 'openai';
import toast from 'react-hot-toast';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTheme } from '../context/ThemeContext';

const client = new OpenAI({
  baseURL: import.meta.env.VITE_OPENROUTER_BASE_URL,
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "HTTP-Referer": window.location.origin,
    "X-Title": "codeHubSFMC"
  }
});

const CodeBlock = ({ code, language }) => {
  const { darkMode } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Código copiado al portapapeles');
  };

  return (
    <div className="relative">
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={handleCopy}
          className="p-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
          title="Copiar código"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'javascript'}
        style={darkMode ? atomOneDark : atomOneLight}
        customStyle={{
          padding: '1.5rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5',
          marginTop: '0.5rem',
          marginBottom: '0.5rem'
        }}
        wrapLines={true}
        showLineNumbers={true}
        lineNumberStyle={{
          color: darkMode ? '#6b7280' : '#9ca3af',
          minWidth: '2.5em',
          paddingRight: '1em',
          textAlign: 'right'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

const MessageContent = ({ content }) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }

    // Add code block
    parts.push({
      type: 'code',
      language: match[1] || 'javascript',
      content: match[2].trim()
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  return (
    <div>
      {parts.length > 0 ? (
        parts.map((part, index) => (
          part.type === 'code' ? (
            <CodeBlock key={index} code={part.content} language={part.language} />
          ) : (
            <p key={index} className="whitespace-pre-wrap mb-2">
              {part.content}
            </p>
          )
        ))
      ) : (
        <p className="whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
};

const AIPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        return 'Buenos días';
      } else if (hour >= 12 && hour < 20) {
        return 'Buenas tardes';
      } else {
        return 'Buenas noches';
      }
    };

    setGreeting(getGreeting());
  }, [user, navigate]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const completion = await client.chat.completions.create({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Eres un asistente experto en Marketing Cloud de Salesforce, especialmente en SSJS, SQL y AMPscript. Proporciona respuestas concisas y útiles, con ejemplos de código cuando sea relevante. Cuando proporciones ejemplos de código, asegúrate de envolverlos en bloques de código usando triple backtick (```) y especifica el lenguaje."
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      if (completion.choices && completion.choices[0]?.message?.content) {
        const assistantMessage = completion.choices[0].message.content;
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      } else {
        throw new Error('Respuesta inválida del API');
      }
    } catch (error) {
      console.error('Error al obtener respuesta:', error);
      toast.error('Error al obtener respuesta. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center mb-8">
            <Bot className="h-12 w-12 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white ml-3">
              IA SFMC
            </h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {greeting}, {user.username}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              ¿En qué puedo ayudarte hoy?
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div 
              ref={chatContainerRef}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto mb-4"
            >
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  <p>Puedes preguntarme sobre:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Código SSJS para Marketing Cloud</li>
                    <li>• Consultas SQL para Data Extensions</li>
                    <li>• Sintaxis y funciones de AMPscript</li>
                    <li>• Mejores prácticas en SFMC</li>
                  </ul>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <MessageContent content={message.content} />
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="text-center py-2">
                  <div className="inline-block animate-bounce">
                    <span className="text-gray-500 dark:text-gray-400">●</span>
                  </div>
                  <div className="inline-block animate-bounce delay-100">
                    <span className="text-gray-500 dark:text-gray-400">●</span>
                  </div>
                  <div className="inline-block animate-bounce delay-200">
                    <span className="text-gray-500 dark:text-gray-400">●</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
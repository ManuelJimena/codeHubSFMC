// src/pages/AIPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, Copy, Check } from 'lucide-react';
import OpenAI from 'openai';
import toast from 'react-hot-toast';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {
  atomOneDark,
  atomOneLight
} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTheme } from '../context/ThemeContext';
import { getApiKeys } from '../lib/api-keys';

let client = null;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES AUXILIARES
// ─────────────────────────────────────────────────────────────────────────────
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
        wrapLines
        showLineNumbers
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
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }

    parts.push({
      type: 'code',
      language: match[1] || 'javascript',
      content: match[2].trim()
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  return (
    <div>
      {parts.length > 0 ? (
        parts.map((part, index) =>
          part.type === 'code' ? (
            <CodeBlock key={index} code={part.content} language={part.language} />
          ) : (
            <p key={index} className="whitespace-pre-wrap mb-2">
              {part.content}
            </p>
          )
        )
      ) : (
        <p className="whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const AIPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [greeting, setGreeting] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null); // para auto‑resize

  // ─────────────────────────────────────
  // Auto‑scroll del contenedor de chat
  // ─────────────────────────────────────
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ─────────────────────────────────────
  // Inicializar cliente OpenAI + saludo
  // ─────────────────────────────────────
  useEffect(() => {
    const initializeClient = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const keys = await getApiKeys();
        if (!keys) {
          toast.error('Error al obtener las claves de API');
          return;
        }

        client = new OpenAI({
          apiKey: keys.OPENROUTER_API_KEY,
          baseURL: keys.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
          dangerouslyAllowBrowser: true,
          defaultHeaders: {
            'HTTP-Referer': window.location.origin,
            'X-Title': 'codeHubSFMC'
          }
        });

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing OpenAI client:', error);
        toast.error('Error al inicializar el cliente de IA');
      }
    };

    initializeClient();

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return 'Buenos días';
      if (hour >= 12 && hour < 20) return 'Buenas tardes';
      return 'Buenas noches';
    };

    setGreeting(getGreeting());
  }, [user, navigate]);

  // ─────────────────────────────────────
  // Input auto‑resize
  // ─────────────────────────────────────
  const updateTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    updateTextareaHeight();
  };

  // ─────────────────────────────────────
  // Envío del formulario
  // ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isInitialized) return;

    const userMessage = input.trim();
    setInput('');
    updateTextareaHeight(); // reset altura mínima
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const completion = await client.chat.completions.create({
        model: 'openai/gpt-3.5-turbo',
  messages: [
    {
      role: 'system',
      content: `Eres SFMC‑AI, un asistente senior especializado en Salesforce Marketing Cloud.
Tu experiencia principal es:
• AMPscript avanzado para Email y CloudPages
• Server‑Side JavaScript (SSJS) en Scripts Activities y CloudPages
• SQL para Query Activities y Data Views
Responde siempre en español neutro.
Cuando proporciones código:
  – Usa el lenguaje correcto tras \`\`\` (ej. \`\`\`ssjs, \`\`\`sql, \`\`\`ampscript).
  – Incluye comentarios breves dentro del bloque si ayudan a entenderlo.
  – No añadas texto fuera de los bloques salvo explicación o pasos de uso.
Sé breve y directo; evita relleno, disculpas y divagaciones.`
    },
    ...messages.map((msg) => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ],
  temperature: 0.25,
  top_p: 1,
  max_tokens: 1000,
  frequency_penalty: 0.2,
  presence_penalty: 0,
});
      if (completion.choices?.[0]?.message?.content) {
        const assistantMessage = completion.choices[0].message.content;
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: assistantMessage }
        ]);
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

  // ─────────────────────────────────────
  // Atajos de teclado
  // ─────────────────────────────────────
  const handleKeyDown = (e) => {
    // Shift + Enter → salto de línea sin enviar
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      const cursorPosition = e.target.selectionStart;
      const newValue =
        input.slice(0, cursorPosition) + '\n' + input.slice(cursorPosition);
      setInput(newValue);

      setTimeout(() => {
        e.target.selectionStart = cursorPosition + 1;
        e.target.selectionEnd = cursorPosition + 1;
        updateTextareaHeight();
      }, 0);

      // Enter → enviar
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!user) return null;

  // ─────────────────────────────────────
  // Render
  // ─────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          {/* Cabecera */}
          <div className="flex items-center justify-center mb-8">
            <Bot className="h-12 w-12 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white ml-3">
              IA SFMC
            </h1>
          </div>

          {/* Saludo */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {greeting}, {user.username}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              ¿En qué puedo ayudarte hoy?
            </p>
          </div>

          {/* Chat */}
          <div className="max-w-2xl mx-auto">
            {/* Formulario */}
            <form onSubmit={handleSubmit} className="mb-4">
              {/* Contenedor relativo para colocar el botón flotante */}
              <div className="relative">
               <textarea
  ref={textareaRef}
  value={input}
  onChange={handleInputChange}
  onKeyDown={handleKeyDown}
  placeholder="Escribe tu pregunta... (Shift + Enter para nueva línea)"
  className="block w-full px-4 py-2 pr-16 border border-gray-300 dark:border-gray-600
             rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
             resize-none overflow-y-auto" 
  disabled={isLoading}
  rows={1}
  style={{ minHeight: '42px', maxHeight: '200px' }}
  aria-label="Caja de mensaje para el chat"
/>
                {/* Botón */}
               <button
  type="submit"
  disabled={isLoading || !input.trim() || !isInitialized}
  className="absolute right-4 bottom-2 h-8 w-8 flex items-center justify-center
             bg-blue-500 text-white rounded-full hover:bg-blue-600
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
             dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
  title="Enviar"
>
  <Send className="h-4 w-4" />
</button>
              </div>
              {!isInitialized && (
                <p className="mt-2 text-sm text-red-500">
                  Conectando con el servicio de IA… Puedes escribir, pero el
                  envío se habilitará en unos segundos.
                </p>
              )}
            </form>

            {/* Contenedor de mensajes */}
            <div
              ref={chatContainerRef}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto mt-4"
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
                  <p className="mt-4 text-orange-500 font-semibold">
                    No compartas datos privados, sensibles o información de
                    clientes en este chat.
                  </p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPage;

import { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Eye,
  Contrast,
  Type,
  RotateCcw,
  Pause,
  PersonStanding
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAccessibility } from '../context/AccessibilityContext';  // ⬅️ nuevo hook
import toast from 'react-hot-toast';

const AccessibilityMenu = () => {
  /* ---------------- ESTADO LOCAL ---------------- */
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    textToSpeech: false,
    highContrast: false,
    grayscale: false,
    largeText: false
  });
  const [isReading, setIsReading] = useState(false);

  /* ---------------- CONTEXTOS ---------------- */
  const { darkMode } = useTheme();
  const { showMenu } = useAccessibility();            // ⬅️ preferencia global almacenada en localStorage

  /* ---------------- REFERENCIAS ---------------- */
  const menuRef = useRef(null);
  const speechSynthesis =
    typeof window !== 'undefined' ? window.speechSynthesis : null;

  /* ---------------- EFECTOS ---------------- */
  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Aplicar clases de accesibilidad al <html>
  useEffect(() => {
    const root = document.documentElement;

    // Alto contraste
    settings.highContrast
      ? root.classList.add('accessibility-high-contrast')
      : root.classList.remove('accessibility-high-contrast');

    // Escala de grises
    settings.grayscale
      ? root.classList.add('accessibility-grayscale')
      : root.classList.remove('accessibility-grayscale');

    // Texto grande
    settings.largeText
      ? root.classList.add('accessibility-large-text')
      : root.classList.remove('accessibility-large-text');
  }, [settings]);

  /* ---------------- HANDLERS ---------------- */
  // Lector de texto
  const toggleTextToSpeech = () => {
    if (!speechSynthesis) {
      toast.error('Tu navegador no soporta síntesis de voz');
      return;
    }

    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
      setSettings((prev) => ({ ...prev, textToSpeech: false }));
      toast.success('Lectura de texto desactivada');
      return;
    }

    // --- Iniciar lectura ---
    setSettings((prev) => ({ ...prev, textToSpeech: true }));
    setIsReading(true);

    const selection = window.getSelection();
    let textToRead = '';

    if (selection && selection.toString().trim()) {
      textToRead = selection.toString().trim();
      toast.success('Leyendo texto seleccionado');
    } else {
      const mainContent = document.querySelector('main') || document.body;
      textToRead = mainContent.innerText.slice(0, 500); // Limitar a 500 caracteres
      toast.success('Leyendo contenido de la página');
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'es-ES';
    utterance.rate = 0.8;
    utterance.onend = () => {
      setIsReading(false);
      setSettings((prev) => ({ ...prev, textToSpeech: false }));
    };

    speechSynthesis.speak(utterance);
  };

  // Alto contraste
  const toggleHighContrast = () => {
    const newValue = !settings.highContrast;
    setSettings((prev) => ({ ...prev, highContrast: newValue }));
    toast.success(
      newValue ? 'Alto contraste activado' : 'Alto contraste desactivado'
    );
  };

  // Escala de grises
  const toggleGrayscale = () => {
    const newValue = !settings.grayscale;
    setSettings((prev) => ({ ...prev, grayscale: newValue }));
    toast.success(
      newValue ? 'Escala de grises activada' : 'Escala de grises desactivada'
    );
  };

  // Texto grande
  const toggleLargeText = () => {
    const newValue = !settings.largeText;
    setSettings((prev) => ({ ...prev, largeText: newValue }));
    toast.success(
      newValue ? 'Texto grande activado' : 'Texto grande desactivado'
    );
  };

  // Resetear todas las opciones
  const resetSettings = () => {
    setSettings({
      textToSpeech: false,
      highContrast: false,
      grayscale: false,
      largeText: false
    });

    if (speechSynthesis && isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
    }

    toast.success('Configuraciones de accesibilidad restablecidas');
  };

  /* ---------------- DATASET PARA EL MENÚ RADIAL ---------------- */
  const menuItems = [
    {
      icon: isReading ? Pause : Volume2,
      label: isReading ? 'Pausar lectura' : 'Lector de texto',
      action: toggleTextToSpeech,
      active: settings.textToSpeech || isReading,
      position: 'top'
    },
    {
      icon: Contrast,
      label: 'Alto contraste',
      action: toggleHighContrast,
      active: settings.highContrast,
      position: 'right'
    },
    {
      icon: Eye,
      label: 'Escala de grises',
      action: toggleGrayscale,
      active: settings.grayscale,
      position: 'bottom'
    },
    {
      icon: Type,
      label: 'Texto grande',
      action: toggleLargeText,
      active: settings.largeText,
      position: 'left'
    }
  ];

  /* ---------------- FUNCIONES DE UTILIDAD ---------------- */
  const getPositionClasses = (position) => {
    const positions = {
      top: '-top-16 left-1/2 -translate-x-1/2',
      right: 'top-1/2 -translate-y-1/2 -right-16',
      bottom: '-bottom-16 left-1/2 -translate-x-1/2',
      left: 'top-1/2 -translate-y-1/2 -left-16'
    };
    return positions[position] || '';
  };

  /* ---------------- RENDER ---------------- */
  // Si el usuario decidió ocultar el botón, no renderizamos nada
  if (!showMenu) return null;

  return (
    <>
      {/* Estilos in-line para accesibilidad (podrías moverlos a tu CSS global) */}
      <style>{`
        .accessibility-high-contrast {
          filter: contrast(150%) brightness(1.2);
        }
        .accessibility-grayscale {
          filter: grayscale(100%);
        }
        .accessibility-large-text {
          font-size: 1.25em !important;
        }
        .accessibility-large-text * {
          font-size: inherit !important;
        }
      `}</style>

      <div
        ref={menuRef}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 transition-transform duration-300 ease-out ${
          isOpen
            ? '-translate-x-14 -translate-y-14 sm:-translate-x-12 sm:-translate-y-12'
            : ''
        }`}
        role="region"
        aria-label="Menú de accesibilidad"
      >
        {/* Botón principal */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2
            ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
            ${isOpen ? 'rotate-45' : ''}
          `}
          aria-label={
            isOpen ? 'Cerrar menú de accesibilidad' : 'Abrir menú de accesibilidad'
          }
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <PersonStanding className="w-6 h-6 mx-auto" />
        </button>

        {/* Menú radial */}
        {isOpen && (
          <div className="absolute inset-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className={`
                    absolute w-12 h-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 group
                    ${getPositionClasses(item.position)}
                    ${
                      item.active
                        ? darkMode
                          ? 'bg-green-600 text-white'
                          : 'bg-green-500 text-white'
                        : darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-white hover:bg-gray-50 text-gray-700'
                    }
                  `}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon className="w-6 h-6 mx-auto" />

                  {/* Tooltip */}
                  <span
                    className={`
                      absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10
                      ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'}
                    `}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* Botón reset (centro) */}
            <button
              onClick={resetSettings}
              className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 group
                ${
                  darkMode
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }
              `}
              aria-label="Restablecer configuraciones de accesibilidad"
              title="Restablecer todo"
            >
              <RotateCcw className="w-5 h-5 mx-auto" />

              {/* Tooltip */}
              <span
                className={`
                  absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10
                  ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'}
                `}
              >
                Restablecer todo
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AccessibilityMenu;

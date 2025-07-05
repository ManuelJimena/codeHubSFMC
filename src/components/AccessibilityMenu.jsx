import { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Eye, 
  ZoomIn, 
  Contrast, 
  Type, 
  MousePointer, 
  Focus,
  RotateCcw,
  Pause,
  Play
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Icono oficial de accesibilidad (Universal Access Symbol)
const AccessibilityIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    role="img"
    aria-label="Icono de accesibilidad"
  >
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5C14.8 5.5 14.6 5.4 14.5 5.3L13.5 4.7C13.1 4.4 12.6 4.2 12 4.2S10.9 4.4 10.5 4.7L9.5 5.3C9.4 5.4 9.2 5.5 9 5.5L3 7V9L9 7.5V10.5C9 11.1 9.4 11.5 10 11.5S11 11.1 11 10.5V8.5L12 8.2L13 8.5V10.5C13 11.1 13.4 11.5 14 11.5S15 11.1 15 10.5V7.5L21 9ZM14 12.5C14 13.3 13.3 14 12.5 14H11.5C10.7 14 10 13.3 10 12.5V12H8V12.5C8 14.4 9.6 16 11.5 16H12.5C14.4 16 16 14.4 16 12.5V12H14V12.5ZM12 18C10.9 18 10 18.9 10 20S10.9 22 12 22S14 21.1 14 20S13.1 18 12 18Z"/>
  </svg>
);

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [settings, setSettings] = useState({
    textToSpeech: false,
    highContrast: false,
    zoom: 100,
    grayscale: false,
    largeText: false,
    focusIndicator: false,
    reducedMotion: false,
    pauseAnimations: false
  });
  
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const menuRef = useRef(null);
  const speechSynthesis = window.speechSynthesis;
  const [isReading, setIsReading] = useState(false);

  // Cargar configuración del usuario
  useEffect(() => {
    const loadUserSettings = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('show_accessibility_menu')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error al cargar configuración de accesibilidad:', error);
            return;
          }

          setShowMenu(data?.show_accessibility_menu ?? true);
        } catch (error) {
          console.error('Error al cargar configuración:', error);
        }
      }
    };

    loadUserSettings();
  }, [user]);

  // Actualizar configuración del usuario
  const updateUserAccessibilitySettings = async (showAccessibilityMenu) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ show_accessibility_menu: showAccessibilityMenu })
        .eq('id', user.id);

      if (error) {
        console.error('Error al actualizar configuración:', error);
        toast.error('Error al guardar la configuración');
        return;
      }

      setShowMenu(showAccessibilityMenu);
      toast.success(
        showAccessibilityMenu 
          ? 'Menú de accesibilidad activado' 
          : 'Menú de accesibilidad desactivado'
      );
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      toast.error('Error al guardar la configuración');
    }
  };

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

  // Aplicar configuraciones de accesibilidad
  useEffect(() => {
    const root = document.documentElement;
    
    // Zoom
    if (settings.zoom !== 100) {
      root.style.fontSize = `${settings.zoom}%`;
    } else {
      root.style.fontSize = '';
    }

    // Alto contraste
    if (settings.highContrast) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }

    // Escala de grises
    if (settings.grayscale) {
      root.classList.add('accessibility-grayscale');
    } else {
      root.classList.remove('accessibility-grayscale');
    }

    // Texto grande
    if (settings.largeText) {
      root.classList.add('accessibility-large-text');
    } else {
      root.classList.remove('accessibility-large-text');
    }

    // Indicador de foco mejorado
    if (settings.focusIndicator) {
      root.classList.add('accessibility-focus-indicator');
    } else {
      root.classList.remove('accessibility-focus-indicator');
    }

    // Movimiento reducido
    if (settings.reducedMotion) {
      root.classList.add('accessibility-reduced-motion');
    } else {
      root.classList.remove('accessibility-reduced-motion');
    }

    // Pausar animaciones
    if (settings.pauseAnimations) {
      root.classList.add('accessibility-pause-animations');
    } else {
      root.classList.remove('accessibility-pause-animations');
    }

  }, [settings]);

  // Función para leer texto en voz alta
  const toggleTextToSpeech = () => {
    if (!speechSynthesis) {
      toast.error('Tu navegador no soporta síntesis de voz');
      return;
    }

    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
      setSettings(prev => ({ ...prev, textToSpeech: false }));
      toast.success('Lectura de texto desactivada');
    } else {
      setSettings(prev => ({ ...prev, textToSpeech: true }));
      setIsReading(true);
      
      // Leer el contenido principal de la página
      const mainContent = document.querySelector('main') || document.body;
      const textContent = mainContent.innerText.slice(0, 500); // Limitar a 500 caracteres
      
      const utterance = new SpeechSynthesisUtterance(textContent);
      utterance.lang = 'es-ES';
      utterance.rate = 0.8;
      utterance.onend = () => {
        setIsReading(false);
        setSettings(prev => ({ ...prev, textToSpeech: false }));
      };
      
      speechSynthesis.speak(utterance);
      toast.success('Iniciando lectura de texto');
    }
  };

  // Función para alternar alto contraste
  const toggleHighContrast = () => {
    const newValue = !settings.highContrast;
    setSettings(prev => ({ ...prev, highContrast: newValue }));
    toast.success(newValue ? 'Alto contraste activado' : 'Alto contraste desactivado');
  };

  // Función para cambiar zoom
  const changeZoom = (newZoom) => {
    setSettings(prev => ({ ...prev, zoom: newZoom }));
    toast.success(`Zoom ajustado al ${newZoom}%`);
  };

  // Función para alternar escala de grises
  const toggleGrayscale = () => {
    const newValue = !settings.grayscale;
    setSettings(prev => ({ ...prev, grayscale: newValue }));
    toast.success(newValue ? 'Escala de grises activada' : 'Escala de grises desactivada');
  };

  // Función para alternar texto grande
  const toggleLargeText = () => {
    const newValue = !settings.largeText;
    setSettings(prev => ({ ...prev, largeText: newValue }));
    toast.success(newValue ? 'Texto grande activado' : 'Texto grande desactivado');
  };

  // Función para alternar indicador de foco
  const toggleFocusIndicator = () => {
    const newValue = !settings.focusIndicator;
    setSettings(prev => ({ ...prev, focusIndicator: newValue }));
    toast.success(newValue ? 'Indicador de foco mejorado activado' : 'Indicador de foco normal');
  };

  // Función para alternar movimiento reducido
  const toggleReducedMotion = () => {
    const newValue = !settings.reducedMotion;
    setSettings(prev => ({ ...prev, reducedMotion: newValue }));
    toast.success(newValue ? 'Movimiento reducido activado' : 'Movimiento normal');
  };

  // Función para pausar/reanudar animaciones
  const togglePauseAnimations = () => {
    const newValue = !settings.pauseAnimations;
    setSettings(prev => ({ ...prev, pauseAnimations: newValue }));
    toast.success(newValue ? 'Animaciones pausadas' : 'Animaciones reanudadas');
  };

  // Función para resetear todas las configuraciones
  const resetSettings = () => {
    setSettings({
      textToSpeech: false,
      highContrast: false,
      zoom: 100,
      grayscale: false,
      largeText: false,
      focusIndicator: false,
      reducedMotion: false,
      pauseAnimations: false
    });
    
    if (speechSynthesis && isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
    }
    
    toast.success('Configuraciones de accesibilidad restablecidas');
  };

  const menuItems = [
    {
      icon: isReading ? Pause : Volume2,
      label: isReading ? 'Pausar lectura' : 'Lector de texto',
      action: toggleTextToSpeech,
      active: settings.textToSpeech || isReading,
      position: 'top-left'
    },
    {
      icon: Contrast,
      label: 'Alto contraste',
      action: toggleHighContrast,
      active: settings.highContrast,
      position: 'top'
    },
    {
      icon: ZoomIn,
      label: 'Zoom 120%',
      action: () => changeZoom(settings.zoom === 120 ? 100 : 120),
      active: settings.zoom === 120,
      position: 'top-right'
    },
    {
      icon: Eye,
      label: 'Escala de grises',
      action: toggleGrayscale,
      active: settings.grayscale,
      position: 'right'
    },
    {
      icon: Type,
      label: 'Texto grande',
      action: toggleLargeText,
      active: settings.largeText,
      position: 'bottom-right'
    },
    {
      icon: Focus,
      label: 'Indicador de foco',
      action: toggleFocusIndicator,
      active: settings.focusIndicator,
      position: 'bottom'
    },
    {
      icon: MousePointer,
      label: 'Movimiento reducido',
      action: toggleReducedMotion,
      active: settings.reducedMotion,
      position: 'bottom-left'
    },
    {
      icon: settings.pauseAnimations ? Play : Pause,
      label: settings.pauseAnimations ? 'Reanudar animaciones' : 'Pausar animaciones',
      action: togglePauseAnimations,
      active: settings.pauseAnimations,
      position: 'left'
    }
  ];

  const getPositionClasses = (position) => {
    const positions = {
      'top': '-top-16 left-1/2 -translate-x-1/2',
      'top-right': '-top-12 -right-12',
      'right': 'top-1/2 -translate-y-1/2 -right-16',
      'bottom-right': '-bottom-12 -right-12',
      'bottom': '-bottom-16 left-1/2 -translate-x-1/2',
      'bottom-left': '-bottom-12 -left-12',
      'left': 'top-1/2 -translate-y-1/2 -left-16',
      'top-left': '-top-12 -left-12'
    };
    return positions[position] || '';
  };

  // No mostrar el menú si el usuario ha elegido ocultarlo
  if (!showMenu) {
    return null;
  }

  return (
    <>
      {/* Estilos CSS para accesibilidad */}
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
        
        .accessibility-focus-indicator *:focus {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3) !important;
        }
        
        .accessibility-reduced-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .accessibility-pause-animations * {
          animation-play-state: paused !important;
        }
      `}</style>

      <div 
        ref={menuRef}
        className="fixed bottom-6 right-6 z-50"
        role="region"
        aria-label="Menú de accesibilidad"
      >
        {/* Botón principal con icono oficial de accesibilidad */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2
            ${darkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
            ${isOpen ? 'rotate-45' : ''}
          `}
          aria-label={isOpen ? 'Cerrar menú de accesibilidad' : 'Abrir menú de accesibilidad'}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <AccessibilityIcon className="w-6 h-6 mx-auto" />
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
                    ${item.active 
                      ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white')
                      : (darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-white hover:bg-gray-50 text-gray-700')
                    }
                  `}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 mx-auto" />
                  
                  {/* Tooltip */}
                  <span className={`
                    absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10
                    ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'}
                  `}>
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* Botón de reset en el centro */}
            <button
              onClick={resetSettings}
              className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 group
                ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}
              `}
              aria-label="Restablecer configuraciones de accesibilidad"
              title="Restablecer todo"
            >
              <RotateCcw className="w-4 h-4 mx-auto" />
              
              {/* Tooltip */}
              <span className={`
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10
                ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'}
              `}>
                Restablecer todo
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Exportar también el hook para usar en otras partes de la aplicación
export const useAccessibilitySettings = () => {
  const { user } = useAuth();

  const updateAccessibilityMenuVisibility = async (visible) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ show_accessibility_menu: visible })
        .eq('id', user.id);

      if (error) {
        console.error('Error al actualizar configuración:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      return false;
    }
  };

  return { updateAccessibilityMenuVisibility };
};

export default AccessibilityMenu;
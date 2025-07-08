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
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [settings, setSettings] = useState({
    textToSpeech: false,
    highContrast: false,
    grayscale: false,
    largeText: false
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

  // Calcular posición del menú para evitar que se salga de la pantalla
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const updatePosition = () => {
        const rect = menuRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Distancia desde los bordes para los iconos del menú radial
        const menuRadius = 80; // Distancia aproximada de los iconos desde el centro
        
        let newX = rect.left + rect.width / 2;
        let newY = rect.top + rect.height / 2;
        
        // Ajustar posición X si se sale por la derecha
        if (newX + menuRadius > viewportWidth) {
          newX = viewportWidth - menuRadius - 20;
        }
        
        // Ajustar posición X si se sale por la izquierda
        if (newX - menuRadius < 0) {
          newX = menuRadius + 20;
        }
        
        // Ajustar posición Y si se sale por abajo
        if (newY + menuRadius > viewportHeight) {
          newY = viewportHeight - menuRadius - 20;
        }
        
        // Ajustar posición Y si se sale por arriba
        if (newY - menuRadius < 0) {
          newY = menuRadius + 20;
        }
        
        setMenuPosition({ x: newX, y: newY });
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [isOpen]);

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

  // Función para resetear todas las configuraciones
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

  const getPositionClasses = (position) => {
    const positions = {
      'top': '-top-16 left-1/2 -translate-x-1/2',
      'right': 'top-1/2 -translate-y-1/2 -right-16',
      'bottom': '-bottom-16 left-1/2 -translate-x-1/2',
      'left': 'top-1/2 -translate-y-1/2 -left-16'
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
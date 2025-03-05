import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full"
      aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {darkMode ? (
        <>
          <Sun className="h-4 w-4" />
          <span>Modo claro</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span>Modo oscuro</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
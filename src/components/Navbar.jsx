import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code, User as UserIcon, LogOut, Heart, Plus, Menu, X, Shield, Moon, Sun, Bot, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Navbar = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut, refreshUser } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  // Función para forzar actualización de la sesión
  const handleForceRefresh = useCallback(async () => {
    try {
      toast.loading('Actualizando sesión...', { id: 'refresh' });
      await refreshUser();
      toast.success('Sesión actualizada', { id: 'refresh' });
    } catch (error) {
      console.error('Error al actualizar sesión:', error);
      toast.error('Error al actualizar', { id: 'refresh' });
    }
  }, [refreshUser]);

  const handleLogout = useCallback(async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/');
  }, [signOut, navigate]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar si el clic fue en un enlace del menú móvil
      const isMenuLink = event.target.closest('a');
      const isMenuButton = event.target.closest('button');
      
      // Solo cerrar si no es un clic en un enlace o botón dentro del menú
      if (!event.target.closest('.user-menu') && 
          !event.target.closest('.mobile-menu') && 
          !(mobileMenuOpen && (isMenuLink || isMenuButton))) {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]); // Añade mobileMenuOpen como dependencia

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center hover:opacity-80">
              <Code className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold">
                <span className="text-gray-800 dark:text-gray-200">codeHub</span>
                <span className="text-blue-500">SFMC</span>
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/explore" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Explorar
              </Link>
              {user && (
                <Link to="/ai" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  IA SFMC
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="hidden sm:flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/create" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    Crear
                  </Link>
                  <Link to="/favorites" className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white">
                    <Heart className="h-6 w-6" />
                  </Link>
                  <div className="relative user-menu">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.username}</span>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <UserIcon className="h-4 w-4 mr-2" />
                            Perfil
                          </Link>
                          <Link
                            to="/my-snippets"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Code className="h-4 w-4 mr-2" />
                            Mis fragmentos
                          </Link>
                          {user.is_admin && (
                            <Link
                              to="/admin"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Panel Admin
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              toggleTheme();
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            {darkMode ? (
                              <>
                                <Sun className="h-4 w-4 mr-2" />
                                Modo claro
                              </>
                            ) : (
                              <>
                                <Moon className="h-4 w-4 mr-2" />
                                Modo oscuro
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Cerrar sesión</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white flex items-center">
                    <span>Iniciar sesión</span>
                  </Link>
                  <Link to="/signup" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
                    <span>Registrarse</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none mobile-menu"
              >
                <span className="sr-only">Abrir menú principal</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-800 shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/explore" 
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Code className="h-5 w-5 mr-2" />
              Explorar
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/ai" 
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bot className="h-5 w-5 mr-2" />
                  IA SFMC
                </Link>
                <Link 
                  to="/create" 
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear fragmento
                </Link>
                <Link 
                  to="/favorites" 
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Favoritos
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon className="h-5 w-5 mr-2" />
                  Perfil
                </Link>
                <Link 
                  to="/my-snippets" 
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Code className="h-5 w-5 mr-2" />
                  Mis fragmentos
                </Link>
                {user.is_admin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    Panel Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {darkMode ? (
                    <>
                      <Sun className="h-5 w-5 mr-2" />
                      Modo claro
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 mr-2" />
                      Modo oscuro
                    </>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Iniciar sesión
                </Link>
                <Link 
                  to="/signup" 
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon className="h-5 w-5 mr-2" />
                  Registrarse
                </Link>
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {darkMode ? (
                    <>
                      <Sun className="h-5 w-5 mr-2" />
                      Modo claro
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 mr-2" />
                      Modo oscuro
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
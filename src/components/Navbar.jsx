import { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code, User as UserIcon, LogOut, Heart, Plus, Menu, X, Shield, Moon, Sun, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Navbar = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/');
  }, [signOut, navigate]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isMenuLink = event.target.closest('a');
      const isMenuButton = event.target.closest('button');
      
      if (!event.target.closest('.user-menu') && 
          !event.target.closest('.mobile-menu') && 
          !(mobileMenuOpen && (isMenuLink || isMenuButton))) {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const NavLink = ({ to, children, className = "", onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${className}`}
    >
      {children}
    </Link>
  );

  const MobileNavLink = ({ to, children, icon: Icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
    >
      <Icon className="h-5 w-5 mr-3" />
      {children}
    </Link>
  );

  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="container-responsive">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="relative">
                <Code className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors duration-200" />
                <div className="absolute -inset-1 bg-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
              </div>
              <span className="ml-3 text-xl font-bold">
                <span className="text-gray-800 dark:text-gray-200">codeHub</span>
                <span className="text-blue-500">SFMC</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <NavLink to="/explore">Explorar</NavLink>
              {user && <NavLink to="/ai">IA SFMC</NavLink>}
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="flex items-center">
            <div className="hidden sm:flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/create"
                    className="btn-primary px-4 py-2 text-sm group"
                  >
                    <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                    Crear
                  </Link>
                  
                  <Link
                    to="/favorites"
                    className="p-2 text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    title="Favoritos"
                  >
                    <Heart className="h-5 w-5" />
                  </Link>
                  
                  {/* User Menu */}
                  <div className="relative user-menu">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-600">
                          <span className="text-sm font-medium text-white">
                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-24 truncate">
                        {user.username}
                      </span>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50 animate-scale-in">
                        <div className="py-2">
                          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-600">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                          </div>
                          
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <UserIcon className="h-4 w-4 mr-3" />
                            Perfil
                          </Link>
                          
                          <Link
                            to="/my-snippets"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Code className="h-4 w-4 mr-3" />
                            Mis fragmentos
                          </Link>
                          
                          {user.is_admin && (
                            <Link
                              to="/admin"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Shield className="h-4 w-4 mr-3" />
                              Panel Admin
                            </Link>
                          )}
                          
                          <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                          
                          <button
                            onClick={() => {
                              toggleTheme();
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            {darkMode ? (
                              <>
                                <Sun className="h-4 w-4 mr-3" />
                                Modo claro
                              </>
                            ) : (
                              <>
                                <Moon className="h-4 w-4 mr-3" />
                                Modo oscuro
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Cerrar sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white text-sm font-medium transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 mobile-menu transition-all duration-200"
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
        <div className="sm:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <MobileNavLink 
              to="/explore" 
              icon={Code}
              onClick={() => setMobileMenuOpen(false)}
            >
              Explorar
            </MobileNavLink>
            
            {user ? (
              <>
                <MobileNavLink 
                  to="/ai" 
                  icon={Bot}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  IA SFMC
                </MobileNavLink>
                <MobileNavLink 
                  to="/create" 
                  icon={Plus}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Crear fragmento
                </MobileNavLink>
                <MobileNavLink 
                  to="/favorites" 
                  icon={Heart}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Favoritos
                </MobileNavLink>
                <MobileNavLink 
                  to="/profile" 
                  icon={UserIcon}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Perfil
                </MobileNavLink>
                <MobileNavLink 
                  to="/my-snippets" 
                  icon={Code}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mis fragmentos
                </MobileNavLink>
                {user.is_admin && (
                  <MobileNavLink 
                    to="/admin" 
                    icon={Shield}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Panel Admin
                  </MobileNavLink>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  {darkMode ? (
                    <>
                      <Sun className="h-5 w-5 mr-3" />
                      Modo claro
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 mr-3" />
                      Modo oscuro
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <MobileNavLink 
                  to="/login" 
                  icon={LogOut}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iniciar sesión
                </MobileNavLink>
                <MobileNavLink 
                  to="/signup" 
                  icon={UserIcon}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Registrarse
                </MobileNavLink>
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  {darkMode ? (
                    <>
                      <Sun className="h-5 w-5 mr-3" />
                      Modo claro
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 mr-3" />
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
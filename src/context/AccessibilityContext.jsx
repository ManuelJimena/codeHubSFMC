import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (ctx === undefined) throw new Error('useAccessibility debe usarse dentro de AccessibilityProvider');
  return ctx;
};

export const AccessibilityProvider = ({ children }) => {
  const [showMenu, setShowMenu] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('accessibilityMenu');
    return saved === null ? true : JSON.parse(saved);
  });

  useEffect(() => {
    localStorage.setItem('accessibilityMenu', JSON.stringify(showMenu));
  }, [showMenu]);

  return (
    <AccessibilityContext.Provider value={{ showMenu, setShowMenu }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

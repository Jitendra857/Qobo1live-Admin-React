import React, { createContext, useContext, useState, useEffect } from 'react';

type MenuPosition = 'left' | 'top';

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  menuPosition: MenuPosition;
  setMenuPosition: (pos: MenuPosition) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [themeColor, setThemeColor] = useState(localStorage.getItem('theme_color') || '#8b5cf6');
  const [menuPosition, setMenuPosition] = useState<MenuPosition>((localStorage.getItem('menu_position') as MenuPosition) || 'left');

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-purple', themeColor);
    localStorage.setItem('theme_color', themeColor);
  }, [themeColor]);

  useEffect(() => {
    localStorage.setItem('menu_position', menuPosition);
  }, [menuPosition]);

  return (
    <LayoutContext.Provider value={{ 
      isSidebarCollapsed, 
      setSidebarCollapsed, 
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      themeColor, 
      setThemeColor, 
      menuPosition, 
      setMenuPosition 
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error('useLayout must be used within LayoutProvider');
  return context;
};

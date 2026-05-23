import React, { createContext, useContext, useState, useEffect } from 'react';

type MenuPosition = 'left' | 'top';

export interface SidebarTheme {
  id: string;
  label: string;
  bg: string;       // sidebar background
  border: string;   // sidebar border / divider
  text: string;     // default nav text
  textDim: string;  // dimmed text / icons
  accent: string;   // active highlight & bar
  accentBg: string; // active item background
  catColor: string; // category label color
  hoverBg: string;  // hover background
}

export const SIDEBAR_THEMES: SidebarTheme[] = [
  {
    id: 'white',
    label: 'Snow',
    bg: '#ffffff',
    border: '#e8ecf2',
    text: '#64748b',
    textDim: '#b0bec5',
    accent: '#4e73df',
    accentBg: '#eef2ff',
    catColor: '#94a3b8',
    hoverBg: '#f4f6fb',
  },
  {
    id: 'slate',
    label: 'Slate',
    bg: '#0f172a',
    border: 'rgba(255,255,255,0.07)',
    text: '#94a3b8',
    textDim: '#3a4a65',
    accent: '#818cf8',
    accentBg: 'rgba(99,102,241,0.18)',
    catColor: '#3a4a65',
    hoverBg: 'rgba(255,255,255,0.05)',
  },
  {
    id: 'forest',
    label: 'Forest',
    bg: '#0d1f1a',
    border: 'rgba(255,255,255,0.07)',
    text: '#94a3b8',
    textDim: '#2d4a3e',
    accent: '#34d399',
    accentBg: 'rgba(52,211,153,0.15)',
    catColor: '#2d4a3e',
    hoverBg: 'rgba(255,255,255,0.04)',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    bg: '#0c1e35',
    border: 'rgba(255,255,255,0.07)',
    text: '#94a3b8',
    textDim: '#1e3a5f',
    accent: '#38bdf8',
    accentBg: 'rgba(56,189,248,0.15)',
    catColor: '#1e3a5f',
    hoverBg: 'rgba(255,255,255,0.04)',
  },
  {
    id: 'rose',
    label: 'Crimson',
    bg: '#1a0a14',
    border: 'rgba(255,255,255,0.07)',
    text: '#94a3b8',
    textDim: '#4a1a2e',
    accent: '#fb7185',
    accentBg: 'rgba(251,113,133,0.15)',
    catColor: '#4a1a2e',
    hoverBg: 'rgba(255,255,255,0.04)',
  },
];

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  menuPosition: MenuPosition;
  setMenuPosition: (pos: MenuPosition) => void;
  sidebarTheme: SidebarTheme;
  setSidebarTheme: (theme: SidebarTheme) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const applyTheme = (t: SidebarTheme) => {
  const r = document.documentElement;
  r.style.setProperty('--sb-bg',       t.bg);
  r.style.setProperty('--sb-border',   t.border);
  r.style.setProperty('--sb-text',     t.text);
  r.style.setProperty('--sb-text-dim', t.textDim);
  r.style.setProperty('--sb-accent',   t.accent);
  r.style.setProperty('--sb-accent-bg',t.accentBg);
  r.style.setProperty('--sb-cat-color',t.catColor);
  r.style.setProperty('--sb-hover-bg', t.hoverBg);
};

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [themeColor, setThemeColor] = useState(localStorage.getItem('theme_color') || '#4e73df');
  const [menuPosition, setMenuPosition] = useState<MenuPosition>(
    (localStorage.getItem('menu_position') as MenuPosition) || 'left'
  );

  const savedThemeId = localStorage.getItem('sidebar_theme') || 'white';
  const initialTheme = SIDEBAR_THEMES.find(t => t.id === savedThemeId) || SIDEBAR_THEMES[0];
  const [sidebarTheme, setSidebarThemeState] = useState<SidebarTheme>(initialTheme);

  // Apply on mount
  useEffect(() => { applyTheme(initialTheme); }, []);

  const setSidebarTheme = (theme: SidebarTheme) => {
    setSidebarThemeState(theme);
    applyTheme(theme);
    localStorage.setItem('sidebar_theme', theme.id);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-purple', themeColor);
    localStorage.setItem('theme_color', themeColor);
  }, [themeColor]);

  useEffect(() => {
    localStorage.setItem('menu_position', menuPosition);
  }, [menuPosition]);

  return (
    <LayoutContext.Provider value={{
      isSidebarCollapsed, setSidebarCollapsed,
      isMobileMenuOpen, setIsMobileMenuOpen,
      themeColor, setThemeColor,
      menuPosition, setMenuPosition,
      sidebarTheme, setSidebarTheme,
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

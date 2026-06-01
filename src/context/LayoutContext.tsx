import React, { createContext, useContext, useState, useEffect } from 'react';

type MenuPosition = 'left' | 'top';

export interface SidebarTheme {
  id: string;
  label: string;
  bg: string;         // sidebar background
  surface: string;    // sidebar inner surface
  border: string;     // sidebar border / divider
  text: string;       // default nav text
  textStrong: string; // strong / heading text
  textDim: string;    // dimmed text / icons
  accent: string;     // active highlight & bar
  accentBg: string;   // active item background
  catColor: string;   // category label color
  hoverBg: string;    // hover background
}

export const SIDEBAR_THEMES: SidebarTheme[] = [
  {
    id: 'white',
    label: 'Snow',
    bg: '#ffffff',
    surface: '#f8fafc',
    border: '#e8ecf2',
    text: '#64748b',
    textStrong: '#1e293b',
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
    surface: '#1e293b',
    border: 'rgba(255,255,255,0.07)',
    text: '#94a3b8',
    textStrong: '#e2e8f0',
    textDim: '#3a4a65',
    accent: '#818cf8',
    accentBg: 'rgba(99,102,241,0.18)',
    catColor: '#4a5a80',
    hoverBg: 'rgba(255,255,255,0.05)',
  },
  {
    id: 'forest',
    label: 'Forest',
    bg: '#0d1f1a',
    surface: '#1a3028',
    border: 'rgba(255,255,255,0.07)',
    text: '#86efac',
    textStrong: '#d1fae5',
    textDim: '#2d4a3e',
    accent: '#34d399',
    accentBg: 'rgba(52,211,153,0.15)',
    catColor: '#3d6a58',
    hoverBg: 'rgba(52,211,153,0.06)',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    bg: '#0c1e35',
    surface: '#1a3354',
    border: 'rgba(255,255,255,0.07)',
    text: '#7dd3fc',
    textStrong: '#bae6fd',
    textDim: '#1e3a5f',
    accent: '#38bdf8',
    accentBg: 'rgba(56,189,248,0.15)',
    catColor: '#2e5a8a',
    hoverBg: 'rgba(56,189,248,0.06)',
  },
  {
    id: 'rose',
    label: 'Crimson',
    bg: '#1a0a14',
    surface: '#2d1222',
    border: 'rgba(255,255,255,0.07)',
    text: '#fca5a5',
    textStrong: '#fecdd3',
    textDim: '#4a1a2e',
    accent: '#fb7185',
    accentBg: 'rgba(251,113,133,0.15)',
    catColor: '#6b2a40',
    hoverBg: 'rgba(251,113,133,0.06)',
  },
];

export interface AppThemeOption {
  id: string;
  label: string;
  primaryColor: string;
  previewBg: string;
}

export const APP_THEMES: AppThemeOption[] = [
  {
    id: 'sapphire',
    label: 'Sapphire Midnight',
    primaryColor: '#6366f1',
    previewBg: '#0b0f19',
  },
  {
    id: 'light',
    label: 'Opal Light',
    primaryColor: '#4f46e5',
    previewBg: '#f1f5f9',
  },
  {
    id: 'emerald',
    label: 'Emerald Cyber',
    primaryColor: '#10b981',
    previewBg: '#050a09',
  },
  {
    id: 'amber',
    label: 'Sunset Amber',
    primaryColor: '#f59e0b',
    previewBg: '#0f0a06',
  },
  {
    id: 'amethyst',
    label: 'Amethyst Royal',
    primaryColor: '#8b5cf6',
    previewBg: '#0a0612',
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
  appTheme: string;
  setAppTheme: (theme: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const applyTheme = (t: SidebarTheme) => {
  const r = document.documentElement;
  r.style.setProperty('--sb-bg',          t.bg);
  r.style.setProperty('--sb-surface',     t.surface);
  r.style.setProperty('--sb-border',      t.border);
  r.style.setProperty('--sb-text',        t.text);
  r.style.setProperty('--sb-text-strong', t.textStrong);
  r.style.setProperty('--sb-text-dim',    t.textDim);
  r.style.setProperty('--sb-accent',      t.accent);
  r.style.setProperty('--sb-accent-bg',   t.accentBg);
  r.style.setProperty('--sb-cat-color',   t.catColor);
  r.style.setProperty('--sb-hover-bg',    t.hoverBg);
};

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [themeColor, setThemeColor] = useState(localStorage.getItem('theme_color') || '#8b5cf6');
  const [menuPosition, setMenuPosition] = useState<MenuPosition>(
    (localStorage.getItem('menu_position') as MenuPosition) || 'left'
  );
  const [appTheme, setAppTheme] = useState(localStorage.getItem('app_theme') || 'sapphire');

  const savedThemeId = localStorage.getItem('sidebar_theme') || 'slate';
  const initialTheme = SIDEBAR_THEMES.find(t => t.id === savedThemeId) || SIDEBAR_THEMES[1];
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

  // Handle dynamic app theme toggle and body classing
  useEffect(() => {
    const themeIds = ['sapphire', 'light', 'emerald', 'amber', 'amethyst'];
    themeIds.forEach(id => {
      document.body.classList.remove(`theme-${id}`);
    });
    document.body.classList.add(`theme-${appTheme}`);
    localStorage.setItem('app_theme', appTheme);
  }, [appTheme]);

  return (
    <LayoutContext.Provider value={{
      isSidebarCollapsed, setSidebarCollapsed,
      isMobileMenuOpen, setIsMobileMenuOpen,
      themeColor, setThemeColor,
      menuPosition, setMenuPosition,
      sidebarTheme, setSidebarTheme,
      appTheme, setAppTheme,
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

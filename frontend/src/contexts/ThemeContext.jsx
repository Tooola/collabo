import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

// Appliquer le thème immédiatement (hors React) pour éviter le flash
const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (isDark) => {
  const root = window.document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const initial = getInitialTheme();
    // Applique le thème dès l'initialisation, avant le premier render
    applyTheme(initial);
    return initial;
  });

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

import React, { createContext, useContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('cloudvault-theme');
      if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'xp') {
        return savedTheme;
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');

    if (theme === 'xp') {
      root.classList.remove('dark', 'light');
      root.classList.add('xp');
      body.classList.remove('dark', 'light');
      body.classList.add('xp');
      root.setAttribute('data-theme', 'xp');
      body.setAttribute('data-theme', 'xp');
      root.style.colorScheme = 'light';
      body.style.backgroundColor = '#004e98';
      body.style.color = '#000000';
      if (metaColorScheme) metaColorScheme.content = 'light';
    } else if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light', 'xp');
      body.classList.add('dark');
      body.classList.remove('light', 'xp');
      root.setAttribute('data-theme', 'dark');
      body.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      body.style.backgroundColor = '#020617';
      body.style.color = '#f8fafc';
      if (metaColorScheme) metaColorScheme.content = 'dark';
    } else {
      root.classList.remove('dark', 'xp');
      root.classList.add('light');
      body.classList.remove('dark', 'xp');
      body.classList.add('light');
      root.setAttribute('data-theme', 'light');
      body.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      body.style.backgroundColor = '#f8fafc';
      body.style.color = '#0f172a';
      if (metaColorScheme) metaColorScheme.content = 'light';
    }

    try {
      localStorage.setItem('cloudvault-theme', theme);
    } catch (e) {
      // Ignore storage errors on private tabs
    }
  }, [theme]);

  // Listen to OS system preference changes only if user hasn't explicitly set a preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const savedTheme = localStorage.getItem('cloudvault-theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';
  const isXP = theme === 'xp';
  const isLight = theme === 'light';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark, isXP, isLight }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

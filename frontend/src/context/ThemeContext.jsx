import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({
  darkMode: true,
  toggleTheme: () => {},
  setDarkMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      const initial = saved === null ? true : saved === 'true';
      setDarkMode(initial);
      if (initial) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch (_) {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('darkMode', String(darkMode)); } catch (_) {}
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => {
      const next = !prev;
      try { console.log('[ThemeProvider] Toggling theme to', next ? 'dark' : 'light'); } catch (_) {}
      try { localStorage.setItem('darkMode', String(next)); } catch (_) {}
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return next;
    });
  };

  const value = useMemo(() => ({ darkMode, toggleTheme, setDarkMode }), [darkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);



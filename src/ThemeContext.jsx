import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeModeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('themeMode') === 'dark'
  );

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transitioning');
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('themeMode', next ? 'dark' : 'light');
      return next;
    });
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 400);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

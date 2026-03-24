import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

//
// Preference is persisted to localStorage and respects the OS default on first visit.
//

type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
  theme: ThemeMode;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => undefined,
});

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'metaflow-ui-theme';

function getInitialTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch (_) {
  }
  // Fall back to OS preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  // Apply theme class to <html> so the CSS media-query override also works
  // for components that have hardcoded checks. We also set the data-attribute
  // so the CSS variable block can be activated by class as well.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

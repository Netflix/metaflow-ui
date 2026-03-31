import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import App from '@/App';
import '@utils/VERSION';
import '@utils/i18n';
import { worker } from './mocks/browser';
import { lightTheme, darkTheme } from './theme/theme';

const container = document.getElementById('root');

const Root: React.FC = () => {
  // ✅ Initialize theme from localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // ✅ Apply theme class to body (IMPORTANT for CSS variables)
  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  // ✅ Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      return next;
    });
  };

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <App toggleTheme={toggleTheme} currentTheme={theme} />
    </ThemeProvider>
  );
};

if (container) {
  const root = createRoot(container);

  const renderApp = () => root.render(<Root />);

  if (process.env.REACT_APP_ENABLE_MOCKS) {
    worker
      .start({
        onUnhandledRequest: 'bypass',
      })
      .then(renderApp);
  } else {
    renderApp();
  }
}

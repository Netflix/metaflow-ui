import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import { THEME_STORAGE_KEY, ThemeProvider, Theme } from '@/contexts/ThemeContext';
import '@utils/VERSION';
import '@utils/i18n';
import { worker } from './mocks/browser';

const hydrateTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const resolvedTheme: Theme =
    savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  document.documentElement.dataset.theme = resolvedTheme;
};

hydrateTheme();

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);

  if (process.env.REACT_APP_ENABLE_MOCKS) {
    worker
      .start({
        onUnhandledRequest: 'bypass',
      })
      .then(() => {
        root.render(
          <ThemeProvider>
            <App />
          </ThemeProvider>,
        );
      });
  } else {
    root.render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );
  }
}

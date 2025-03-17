import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import '@utils/VERSION';
import '@utils/i18n';
import { worker } from './mocks/browser';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);

  if (process.env.REACT_APP_ENABLE_MOCKS) {
    worker
      .start({
        onUnhandledRequest: 'bypass',
        quiet: true,
      })
      .then(() => {
        root.render(<App />);
      });
  } else {
    root.render(<App />);
  }
}

import React from 'react';
import App from '@/App';
import '@utils/i18n';
import '@utils/VERSION';
import { createRoot } from 'react-dom/client';
import { worker } from './mocks/browser';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);

  if (process.env.REACT_APP_ENABLE_MOCKS) {
    worker
      .start({
        onUnhandledRequest: 'bypass',
      })
      .then(() => {
        root.render(<App />);
      });
  } else {
    root.render(<App />);
  }
}

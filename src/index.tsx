import React from 'react';
import App from './App';
import './utils/i18n';
import './utils/VERSION';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

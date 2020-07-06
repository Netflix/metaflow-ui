import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('health check', () => {
  render(<App />);
  expect(true).toBe(true);
});

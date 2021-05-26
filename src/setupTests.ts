// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
// Add mocks to indexed db (used in logging)
import 'fake-indexeddb/auto';
import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();
// Mock window scroll events
const noop = () => null;
Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Mock IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  disconnect() {
    return null;
  }

  observe() {
    return null;
  }

  takeRecords() {
    return null;
  }

  unobserve() {
    return null;
  }
};

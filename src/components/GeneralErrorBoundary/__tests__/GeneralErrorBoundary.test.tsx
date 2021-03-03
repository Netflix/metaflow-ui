import React from 'react';
import { render } from '@testing-library/react';
import ErrorBoundary from '..';

const CrashingComponent = () => {
  throw new Error('Error!');
};

test('<GeneralErrorBoundary /> - Without error', () => {
  const { getByText } = render(<ErrorBoundary message="error happened">hello world</ErrorBoundary>);
  expect(getByText('hello world')).toBeDefined();
});

test('<GeneralErrorBoundary /> - With error', () => {
  // Override console error here so we don't flood our test set
  const errorObject = console.error;
  console.error = jest.fn();
  const { getByText } = render(
    <ErrorBoundary message="error happened">
      <CrashingComponent />
    </ErrorBoundary>,
  );
  expect(getByText('error happened')).toBeDefined();
  console.error = errorObject;
});

import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import FullPageContainer from '..';
import TestWrapper from '../../../utils/testing';

test('<FullPageContainer> - closing', () => {
  const onClose = jest.fn();
  const { getByTestId } = render(
    <TestWrapper>
      <FullPageContainer onClose={onClose}>Hello world</FullPageContainer>
    </TestWrapper>,
  );

  fireEvent.click(getByTestId('fullpage-close-button'));
  expect(onClose).toHaveBeenCalled();
});

test('<FullPageContainer> - Content rendering', () => {
  // With children
  const p = render(
    <TestWrapper>
      <FullPageContainer onClose={jest.fn()}>Hello world</FullPageContainer>
    </TestWrapper>,
  );

  expect(p.getByTestId('fullpage-content').textContent).toBe('Hello world');

  // With component
  p.rerender(
    <TestWrapper>
      <FullPageContainer onClose={jest.fn()} component={(num: number) => <>Hei maailma</>}>
        Hello world
      </FullPageContainer>
    </TestWrapper>,
  );

  expect(p.getByTestId('fullpage-content').textContent).toBe('Hei maailma');
});

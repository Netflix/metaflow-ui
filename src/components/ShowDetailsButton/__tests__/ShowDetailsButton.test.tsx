import React from 'react';
import { render } from '@testing-library/react';
import ShowDetailsButton from '..';
import TestWrapper from '../../../utils/testing';

test('<ShowDetailsButton />', () => {
  const toggle = jest.fn();
  const { getByText, rerender } = render(
    <TestWrapper>
      <ShowDetailsButton toggle={toggle} visible={false} showText="Yep" hideText="Nop" />
    </TestWrapper>,
  );

  expect(getByText('Yep')).toBeDefined();

  rerender(
    <TestWrapper>
      <ShowDetailsButton toggle={toggle} visible={true} showText="Yep" hideText="Nop" />
    </TestWrapper>,
  );

  expect(getByText('Nop')).toBeDefined();
});

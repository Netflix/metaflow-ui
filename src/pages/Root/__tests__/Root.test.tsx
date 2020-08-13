import React from 'react';
import Root from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('Root page', () => {
  test('<Root /> - health check', () => {
    render(
      <TestWrapper>
        <Root />
      </TestWrapper>,
    );
  });
});

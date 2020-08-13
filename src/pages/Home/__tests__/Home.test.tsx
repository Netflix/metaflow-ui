import React from 'react';
import Home from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('Home page', () => {
  test('<Home /> - health check', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>,
    );
  });
});

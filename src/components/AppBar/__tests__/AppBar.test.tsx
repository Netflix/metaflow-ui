import React from 'react';
import AppBar from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('AppBar component', () => {
  test('<AppBar /> - health check', () => {
    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>,
    );
  });
});

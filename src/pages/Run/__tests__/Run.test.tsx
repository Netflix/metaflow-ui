import React from 'react';
import Run from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('Run page', () => {
  test('<Run /> - health check', () => {
    render(
      <TestWrapper>
        <Run />
      </TestWrapper>,
    );
  });
});

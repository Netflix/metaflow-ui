import React from 'react';
import Status from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('Status component', () => {
  test('<Status /> - health check', () => {
    render(
      <TestWrapper>
        <Status status="Test" />
      </TestWrapper>,
    );
  });
});

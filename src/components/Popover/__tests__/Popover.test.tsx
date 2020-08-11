import React from 'react';
import Popover from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('Popover component', () => {
  test('<Popover /> - health check', () => {
    render(
      <TestWrapper>
        <Popover>Hei maailma!</Popover>
      </TestWrapper>,
    );
  });
});

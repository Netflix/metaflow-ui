import React from 'react';
import Notification from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('Notification component', () => {
  test('<Notification /> - health check', () => {
    render(
      <TestWrapper>
        <Notification>Hei maailma!</Notification>
      </TestWrapper>,
    );
  });
});

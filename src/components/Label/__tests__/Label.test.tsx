import React from 'react';
import Label from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('Label component', () => {
  test('<Label /> - health check', () => {
    render(
      <TestWrapper>
        <Label>Hei maailma!</Label>
      </TestWrapper>,
    );
  });
});

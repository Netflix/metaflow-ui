import React from 'react';
import ButtonGroup from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('ButtonGroup component', () => {
  test('<ButtonGroup /> - health check', () => {
    render(
      <TestWrapper>
        <ButtonGroup />
      </TestWrapper>,
    );
  });
});

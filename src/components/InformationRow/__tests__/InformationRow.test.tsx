import React from 'react';
import InformationRow from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('InformationRow component', () => {
  test('<InformationRow /> - health check', () => {
    render(
      <TestWrapper>
        <InformationRow />
      </TestWrapper>,
    );
  });
});

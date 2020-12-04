import React from 'react';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
import SectionLoader from '../components/SectionLoader';

describe('SectionLoader component', () => {
  test('<SectionLoader /> - States', () => {
    const props = {
      component: <div data-testid="all-ok" />,
      error: null,
    };
    const { rerender, getByTestId } = render(
      <TestWrapper>
        <SectionLoader status="Loading" {...props} />
      </TestWrapper>,
    );

    expect(getByTestId('section-loader-loading')).toBeInTheDocument();

    rerender(<SectionLoader status="Error" {...props} />);

    expect(getByTestId('section-loader-error')).toBeInTheDocument();

    rerender(<SectionLoader status="Ok" {...props} />);

    expect(getByTestId('all-ok')).toBeInTheDocument();
  });
});

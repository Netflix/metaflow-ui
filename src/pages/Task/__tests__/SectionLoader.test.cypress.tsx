import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper, { gid } from '../../../utils/testing';
import SectionLoader from '../components/SectionLoader';

describe('SectionLoader component', () => {
  it('<SectionLoader /> - States', () => {
    const props = {
      component: <div data-testid="all-ok" />,
      error: null,
    };
    mount(
      <TestWrapper>
        <SectionLoader status="Loading" {...props} />
      </TestWrapper>,
    );

    gid('section-loader-loading');

    mount(
      <TestWrapper>
        <SectionLoader status="Error" {...props} />
      </TestWrapper>,
    );

    gid('section-loader-error');

    mount(
      <TestWrapper>
        <SectionLoader status="Ok" {...props} />
      </TestWrapper>,
    );

    gid('all-ok');
  });
});

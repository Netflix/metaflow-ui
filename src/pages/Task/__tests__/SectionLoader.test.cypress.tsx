import { mount } from '@cypress/react';
import React from 'react';
import SectionLoader from '@pages/Task/components/SectionLoader';
import TestWrapper, { gid } from '@utils/testing';

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

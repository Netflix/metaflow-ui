import React from 'react';
import TimelineFooter from '../TimelineFooter';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
import { createGraphState } from '../testhelper';

describe('TimelineFooter component', () => {
  test('<TimelineFooter> - should render', () => {
    render(
      <TestWrapper>
        <TimelineFooter graph={createGraphState({})} move={() => null} />
      </TestWrapper>,
    );
  });

  test('<TimelineFooter> - should have correct start and end values', () => {
    const result = render(
      <TestWrapper>
        <TimelineFooter graph={createGraphState({})} move={() => null} />
      </TestWrapper>,
    );

    expect(result.getByTestId('timeline-footer-start').textContent).toBe('0s');
    expect(result.getByTestId('timeline-footer-end').textContent).toBe('1.00s');

    result.rerender(
      <TestWrapper>
        <TimelineFooter graph={createGraphState({ timelineStart: 110, timelineEnd: 500 })} move={() => null} />
      </TestWrapper>,
    );

    expect(result.getByTestId('timeline-footer-start').textContent).toBe('0.11s');
    expect(result.getByTestId('timeline-footer-end').textContent).toBe('0.50s');
  });
});

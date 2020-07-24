import React from 'react';
import TimelineHorizontalScroll from '../TimelineHorizontalScroll';
import { render } from '@testing-library/react';
import { createGraphState } from '../testhelper';

describe('TimelineHorizontalScroll component', () => {
  test('<TimelineHorizontalScroll> - should render', () => {
    render(<TimelineHorizontalScroll graph={createGraphState({})} updateTimeline={() => null} />);
  });

  test('<TimelineHorizontalScroll> - should render', () => {
    const { rerender, getByTestId } = render(
      <TimelineHorizontalScroll graph={createGraphState({})} updateTimeline={() => null} />,
    );
    // Full width bar
    expect(getByTestId('timeline-scrollbar').style.width).toBe('100%');
    expect(getByTestId('timeline-scrollbar').style.left).toBe('0%');

    // 20% long bar, 20% from left
    rerender(
      <TimelineHorizontalScroll
        graph={createGraphState({ timelineStart: 200, timelineEnd: 400 })}
        updateTimeline={() => null}
      />,
    );
    expect(getByTestId('timeline-scrollbar').style.width).toBe('20%');
    expect(getByTestId('timeline-scrollbar').style.left).toBe('20%');

    // 45.2% long bar, 50% from left
    rerender(
      <TimelineHorizontalScroll
        graph={createGraphState({ timelineStart: 500, timelineEnd: 952 })}
        updateTimeline={() => null}
      />,
    );
    expect(getByTestId('timeline-scrollbar').style.width).toBe('45.2%');
    expect(getByTestId('timeline-scrollbar').style.left).toBe('50%');
  });
});

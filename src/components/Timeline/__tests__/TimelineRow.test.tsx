import React from 'react';
import TimelineRow from '../TimelineRow';
import LineElement from '../TimelineRow/LineElement';
import { render } from '@testing-library/react';
import { createGraphState, createTask, createStep, createTimelineMetrics } from '../../../utils/testhelper';
import TestWrapper from '../../../utils/testing';
import { TaskStatus } from '../../../types';

const MockT = (str: string) => str;

describe('TimelineRow component', () => {
  test('<TimelineRow> - should render', () => {
    render(
      <TestWrapper>
        <TimelineRow
          timeline={createTimelineMetrics({})}
          onOpen={jest.fn()}
          item={{ type: 'task', data: [createTask({})] }}
          dragging={false}
          t={MockT}
        />
      </TestWrapper>,
    );
  });

  test('<TimelineRow> - task row without start times', () => {
    const task = createTask({});
    const { getByTestId } = render(
      <TestWrapper>
        <TimelineRow
          timeline={createTimelineMetrics({})}
          onOpen={jest.fn()}
          item={{ type: 'task', data: [task, createTask({ finished_at: 9999999999 })] }}
          dragging={false}
          t={MockT}
        />
      </TestWrapper>,
    );
    // Dont render elements rows since there is no started at values
    expect(getByTestId('timeline-row-graphic-container').children.length).toBe(0);
  });

  test('<TimelineRow> - task row', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <TimelineRow
          timeline={createTimelineMetrics({})}
          onOpen={jest.fn()}
          item={{
            type: 'task',
            data: [createTask({ started_at: 10 }), createTask({ started_at: 1000, finished_at: 9999999999 })],
          }}
          dragging={false}
          t={MockT}
        />
      </TestWrapper>,
    );
    // Render two elements, one retry
    expect(getByTestId('timeline-row-graphic-container').children.length).toBe(2);
  });

  test('<TimelineRow> - step row', () => {
    const props = {
      timeline: createTimelineMetrics({}),
      onOpen: () => null,
      item: {
        type: 'step' as const,
        data: createStep({}),
        rowObject: {
          isOpen: true,
          finished_at: 1000,
          duration: 1000,
          step: createStep({}),
          status: 'completed' as TaskStatus,
          data: {},
        },
      },
      isOpen: true,
      t: MockT,
      dragging: false,
    };

    const { getByTestId } = render(
      <TestWrapper>
        <TimelineRow {...props} />
      </TestWrapper>,
    );
    // Should have only one line graphic
    expect(getByTestId('timeline-row-graphic-container').children.length).toBe(1);
  });

  test('<LineElement>', () => {
    const task = createTask({ ts_epoch: 100, started_at: 100, finished_at: 450, duration: 350 });
    const props = {
      timeline: createTimelineMetrics({}),
      row: { type: 'task' as const, data: task },
      finishedAt: task.finished_at,
      duration: 350,
      isLastAttempt: true,
      dragging: false,
    };

    const { getByTestId, rerender } = render(
      <TestWrapper>
        <LineElement {...props} />
      </TestWrapper>,
    );
    // Values of container and boxgraphic should be weird since we are extending timeline over selected value
    // by 1% of selected visible timeline
    expect(getByTestId('boxgraphic-container').style.transform).toBe('translateX(9.900990099009901%)');
    expect(getByTestId('boxgraphic').style.width).toBe('34.65346534653465%');
    expect(getByTestId('boxgraphic-label').textContent).toBe('0.3s');

    // Change graph zoom values to start from 0.3s and end to 0.5s. Element will be
    // rendered quite a lot to the left (translateX -100%)
    rerender(
      <TestWrapper>
        <LineElement {...props} timeline={createTimelineMetrics({ visibleStartTime: 300, visibleEndTime: 500 })} />
      </TestWrapper>,
    );

    expect(getByTestId('boxgraphic-container').style.transform).toBe('translateX(-99.00990099009901%)');
    expect(getByTestId('boxgraphic').style.width).toBe('173.26732673267327%');
    expect(getByTestId('boxgraphic-label').textContent).toBe('0.3s');

    // Same as default graph but alignment is from left so every element should start from left
    rerender(
      <TestWrapper>
        <LineElement {...props} timeline={createTimelineMetrics({ alignment: 'fromLeft' })} />
      </TestWrapper>,
    );

    expect(getByTestId('boxgraphic-container').style.transform).toBe('translateX(0%)');
    expect(getByTestId('boxgraphic').style.width).toBe('34.65346534653465%');
    expect(getByTestId('boxgraphic-label').textContent).toBe('0.3s');

    // Try with unfinished item. No label since bar takes so wide space
    rerender(
      <TestWrapper>
        <LineElement {...props} timeline={createTimelineMetrics({})} duration={null} />
      </TestWrapper>,
    );
    expect(getByTestId('boxgraphic-container').style.transform).toBe('translateX(9.900990099009901%)');
    expect(getByTestId('boxgraphic').style.width).toBe('90.0990099009901%');
  });
});

import React from 'react';
import TimelineRow, { BoxGraphicElement } from '../TimelineRow';
import { render } from '@testing-library/react';
import { createGraphState, createTask, createStep } from '../testhelper';
import TestWrapper from '../../../utils/testing';

describe('TimelineRow component', () => {
  test('<TimelineRow> - should render', () => {
    render(
      <TestWrapper>
        <TimelineRow graph={createGraphState({})} onOpen={jest.fn()} item={{ type: 'task', data: [createTask({})] }} />
      </TestWrapper>,
    );
  });

  test('<TimelineRow> - task row', () => {
    const task = createTask({});
    const { getByTestId } = render(
      <TestWrapper>
        <TimelineRow
          graph={createGraphState({})}
          onOpen={jest.fn()}
          item={{ type: 'task', data: [task, createTask({ finished_at: 9999999999 })] }}
        />
      </TestWrapper>,
    );

    // Row should have link
    expect(getByTestId('timeline-row-link')).toBeInTheDocument();
    expect(getByTestId('timeline-row-link')).toHaveAttribute('href', '/flows/BasicFlow/runs/1/steps/askel/tasks/1');
    // Row should only have task id as label (grouping is on)
    expect(getByTestId('timeline-row-link').textContent).toBe(task.task_id.toString());
    // Should have two graphic bars (one is retry)
    expect(getByTestId('timeline-row-graphic-container').children.length).toBe(2);
  });

  test('<TimelineRow> - task row', () => {
    const task = createTask({});
    const { getByTestId, rerender } = render(
      <TestWrapper>
        <TimelineRow
          graph={createGraphState({})}
          onOpen={jest.fn()}
          item={{ type: 'task', data: [task, createTask({ finished_at: 9999999999 })] }}
        />
      </TestWrapper>,
    );

    // Row should have link
    expect(getByTestId('timeline-row-link')).toBeInTheDocument();
    expect(getByTestId('timeline-row-link')).toHaveAttribute('href', '/flows/BasicFlow/runs/1/steps/askel/tasks/1');
    // Row should only have task id as label (grouping is on)
    expect(getByTestId('timeline-row-link').textContent).toBe(task.task_id.toString());
    // Should have two graphic bars (one is retry)
    expect(getByTestId('timeline-row-graphic-container').children.length).toBe(2);

    // Rerender with grouping off. Shoudl change label rendering
    rerender(
      <TestWrapper>
        <TimelineRow
          graph={createGraphState({ groupBy: 'none' })}
          onOpen={jest.fn()}
          item={{ type: 'task', data: [task, createTask({ finished_at: 9999999999 })] }}
        />
      </TestWrapper>,
    );

    expect(getByTestId('timeline-row-link').textContent).toBe('askel/' + task.task_id.toString());
  });

  test('<TimelineRow> - step row', () => {
    const props = {
      graph: createGraphState({}),
      onOpen: () => null,
      item: { type: 'step' as const, data: createStep({}) },
      isOpen: true,
    };

    const { getByTestId, rerender } = render(
      <TestWrapper>
        <TimelineRow {...props} />
      </TestWrapper>,
    );

    // Row should only have step name as label
    expect(getByTestId('timeline-row-label').textContent).toBe(props.item.data.step_name);
    // Should have only one line graphic
    expect(getByTestId('timeline-row-graphic-container').children.length).toBe(1);

    expect(getByTestId('timeline-row-icon').attributes.getNamedItem('rotate')?.value).toBe('0');

    rerender(
      <TestWrapper>
        <TimelineRow {...props} isOpen={false} />
      </TestWrapper>,
    );

    expect(getByTestId('timeline-row-icon').attributes.getNamedItem('rotate')?.value).toBe('-90');
  });

  test('<BoxGraphicElement>', () => {
    const task = createTask({ ts_epoch: 100, finished_at: 450, duration: 350 });
    const props = {
      graph: createGraphState({}),
      row: { type: 'task' as const, data: task },
      finishedAt: task.finished_at,
      isFirst: true,
    };

    const { getByTestId, rerender } = render(
      <TestWrapper>
        <BoxGraphicElement {...props} />
      </TestWrapper>,
    );

    expect(getByTestId('boxgraphic-container').style.transform).toBe('translateX(10%)');
    expect(getByTestId('boxgraphic').style.width).toBe('35%');
    expect(getByTestId('boxgraphic-label').textContent).toBe('0.35s');

    // Change graph zoom values to start from 0.3s and end to 0.5s. Element will be
    // rendered quite a lot to the left (translateX -100%)
    rerender(
      <TestWrapper>
        <BoxGraphicElement {...props} graph={createGraphState({ timelineStart: 300, timelineEnd: 500 })} />
      </TestWrapper>,
    );

    expect(getByTestId('boxgraphic-container').style.transform).toBe('translateX(-100%)');
    expect(getByTestId('boxgraphic').style.width).toBe('175%');
    expect(getByTestId('boxgraphic-label').textContent).toBe('0.35s');

    // Same as default graph but alignment is from left so every element should start from left
    rerender(
      <TestWrapper>
        <BoxGraphicElement {...props} graph={createGraphState({ alignment: 'fromLeft' })} />
      </TestWrapper>,
    );

    expect(getByTestId('boxgraphic-container').style.transform).toBe('translateX(0%)');
    expect(getByTestId('boxgraphic').style.width).toBe('35%');
    expect(getByTestId('boxgraphic-label').textContent).toBe('0.35s');

    // Try with unfinished item. No label since bar takes so wide space
    rerender(
      <TestWrapper>
        <BoxGraphicElement {...props} graph={createGraphState({})} finishedAt={undefined} />
      </TestWrapper>,
    );
    expect(getByTestId('boxgraphic-container').style.transform).toBe('translateX(10%)');
    expect(getByTestId('boxgraphic').style.width).toBe('90%');
  });
});

import React from 'react';
import TimelineRow, { BoxGraphicElement } from '../TimelineRow';
import { render } from '@testing-library/react';
import { createGraphState, createTask, createStep } from '../../../utils/testhelper';
import TestWrapper from '../../../utils/testing';

const MockT = (str: string) => str;

describe('TimelineRow component', () => {
  test('<TimelineRow> - should render', () => {
    render(
      <TestWrapper>
        <TimelineRow
          graph={createGraphState({})}
          onOpen={jest.fn()}
          item={{ type: 'task', data: [createTask({})] }}
          isGrouped={true}
          t={MockT}
        />
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
          isGrouped={true}
          item={{ type: 'task', data: [task, createTask({ finished_at: 9999999999 })] }}
          t={MockT}
        />
      </TestWrapper>,
    );
    // Should have two graphic bars (one is retry)
    expect(getByTestId('timeline-row-graphic-container').children.length).toBe(2);
  });

  test('<TimelineRow> - step row', () => {
    const props = {
      graph: createGraphState({}),
      onOpen: () => null,
      item: {
        type: 'step' as const,
        data: createStep({}),
        rowObject: {
          isOpen: true,
          finished_at: 1000,
          duration: 1000,
          step: createStep({}),
          data: {},
        },
      },
      isOpen: true,
      t: MockT,
    };

    const { getByTestId } = render(
      <TestWrapper>
        <TimelineRow {...props} isGrouped={true} />
      </TestWrapper>,
    );
    // Should have only one line graphic
    expect(getByTestId('timeline-row-graphic-container').children.length).toBe(1);
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
    expect(getByTestId('boxgraphic-label').textContent).toBe('0.3s');

    // Change graph zoom values to start from 0.3s and end to 0.5s. Element will be
    // rendered quite a lot to the left (translateX -100%)
    rerender(
      <TestWrapper>
        <BoxGraphicElement {...props} graph={createGraphState({ timelineStart: 300, timelineEnd: 500 })} />
      </TestWrapper>,
    );

    expect(getByTestId('boxgraphic-container').style.transform).toBe('translateX(-100%)');
    expect(getByTestId('boxgraphic').style.width).toBe('175%');
    expect(getByTestId('boxgraphic-label').textContent).toBe('0.3s');

    // Same as default graph but alignment is from left so every element should start from left
    rerender(
      <TestWrapper>
        <BoxGraphicElement {...props} graph={createGraphState({ alignment: 'fromLeft' })} />
      </TestWrapper>,
    );

    expect(getByTestId('boxgraphic-container').style.transform).toBe('translateX(0%)');
    expect(getByTestId('boxgraphic').style.width).toBe('35%');
    expect(getByTestId('boxgraphic-label').textContent).toBe('0.3s');

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

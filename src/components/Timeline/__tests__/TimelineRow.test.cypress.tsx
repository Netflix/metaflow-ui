import { mount } from '@cypress/react';
import React from 'react';
import { TaskStatus } from '@/types';
import { createStep, createTask, createTimelineMetrics } from '@utils/testhelper';
import TestWrapper from '@utils/testing';
import TimelineRow from '../TimelineRow';
import LineElement from '../TimelineRow/LineElement';

const MockT = (str: any) => str;

describe('TimelineRow component', () => {
  it('<TimelineRow> - should render', () => {
    mount(
      <TestWrapper>
        <TimelineRow
          timeline={createTimelineMetrics({})}
          onOpen={cy.stub()}
          item={{ type: 'task', data: [createTask({})] }}
          dragging={false}
          t={MockT}
        />
      </TestWrapper>,
    );
  });

  it('<TimelineRow> - task row without start times', () => {
    const task = createTask({});
    mount(
      <TestWrapper>
        <TimelineRow
          timeline={createTimelineMetrics({})}
          onOpen={cy.stub()}
          item={{ type: 'task', data: [task, createTask({ finished_at: 9999999999 })] }}
          dragging={false}
          t={MockT}
        />
      </TestWrapper>,
    );
    // Dont render elements rows since there is no started at values
    cy.get('[data-testid="timeline-row-graphic-container"]').children().should('have.length', '0');
  });

  it('<TimelineRow> - task row', () => {
    mount(
      <TestWrapper>
        <TimelineRow
          timeline={createTimelineMetrics({})}
          onOpen={cy.stub()}
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
    cy.get('[data-testid="timeline-row-graphic-container"]').children().should('have.length', '2');
  });

  it('<TimelineRow> - step row', () => {
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

    mount(
      <TestWrapper>
        <TimelineRow {...props} />
      </TestWrapper>,
    );
    // Should have only one line graphic
    // expect(getByTestId('timeline-row-graphic-container').children.length).toBe(1);
    cy.get('[data-testid="timeline-row-graphic-container"]').children().should('have.length', '1');
  });

  it('<LineElement>', () => {
    const task = createTask({ ts_epoch: 100, started_at: 100, finished_at: 450, duration: 350 });
    const props = {
      timeline: createTimelineMetrics({}),
      row: { type: 'task' as const, data: task },
      finishedAt: task.finished_at,
      duration: 350,
      isLastAttempt: true,
      dragging: false,
    };

    mount(
      <TestWrapper>
        <div style={{ width: '484px' }}>
          <LineElement {...props} />
        </div>
      </TestWrapper>,
    );
    // Values of container and boxgraphic should be weird since we are extending timeline over selected value
    // by 1% of selected visible timeline
    cy.get('[data-testid="boxgraphic-container"]').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 47.9208, 0)');
    cy.get('[data-testid="boxgraphic"]').should('have.css', 'width', '167.71875px');
    cy.get('[data-testid="boxgraphic-label"]').contains('0.3s');

    // Change graph zoom values to start from 0.3s and end to 0.5s. Element will be
    // rendered quite a lot to the left (translateX -100%)
    mount(
      <TestWrapper>
        <div style={{ width: '484px' }}>
          <LineElement {...props} timeline={createTimelineMetrics({ visibleStartTime: 300, visibleEndTime: 500 })} />
        </div>
      </TestWrapper>,
    );

    cy.get('[data-testid="boxgraphic-container"]').should('have.css', 'transform', 'matrix(1, 0, 0, 1, -479.208, 0)');
    cy.get('[data-testid="boxgraphic"]').should('have.css', 'width', '838.609375px');
    cy.get('[data-testid="boxgraphic-label"]').contains('0.3s');

    // Same as default graph but alignment is from left so every element should start from left
    mount(
      <TestWrapper>
        <div style={{ width: '484px' }}>
          <LineElement {...props} timeline={createTimelineMetrics({ sortBy: 'duration' })} />
        </div>
      </TestWrapper>,
    );

    cy.get('[data-testid="boxgraphic-container"]').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 0)');
    cy.get('[data-testid="boxgraphic"]').should('have.css', 'width', '167.71875px');
    cy.get('[data-testid="boxgraphic-label"]').contains('0.3s');

    // Try with unfinished item. No label since bar takes so wide space
    mount(
      <TestWrapper>
        <div style={{ width: '484px' }}>
          <LineElement {...props} timeline={createTimelineMetrics({})} duration={null} />
        </div>
      </TestWrapper>,
    );

    cy.get('[data-testid="boxgraphic-container"]').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 47.9208, 0)');
    cy.get('[data-testid="boxgraphic"]').should('have.css', 'width', '436.078125px');
  });
});

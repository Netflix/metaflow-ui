import React from 'react';
import { createTask, createStep } from '../../../utils/testhelper';
import TaskListLabel from '../TaskListLabel';
import { mount } from '@cypress/react';
import TestWrapper from '../../../utils/testing';

const MockT = (str: any) => str;

const BASE_PROPS = {
  open: true,
  grouped: true,
  t: MockT,
  status: 'completed' as const,
};

function get(dataid: string) {
  return cy.get('[data-testid="' + dataid + '"]');
}

describe('TaskListLabel component', () => {
  it('<TaskListLabel> - should render', () => {
    mount(
      <TestWrapper>
        <TaskListLabel type="task" item={createTask({})} duration={100} {...BASE_PROPS} />
      </TestWrapper>,
    );
  });

  it('<TaskListLabel> - Task when grouping', () => {
    mount(
      <TestWrapper>
        <TaskListLabel type="task" item={createTask({ duration: 1100 })} duration={1100} {...BASE_PROPS} />
      </TestWrapper>,
    );

    cy.get('[data-testid="tasklistlabel-text"]').should('have.text', '1');
    cy.get('[data-testid="tasklistlabel-link"]').should('have.attr', 'href', '/BasicFlow/1/start/1');
    cy.get('[data-testid="tasklistlabel-duration"]').should('have.text', '1.1s');
  });

  it('<TaskListLabel> - Task when not grouping', () => {
    mount(
      <TestWrapper>
        <TaskListLabel type="task" item={createTask({})} duration={100} {...BASE_PROPS} grouped={false} />
      </TestWrapper>,
    );

    cy.get('[data-testid="tasklistlabel-text"').should('have.text', 'start/1');
  });

  it('<TaskListLabel> - Step', () => {
    const TOGGLE_FN = cy.stub();

    mount(
      <TestWrapper>
        <TaskListLabel type="step" item={createStep({})} {...BASE_PROPS} duration={1200} toggle={TOGGLE_FN} />
      </TestWrapper>,
    );

    get('tasklistlabel-text').should('have.text', 'start');
    get('tasklistlabel-open-icon').should('have.attr', 'rotate', 0);
    get('tasklistlabel-duration').should('have.text', '1.2s');

    mount(
      <TestWrapper>
        <TaskListLabel
          type="step"
          item={createStep({})}
          {...BASE_PROPS}
          duration={1200}
          open={false}
          toggle={TOGGLE_FN}
        />
      </TestWrapper>,
    );

    get('tasklistlabel-open-icon').should('have.attr', 'rotate', -90);

    get('tasklistlabel-step-container')
      .click()
      .then(() => {
        expect(TOGGLE_FN).have.been.called;
      });
  });
});

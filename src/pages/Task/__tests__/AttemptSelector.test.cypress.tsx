import React from 'react';
import AttemptSelector from '../components/AttemptSelector';
import TestWrapper, { gid } from '../../../utils/testing';
import { createTask } from '../../../utils/testhelper';
import { mount } from '@cypress/react';

describe('AttemptSelector component', () => {
  it('<AttemptSelector /> - with tasks', () => {
    const fn = cy.stub();
    mount(
      <TestWrapper>
        <AttemptSelector
          tasks={[createTask({ attempt_id: 0 }), createTask({ attempt_id: 1 })]}
          currentAttempt={0}
          onSelect={(val) => fn(val)}
        />
      </TestWrapper>,
    );
    gid('attempt-tab-0').contains('0');
    gid('attempt-tab-1').contains('1');

    gid('attempt-tab-1')
      .click()
      .then(() => {
        expect(fn).to.have.been.calledWith('1');
      });
  });
});

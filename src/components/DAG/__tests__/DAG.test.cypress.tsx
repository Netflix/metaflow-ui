import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '../../../utils/testing';
import DAG, { isDAGError } from '..';
import { createResource } from '../../../utils/testhelper';
import { Run } from '../../../types';

const run: Run = {
  flow_id: 'SplitForeachFlow',
  run_number: 26,
  user_name: 'SanteriCM',
  user: 'SanteriCM',
  status: 'completed',
  ts_epoch: 1597034293177,
  finished_at: 1597034329717,
  duration: 36540,
  tags: [],
  system_tags: ['user:SanteriCM', 'runtime:dev', 'python_version:3.7.6', 'date:2020-08-10', 'metaflow_version:2.0.5'],
};

describe('DAG test', () => {
  it('<DAG /> - health check', async () => {
    mount(
      <TestWrapper>
        <DAG
          run={run}
          steps={[]}
          result={createResource(
            { file: 'test_file', parameters: [], constants: [], steps: {}, graph_structure: [] },
            {},
          )}
        />
      </TestWrapper>,
    );
    // Expect to see error here since we don't mock websocket
    cy.get('[data-testid="dag-container-Error"]').should('exist');
  });

  it('isDAGError', () => {
    expect(isDAGError('Error', null)).to.be.true;
    expect(isDAGError('Ok', null)).to.be.true;
    expect(isDAGError('Loading', null)).to.be.false;
    expect(isDAGError('NotAsked', null)).to.be.false;

    expect(
      isDAGError('Error', {
        file: 'string',
        parameters: [],
        constants: [],
        steps: {},
        graph_structure: [],
        doc: 'string',
      }),
    ).to.be.false;

    expect(
      isDAGError('Ok', {
        file: 'string',
        parameters: [],
        constants: [],
        steps: {},
        graph_structure: [],
        doc: 'string',
      }),
    ).to.be.false;
  });
});

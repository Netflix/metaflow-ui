import React from 'react';
import DAG, { isDAGError } from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
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

describe('DAG component', () => {
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 500,
        json: () => Promise.resolve({}),
      }),
    ) as any;
  });

  test('<DAG /> - health check', async () => {
    const { findAllByTestId } = render(
      <TestWrapper>
        <DAG run={run} steps={[]} />
      </TestWrapper>,
    );
    // Expect to see error here since we don't mock websocket
    await findAllByTestId('dag-container-Error');
  });

  test('isDAGError', () => {
    expect(isDAGError('Error', [])).toBe(true);
    expect(isDAGError('Ok', [])).toBe(true);
    expect(isDAGError('Loading', [])).toBe(false);
    expect(isDAGError('NotAsked', [])).toBe(false);

    expect(
      isDAGError('Error', [
        {
          node_type: 'container',
          container_type: 'parallel',
          steps: [],
        },
      ]),
    ).toBe(false);

    expect(
      isDAGError('Ok', [
        {
          node_type: 'container',
          container_type: 'parallel',
          steps: [],
        },
      ]),
    ).toBe(false);
  });
});

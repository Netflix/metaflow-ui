import React from 'react';
import Task from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
import { Run } from '../../../types';

const run: Run = {
  flow_id: 'string',
  user_name: 'string',
  ts_epoch: 123,
  tags: [],
  system_tags: [],
  run_number: 123,
  status: 'completed',
};

describe('Task page', () => {
  test('<Task /> - health check', () => {
    render(
      <TestWrapper>
        <Task run={run} stepName="test" taskId="test" />
      </TestWrapper>,
    );
  });
});

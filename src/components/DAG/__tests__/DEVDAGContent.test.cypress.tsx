import React from 'react';
import { mount } from '@cypress/react';
import DAGContent from '../components/DAGContent';
import { createRun } from '../../../utils/testhelper';
import TestWrapper from '../../../utils/testing';

const data = {
  file: 'foreach.py',
  parameters: [
    {
      name: 'count',
      type: 'Parameter',
    },
  ],
  constants: [],
  steps_info: {
    start: {
      name: 'start',
      type: 'start' as const,
      line: 9,
      doc: '',
      decorators: [],
      next: ['regular_step'],
      foreach_artifact: null,
    },
    regular_step: {
      name: 'regular_step',
      type: 'linear' as const,
      line: 13,
      doc: '',
      decorators: [],
      next: ['prepare_foreach'],
      foreach_artifact: null,
    },
    prepare_foreach: {
      name: 'prepare_foreach',
      type: 'foreach' as const,
      line: 18,
      doc: '',
      decorators: [],
      next: ['process_foreach'],
      foreach_artifact: 'things',
    },
    process_foreach: {
      name: 'process_foreach',
      type: 'linear' as const,
      line: 23,
      doc: '',
      decorators: [],
      next: ['join'],
      foreach_artifact: null,
    },
    join: {
      name: 'join',
      type: 'join' as const,
      line: 29,
      doc: '',
      decorators: [],
      next: ['end'],
      foreach_artifact: null,
    },
    end: {
      name: 'end',
      type: 'end' as const,
      line: 33,
      doc: '',
      decorators: [],
      next: [],
      foreach_artifact: null,
    },
  },
  steps_structure: ['start', 'regular_step', 'prepare_foreach', [['process_foreach']], 'join', 'end'],
  doc: '',
  decorators: [],
};

const data2 = {
  file: 'split-foreach.py',
  parameters: [
    {
      name: 'count',
      type: 'Parameter',
    },
  ],
  constants: [],
  steps_info: {
    start: {
      name: 'start',
      type: 'split' as const,
      line: 10,
      doc: '',
      decorators: [],
      next: ['regular_step', 'prepare_foreach'],
      foreach_artifact: null,
    },
    regular_step: {
      name: 'regular_step',
      type: 'linear' as const,
      line: 14,
      doc: '',
      decorators: [],
      next: ['prepare_another_foreach'],
      foreach_artifact: null,
    },
    prepare_another_foreach: {
      name: 'prepare_another_foreach',
      type: 'foreach' as const,
      line: 19,
      doc: '',
      decorators: [],
      next: ['another_foreach'],
      foreach_artifact: 'things',
    },
    another_foreach: {
      name: 'another_foreach',
      type: 'linear' as const,
      line: 24,
      doc: '',
      decorators: [],
      next: ['join_another_foreach'],
      foreach_artifact: null,
    },
    join_another_foreach: {
      name: 'join_another_foreach',
      type: 'join' as const,
      line: 29,
      doc: '',
      decorators: [],
      next: ['join'],
      foreach_artifact: null,
    },
    prepare_foreach: {
      name: 'prepare_foreach',
      type: 'foreach' as const,
      line: 33,
      doc: '',
      decorators: [],
      next: ['process_foreach'],
      foreach_artifact: 'things',
    },
    process_foreach: {
      name: 'process_foreach',
      type: 'linear' as const,
      line: 38,
      doc: '',
      decorators: [],
      next: ['join_foreach'],
      foreach_artifact: null,
    },
    join_foreach: {
      name: 'join_foreach',
      type: 'join' as const,
      line: 43,
      doc: '',
      decorators: [],
      next: ['join'],
      foreach_artifact: null,
    },
    join: {
      name: 'join',
      type: 'join' as const,
      line: 47,
      doc: '',
      decorators: [],
      next: ['end'],
      foreach_artifact: null,
    },
    end: {
      name: 'end',
      type: 'end' as const,
      line: 51,
      doc: '',
      decorators: [],
      next: [],
      foreach_artifact: null,
    },
  },
  steps_structure: [
    'start',
    [
      ['regular_step', 'prepare_another_foreach', [['another_foreach']], 'join_another_foreach'],
      ['prepare_foreach', [['process_foreach']], 'join_foreach'],
    ],
    'join',
    'end',
  ],
  doc: '',
  decorators: [],
};

describe('DAGContent dev', () => {
  beforeEach(() => {
    cy.viewport(800, 800);
  });

  it('test', () => {
    mount(
      <TestWrapper>
        <DAGContent graphData={data} showFullscreen={true} run={createRun({})} stepData={[]} />
      </TestWrapper>,
    );
  });

  it('test2', () => {
    mount(
      <TestWrapper>
        <DAGContent graphData={data2} showFullscreen={true} run={createRun({})} stepData={[]} />
      </TestWrapper>,
    );
  });
});

import { convertDAGModelToTree, DAGModel } from '../DAGUtils';

describe('DAG utilities', () => {
  it('convertDAGModelToTree - Basic dag', () => {
    const BASIC_DAG: DAGModel = {
      start: { type: 'split-and', box_next: true, box_ends: 'join', next: ['a', 'b'] },
      a: { type: 'linear', box_next: false, box_ends: null, next: ['join'] },
      b: { type: 'linear', box_next: false, box_ends: null, next: ['join'] },
      join: { type: 'join', box_next: false, box_ends: null, next: ['end'] },
      end: { type: 'end', box_next: false, box_ends: null, next: [] },
    };

    const BASIC_DAG_EXPECTED_RESULT = [
      {
        node_type: 'normal',
        type: 'normal',
        step_name: 'start',
        children: [],
        original: {
          type: 'split-and',
          box_next: true,
          box_ends: 'join',
          next: ['a', 'b'],
        },
      },
      {
        node_type: 'container',
        container_type: 'parallel',
        steps: [
          {
            node_type: 'normal',
            type: 'normal',
            step_name: 'a',
            children: [],
            original: { type: 'linear', box_next: false, box_ends: null, next: ['join'] },
          },
          {
            node_type: 'normal',
            type: 'normal',
            step_name: 'b',
            children: [],
            original: { type: 'linear', box_next: false, box_ends: null, next: ['join'] },
          },
        ],
      },
      {
        node_type: 'normal',
        type: 'normal',
        step_name: 'join',
        children: [],
        original: { type: 'join', box_next: false, box_ends: null, next: ['end'] },
      },
      {
        node_type: 'normal',
        type: 'normal',
        step_name: 'end',
        children: [],
        original: { type: 'end', box_next: false, box_ends: null, next: [] },
      },
    ];
    expect(convertDAGModelToTree(BASIC_DAG)).toEqual(BASIC_DAG_EXPECTED_RESULT);
  });

  it('convertDAGModelToTree - HugeFlow dag', () => {
    const HUGEFLOW_DAG: DAGModel = {
      start: {
        type: 'split-and',
        box_next: true,
        box_ends: 'join',
        next: ['regular_step', 'prepare_foreach'],
      },

      regular_step: {
        type: 'linear',
        box_next: false,
        box_ends: null,
        next: ['prepare_another_foreach'],
      },
      prepare_another_foreach: {
        type: 'foreach',
        box_next: true,
        box_ends: 'join_another_foreach',
        next: ['another_foreach'],
      },
      another_foreach: {
        type: 'linear',
        box_next: false,
        box_ends: null,
        next: ['join_another_foreach'],
      },
      join_another_foreach: {
        type: 'linear',
        box_next: false,
        box_ends: null,
        next: ['join'],
      },

      prepare_foreach: {
        type: 'foreach',
        box_next: true,
        box_ends: 'join_foreach',
        next: ['process_foreach'],
      },
      process_foreach: {
        type: 'linear',
        box_next: false,
        box_ends: null,
        next: ['join_foreach'],
      },
      join_foreach: {
        type: 'linear',
        box_next: false,
        box_ends: null,
        next: ['join'],
      },
      join: {
        type: 'linear',
        box_next: false,
        box_ends: null,
        next: ['end'],
      },

      end: {
        type: 'end',
        box_next: false,
        box_ends: null,
        next: [],
      },
    };

    const HUGEFLOW_EXPECTED_RESULT = [
      {
        node_type: 'normal',
        type: 'normal',
        step_name: 'start',
        children: [],
        original: {
          type: 'split-and',
          box_next: true,
          box_ends: 'join',
          next: ['regular_step', 'prepare_foreach'],
        },
      },
      {
        node_type: 'container',
        container_type: 'parallel',
        steps: [
          {
            children: [
              {
                children: [],
                node_type: 'normal',
                original: {
                  box_ends: 'join_another_foreach',
                  box_next: true,
                  next: ['another_foreach'],
                  type: 'foreach',
                },
                step_name: 'prepare_another_foreach',
                type: 'loop',
              },
              {
                container_type: 'foreach',
                node_type: 'container',
                steps: [
                  {
                    children: [],
                    node_type: 'normal',
                    original: {
                      box_ends: null,
                      box_next: false,
                      next: ['join_another_foreach'],
                      type: 'linear',
                    },
                    step_name: 'another_foreach',
                    type: 'normal',
                  },
                ],
              },
              {
                children: [],
                node_type: 'normal',
                original: {
                  box_ends: null,
                  box_next: false,
                  next: ['join'],
                  type: 'linear',
                },
                step_name: 'join_another_foreach',
                type: 'normal',
              },
            ],
            node_type: 'normal',
            original: {
              box_ends: null,
              box_next: false,
              next: ['prepare_another_foreach'],
              type: 'linear',
            },
            step_name: 'regular_step',
            type: 'normal',
          },
          {
            children: [
              {
                container_type: 'foreach',
                node_type: 'container',
                steps: [
                  {
                    children: [],
                    node_type: 'normal',
                    original: {
                      box_ends: null,
                      box_next: false,
                      next: ['join_foreach'],
                      type: 'linear',
                    },
                    step_name: 'process_foreach',
                    type: 'normal',
                  },
                ],
              },
              {
                children: [],
                node_type: 'normal',
                original: {
                  box_ends: null,
                  box_next: false,
                  next: ['join'],
                  type: 'linear',
                },
                step_name: 'join_foreach',
                type: 'normal',
              },
            ],
            node_type: 'normal',
            original: {
              box_ends: 'join_foreach',
              box_next: true,
              next: ['process_foreach'],
              type: 'foreach',
            },
            step_name: 'prepare_foreach',
            type: 'loop',
          },
        ],
      },
      {
        node_type: 'normal',
        type: 'normal',
        step_name: 'join',
        children: [],
        original: { type: 'linear', box_next: false, box_ends: null, next: ['end'] },
      },
      {
        node_type: 'normal',
        type: 'normal',
        step_name: 'end',
        children: [],
        original: { type: 'end', box_next: false, box_ends: null, next: [] },
      },
    ];
    expect(convertDAGModelToTree(HUGEFLOW_DAG)).toEqual(HUGEFLOW_EXPECTED_RESULT);
  });
});

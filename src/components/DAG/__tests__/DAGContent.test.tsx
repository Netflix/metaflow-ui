import { render } from '@testing-library/react';
import React from 'react';
import { createRun } from '../../../utils/testhelper';
import TestWrapper from '../../../utils/testing';
import { ContainerElement, RenderStep } from '../components/DAGContent';

describe('DAGContent components', () => {
  test('<ContainerElement /> - should render parallel container', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ContainerElement containerType="parallel" />
      </TestWrapper>,
    );
    expect(getByTestId('dag-parallel-container')).toBeInTheDocument();
  });

  test('<ContainerElement /> - should render foreach container', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ContainerElement containerType="foreach" />
      </TestWrapper>,
    );
    expect(getByTestId('dag-foreach-container')).toBeInTheDocument();
  });

  test('<RenderStep /> - should render Normalitem', () => {
    const { getByTestId, getAllByTestId } = render(
      <TestWrapper>
        <RenderStep
          item={{
            node_type: 'normal',
            type: 'normal',
            step_name: 'start',
            children: [
              {
                node_type: 'normal',
                type: 'normal',
                step_name: 'a',
                children: [],
                original: {
                  type: 'linear',
                  box_next: false,
                  box_ends: null,
                  next: ['join'],
                },
              },
            ],
            original: {
              type: 'split-and',
              box_next: true,
              box_ends: 'join',
              next: ['a'],
            },
          }}
          stepIds={[[], []]}
          run={createRun({})}
        />
      </TestWrapper>,
    );

    expect(getAllByTestId('dag-normalitem').length).toBe(2);
    expect(getByTestId('dag-normalitem-children').children.length).toBe(1);
    expect(getAllByTestId('dag-normalitem-box')[0].textContent).toBe('start');
    expect(getAllByTestId('dag-normalitem-box')[1].textContent).toBe('a');
  });

  test('<RenderStep /> - should render ContainerItem', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <RenderStep
          item={{
            node_type: 'container',
            container_type: 'parallel',
            steps: [],
          }}
          stepIds={[[], []]}
          run={createRun({})}
        />
      </TestWrapper>,
    );

    expect(getByTestId('dag-parallel-container')).toBeInTheDocument();
  });
});

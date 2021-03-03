import React from 'react';
import TaskListingHeader, { getMode } from '../TaskListingHeader';
import { render, fireEvent } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
import useGraph from '../../Timeline/useGraph';
import useSeachField from '../../../hooks/useSearchField';
import CollapseButton from '../components/CollapseButton';
import { createGraphState } from '../../../utils/testhelper';

const headerFunctionProps = {
  expandAll: () => null,
  collapseAll: () => null,
  setFullscreen: () => null,
  isFullscreen: false,
  setMode: () => null,
  enableZoomControl: true,
  isAnyGroupOpen: true,
  counts: {
    all: 0,
    completed: 0,
    running: 0,
    failed: 0,
  },
};

describe('TaskListingHeader component', () => {
  test('<TaskListingHeader> - should render', () => {
    const Component = () => {
      const graph = useGraph(0, 100, false);
      const searchField = useSeachField('a', 'b');
      return (
        <TestWrapper>
          <TaskListingHeader graph={graph} searchField={searchField} {...headerFunctionProps} />
        </TestWrapper>
      );
    };
    render(<Component />);
  });

  test('getMode', () => {
    const graph = createGraphState({ isCustomEnabled: true });

    expect(getMode(graph)).toBe('custom');
    // Predefined modes
    expect(
      getMode({
        ...graph,
        isCustomEnabled: false,
        group: true,
        statusFilter: null,
        sortBy: 'startTime',
        sortDir: 'asc',
      }),
    ).toBe('overview');
    expect(
      getMode({
        ...graph,
        isCustomEnabled: false,
        group: false,
        statusFilter: null,
        sortBy: 'startTime',
        sortDir: 'desc',
      }),
    ).toBe('monitoring');
    expect(
      getMode({
        ...graph,
        isCustomEnabled: false,
        group: true,
        statusFilter: 'failed',
        sortBy: 'startTime',
        sortDir: 'asc',
      }),
    ).toBe('error-tracker');
    // Random settings -> custom
    expect(
      getMode({
        ...graph,
        isCustomEnabled: false,
        group: false,
        statusFilter: 'running',
        sortBy: 'endTime',
        sortDir: 'asc',
      }),
    ).toBe('custom');
  });

  test('<CollapseButton> - settings button', () => {
    const props = {
      expand: jest.fn(),
      collapse: jest.fn(),
      isAnyGroupOpen: true,
    };
    const { getByTestId, rerender } = render(
      <TestWrapper>
        <CollapseButton {...props} />
      </TestWrapper>,
    );

    fireEvent.click(getByTestId('timeline-collapse-button'));
    expect(props.collapse).toHaveBeenCalled();

    rerender(
      <TestWrapper>
        <CollapseButton {...props} isAnyGroupOpen={false} />
      </TestWrapper>,
    );

    fireEvent.click(getByTestId('timeline-collapse-button'));
    expect(props.expand).toHaveBeenCalled();
  });
});

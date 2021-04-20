import React from 'react';
import TaskListingHeader, { getMode } from '../TaskListingHeader';
import { render, fireEvent } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
import useSeachField from '../../../hooks/useSearchField';
import CollapseButton from '../components/CollapseButton';
import { createTaskListSettings } from '../../../utils/testhelper';

const headerFunctionProps = {
  onToggleCollapse: () => null,
  onModeSelect: () => null,
  setQueryParam: () => null,
  setFullscreen: () => null,
  isFullscreen: false,
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
      const searchField = useSeachField('a', 'b');
      return (
        <TestWrapper>
          <TaskListingHeader settings={createTaskListSettings({})} searchField={searchField} {...headerFunctionProps} />
        </TestWrapper>
      );
    };
    render(<Component />);
  });

  test('getMode', () => {
    const settings = createTaskListSettings({ isCustomEnabled: true });

    expect(getMode(settings)).toBe('custom');
    // Predefined modes
    expect(
      getMode({
        ...settings,
        isCustomEnabled: false,
        group: true,
        statusFilter: null,
        sort: ['startTime', 'asc']
      }),
    ).toBe('overview');
    expect(
      getMode({
        ...settings,
        isCustomEnabled: false,
        group: false,
        statusFilter: null,
        sort: ['startTime', 'desc']
      }),
    ).toBe('monitoring');
    expect(
      getMode({
        ...settings,
        isCustomEnabled: false,
        group: true,
        statusFilter: 'failed',
        sort: ['startTime', 'asc']
      }),
    ).toBe('error-tracker');
    // Random settings -> custom
    expect(
      getMode({
        ...settings,
        isCustomEnabled: false,
        group: false,
        statusFilter: 'running',
        sort: ['endTime', 'asc']
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

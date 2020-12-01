import React from 'react';
import TaskListingHeader from '../TaskListingHeader';
import { render, fireEvent } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
import useGraph from '../../Timeline/useGraph';
import useSeachField from '../../../hooks/useSearchField';
import CollapseButton from '../components/CollapseButton';

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

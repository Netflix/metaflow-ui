import React from 'react';
import TimelineHeader from '../TimelineHeader';
import { render, fireEvent } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
import useGraph from '../useGraph';
import useSeachField from '../../../hooks/useSearchField';
import CollapseButton from '../CollapseButton';

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

describe('TimelineHeader component', () => {
  test('<TimelineHeader> - should render', () => {
    const Component = () => {
      const graph = useGraph(0, 100);
      const searchField = useSeachField('a', 'b');
      return (
        <TestWrapper>
          <TimelineHeader graph={graph} searchField={searchField} {...headerFunctionProps} />
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

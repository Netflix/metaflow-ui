import React from 'react';
import TimelineHeader, { TimelineHeaderProps } from '../TimelineHeader';
import { render, fireEvent } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
import { createGraphState } from '../testhelper';

const headerFunctionProps = {
  zoom: () => null,
  zoomReset: () => null,
  toggleGroupBy: () => null,
  updateSortBy: () => null,
  updateSortDir: () => null,
  expandAll: () => null,
  collapseAll: () => null,
  setFullscreen: () => null,
  isFullscreen: false,
  updateStatusFilter: () => null,
};

describe('TimelineHeader component', () => {
  test('<TimelineHeader> - should render', () => {
    render(
      <TestWrapper>
        <TimelineHeader graph={createGraphState({})} {...headerFunctionProps} />
      </TestWrapper>,
    );
  });

  test('<TimelineHeader> - group by', () => {
    const props: TimelineHeaderProps = {
      graph: createGraphState({}),
      ...headerFunctionProps,
      toggleGroupBy: jest.fn(),
    };
    const { getByTestId } = render(
      <TestWrapper>
        <TimelineHeader {...props} />
      </TestWrapper>,
    );

    // Click settings button
    expect(getByTestId('timeline-settings-button')).toBeInTheDocument();
    fireEvent.click(getByTestId('timeline-settings-button'));

    expect(getByTestId('timeline-header-groupby-step')).toHaveClass('active');

    fireEvent.click(getByTestId('timeline-header-groupby-step'));
    expect(props.toggleGroupBy).toBeCalledTimes(1);
  });

  test('<SettingsButton> - settings button', () => {
    const props: TimelineHeaderProps = {
      graph: createGraphState({}),
      ...headerFunctionProps,
      expandAll: jest.fn(),
      collapseAll: jest.fn(),
    };
    const { getByTestId } = render(
      <TestWrapper>
        <TimelineHeader {...props} />
      </TestWrapper>,
    );

    // Click settings button
    expect(getByTestId('timeline-settings-button')).toBeInTheDocument();
    fireEvent.click(getByTestId('timeline-settings-button'));
    // Expand and collapse should now be in document
    expect(getByTestId('timeline-settings-expand-all')).toBeInTheDocument();
    expect(getByTestId('timeline-settings-collapse-all')).toBeInTheDocument();
    // Click expand and check results
    fireEvent.click(getByTestId('timeline-settings-expand-all'));
    expect(props.expandAll).toBeCalledTimes(1);
    // Open pop up again and check collapse all button
    fireEvent.click(getByTestId('timeline-settings-button'));
    fireEvent.click(getByTestId('timeline-settings-collapse-all'));
    expect(props.expandAll).toBeCalledTimes(1);
  });

  test('<TimelineHeader> - order by', () => {
    const props: TimelineHeaderProps = {
      graph: createGraphState({}),
      ...headerFunctionProps,
      updateSortBy: jest.fn(),
      updateSortDir: jest.fn(),
    };
    const { getByTestId, rerender } = render(
      <TestWrapper>
        <TimelineHeader {...props} />
      </TestWrapper>,
    );

    expect(getByTestId('timeline-header-orderby-startTime')).toHaveClass('active');
    expect(getByTestId('timeline-header-orderby-duration')).not.toHaveClass('active');
    // When started at is active and we click, we should call updateSortDir function instead
    fireEvent.click(getByTestId('timeline-header-orderby-startTime'));
    expect(props.updateSortBy).toBeCalledTimes(0);
    expect(props.updateSortDir).toBeCalledTimes(1);
    // When started at is active and we click duration button, we call updateSortBy
    fireEvent.click(getByTestId('timeline-header-orderby-duration'));
    expect(props.updateSortBy).toBeCalledWith('duration');

    rerender(
      <TestWrapper>
        <TimelineHeader {...props} graph={createGraphState({ sortBy: 'duration', sortDir: 'desc' })} />
      </TestWrapper>,
    );
    // Try other way around
    fireEvent.click(getByTestId('timeline-header-orderby-startTime'));
    expect(props.updateSortBy).toBeCalledWith('startTime');

    fireEvent.click(getByTestId('timeline-header-orderby-duration'));
    expect(props.updateSortDir).toBeCalledTimes(2);
  });

  test('<TimelineHeader> - order by', () => {
    const props: TimelineHeaderProps = {
      graph: createGraphState({}),
      ...headerFunctionProps,
      zoom: jest.fn(),
      zoomReset: jest.fn(),
    };
    const { getByTestId } = render(
      <TestWrapper>
        <TimelineHeader {...props} />
      </TestWrapper>,
    );

    expect(getByTestId('timeline-header-zoom-fit')).toHaveClass('active');

    fireEvent.click(getByTestId('timeline-header-zoom-out'));
    expect(props.zoom).toHaveBeenCalledWith('out');

    fireEvent.click(getByTestId('timeline-header-zoom-in'));
    expect(props.zoom).toHaveBeenCalledWith('in');
  });
});

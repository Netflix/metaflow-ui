import { mount } from '@cypress/react';
import React from 'react';
import { Run } from '@/types';
import CollapseButton from '@components/TaskListingHeader/components/CollapseButton';
import useSearchField from '@hooks/useSearchField';
import { createTaskListSettings } from '@utils/testhelper';
import TestWrapper from '@utils/testing';
import TaskListingHeader, { getMode } from '../TaskListingHeader';

const mockRun: Run = {
  run_number: 1,
  status: 'running',
  flow_id: '1',
  system_tags: [],
  ts_epoch: 1597490980000,
  user_name: 'test_user',
  user: 'test_user',
};

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
    pending: 0,
    unknown: 0,
  },
  run: mockRun,
};

describe('TaskListingHeader test', () => {
  it('<TaskListingHeader> - should render', () => {
    const Component = () => {
      const searchField = useSearchField('a', 'b');
      return (
        <TestWrapper>
          <TaskListingHeader settings={createTaskListSettings({})} searchField={searchField} {...headerFunctionProps} />
        </TestWrapper>
      );
    };
    mount(<Component />);
  });

  it('getMode', () => {
    const settings = createTaskListSettings({ isCustomEnabled: true });

    expect(getMode(settings)).to.equal('custom');
    // Predefined modes
    expect(
      getMode({
        ...settings,
        isCustomEnabled: false,
        group: true,
        statusFilter: null,
        sort: ['startTime', 'asc'],
      }),
    ).to.equal('overview');
    expect(
      getMode({
        ...settings,
        isCustomEnabled: false,
        group: false,
        statusFilter: null,
        sort: ['startTime', 'desc'],
      }),
    ).to.equal('monitoring');
    expect(
      getMode({
        ...settings,
        isCustomEnabled: false,
        group: true,
        statusFilter: 'failed',
        sort: ['startTime', 'asc'],
      }),
    ).to.equal('error-tracker');
    // Random settings -> custom
    expect(
      getMode({
        ...settings,
        isCustomEnabled: false,
        group: false,
        statusFilter: 'running',
        sort: ['endTime', 'asc'],
      }),
    ).to.equal('custom');
  });

  it('<CollapseButton> - settings button', () => {
    const props = {
      expand: cy.stub(),
      collapse: cy.stub(),
      isAnyGroupOpen: true,
    };
    mount(
      <TestWrapper>
        <CollapseButton {...props} />
      </TestWrapper>,
    );

    cy.get('[data-testid="timeline-collapse-button"]')
      .click()
      .then(() => {
        expect(props.collapse).to.be.calledOnce;
      });

    mount(
      <TestWrapper>
        <CollapseButton {...props} isAnyGroupOpen={false} />
      </TestWrapper>,
    );

    cy.get('[data-testid="timeline-collapse-button"]')
      .click()
      .then(() => {
        expect(props.expand).to.be.calledOnce;
      });
  });
});

import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import TaskListingHeader, { getMode } from '../TaskListingHeader';
import useSeachField from '../../../hooks/useSearchField';
import CollapseButton from '../components/CollapseButton';
import { createTaskListSettings } from '../../../utils/testhelper';
import { Run } from '../../../types';

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
      const searchField = useSeachField('a', 'b');
      return (
        <ThemeProvider theme={theme}>
          <TaskListingHeader settings={createTaskListSettings({})} searchField={searchField} {...headerFunctionProps} />
        </ThemeProvider>
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
      <ThemeProvider theme={theme}>
        <CollapseButton {...props} />
      </ThemeProvider>,
    );

    cy.get('[data-testid="timeline-collapse-button"]')
      .click()
      .then(() => {
        expect(props.collapse).to.be.calledOnce;
      });

    mount(
      <ThemeProvider theme={theme}>
        <CollapseButton {...props} isAnyGroupOpen={false} />
      </ThemeProvider>,
    );

    cy.get('[data-testid="timeline-collapse-button"]')
      .click()
      .then(() => {
        expect(props.expand).to.be.calledOnce;
      });
  });
});

import { mount } from '@cypress/react';
import React from 'react';
import LogList from '..';
import { LogData } from '../../../hooks/useLogData';
import TestWrapper, { gid } from '../../../utils/testing';

function createLogData(props: Partial<LogData>): LogData {
  return {
    logs: [],
    preloadStatus: 'NotAsked' as const,
    status: 'NotAsked' as const,
    loadMore: (_index: number) => null,
    error: null,
    localSearch: {
      search: () => null,
      result: {
        active: false,
        result: [],
        query: '',
        current: 0,
      },
      nextResult: () => null,
    },
    ...props,
  };
}

function generateLines(amount: number) {
  return new Array(amount).fill('any value').map((_, index) => ({ row: index, line: `This is line ${index}` }));
}

const LIST_CONTAINER_CLASS = 'ReactVirtualized__List';

describe('LogActionBar', () => {
  it('Should render message about empty preload when preload was empty or error and final fetch is not started', () => {
    mount(
      <TestWrapper>
        <LogList logdata={createLogData({ preloadStatus: 'Ok' })} downloadUrl="" />
      </TestWrapper>,
    );

    gid('loglist-preload-empty');

    mount(
      <TestWrapper>
        <LogList logdata={createLogData({ preloadStatus: 'Error' })} downloadUrl="" />
      </TestWrapper>,
    );

    gid('loglist-preload-empty');
  });

  it('Should render message about empty when fetch is ok and results are empty', () => {
    mount(
      <TestWrapper>
        <LogList logdata={createLogData({ status: 'Ok' })} downloadUrl="" />
      </TestWrapper>,
    );

    gid('loglist-empty');
  });

  it('Should render logs if any', () => {
    mount(
      <TestWrapper>
        <LogList
          logdata={createLogData({
            logs: [
              { row: 0, line: 'Hello' },
              { row: 1, line: 'Maailma' },
            ],
          })}
          downloadUrl=""
        />
      </TestWrapper>,
    );

    gid('loglist-container');
    gid('log-line').should('have.length', 2);
  });

  it('Should render only part of rows when there is lot of them', () => {
    mount(
      <TestWrapper>
        <LogList logdata={createLogData({ logs: generateLines(100) })} downloadUrl="" />
      </TestWrapper>,
    );

    gid('loglist-container');
    gid('log-line').should('have.length', 21);
  });

  it('Should render stick to bottom button only after scroll events by user', () => {
    mount(
      <TestWrapper>
        <LogList logdata={createLogData({ logs: generateLines(100) })} downloadUrl="" />
      </TestWrapper>,
    );

    // by default list should stick to bottom and button to go down should not exist
    gid('loglist-stick-bottom').should('not.exist');

    // Scroll a bit and button should appear
    cy.get(`.${LIST_CONTAINER_CLASS}`).scrollTo(0, 100);
    gid('loglist-stick-bottom');
    gid('log-line').contains('This is line 10');

    // Click scroll to bottom and it should appear. Also we should be at bottom again
    gid('loglist-stick-bottom').click();
    gid('loglist-stick-bottom').should('not.exist');
    gid('log-line').contains('This is line 99');
  });
});

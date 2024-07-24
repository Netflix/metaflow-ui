import { mount } from '@cypress/react';
import React from 'react';
import TestWrapper, { gid } from '../../../utils/testing';
import LogActionBar from '../LogActionBar';

const Search = {
  search: () => null,
  result: {
    active: false,
    result: [],
    query: '',
    current: 0,
  },
  nextResult: () => null,
};

describe('LogActionBar', () => {
  it('Should render empty action bar since there is no log data', () => {
    mount(
      <TestWrapper>
        <LogActionBar downloadlink="" data={[]} search={Search} />
      </TestWrapper>,
    );

    gid('log-action-bar').children().should('have.length', 0);
  });

  it('Should render action bar with two buttons', () => {
    mount(
      <TestWrapper>
        <LogActionBar downloadlink="" data={[{ row: 0, line: 'Hello world' }]} search={Search} />
      </TestWrapper>,
    );

    gid('log-action-bar-buttons').children().should('have.length', 2);
  });

  it('Should render action bar with three buttons', () => {
    mount(
      <TestWrapper>
        <LogActionBar
          downloadlink=""
          data={[{ row: 0, line: 'Hello world' }]}
          setFullscreen={() => null}
          search={Search}
        />
      </TestWrapper>,
    );

    gid('log-action-bar-buttons').children().should('have.length', 3);
  });
});

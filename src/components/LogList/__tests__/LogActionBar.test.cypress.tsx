import { mount } from '@cypress/react';
import React from 'react';
import TestWrapper, { gid } from '../../../utils/testing';
import LogActionBar from '../LogActionBar';

describe('LogActionBar', () => {
  it('Should render empty action bar since there is no log data', () => {
    mount(
      <TestWrapper>
        <LogActionBar downloadlink="" data={[]} />
      </TestWrapper>,
    );

    gid('log-action-bar').children().should('have.length', 0);
  });

  it('Should render action bar with two buttons', () => {
    mount(
      <TestWrapper>
        <LogActionBar downloadlink="" data={[{ row: 0, line: 'Hello world' }]} />
      </TestWrapper>,
    );

    gid('log-action-bar').children().should('have.length', 2);
  });

  it('Should render action bar with three buttons', () => {
    mount(
      <TestWrapper>
        <LogActionBar downloadlink="" data={[{ row: 0, line: 'Hello world' }]} setFullscreen={() => null} />
      </TestWrapper>,
    );

    gid('log-action-bar').children().should('have.length', 3);
  });
});

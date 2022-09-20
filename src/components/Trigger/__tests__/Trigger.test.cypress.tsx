import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import Trigger from '..';

const flow_name = 'HelloFlow';
const run_id = 'argo-helloflow-atykf';

describe('Trigger test', () => {
  it('Shows event', () => {
    mount(
      <ThemeProvider theme={theme}>
        <Trigger
          triggerEventsValue={{
            event_name: 'metaflow_flow_run_succeeded',
            timestamp: 1663184739,
            event_id: '123456789123',
            flow_name,
            run_id,
          }}
        />
      </ThemeProvider>,
    );

    cy.get('a').should('have.attr', 'href', `/${flow_name}/${run_id}`).and('contain', 'HelloFlow/...flow-atykf');
  });
});

import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router } from 'react-router-dom';
import theme from '../../../theme';
import Trigger from '..';

const flow_name = 'HelloFlow';
const run_id = 'argo-helloflow-atykf';
const basename = 'abasename';

describe('Trigger test', () => {
  it('Shows event', () => {
    mount(
      <ThemeProvider theme={theme}>
        <Router basename={basename}>
          <Trigger
            triggerEventsValue={{
              name: 'metaflow_flow_run_succeeded',
              timestamp: '1663184739',
              id: `${flow_name}/${run_id}`,
              type: 'run',
            }}
          />
        </Router>
      </ThemeProvider>,
    );

    cy.get('a')
      .should('have.attr', 'href', `/${basename}/${flow_name}/${run_id}`)
      .and('contain', 'HelloFlow/...flow-atykf');
  });
});

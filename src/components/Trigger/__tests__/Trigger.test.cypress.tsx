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

  it('Shows non-run event', () => {
    mount(
      <ThemeProvider theme={theme}>
        <Router basename={basename}>
          <Trigger
            triggerEventsValue={{
              name: 'document_classification',
              timestamp: '1663184739',
              id: '6523f2a6-694a-415d-9ec6-9483afbc7903',
              type: 'event',
            }}
          />
        </Router>
      </ThemeProvider>,
    );

    cy.get('div').should('contain', 'document_classification');
  });
});

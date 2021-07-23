import { mount } from '@cypress/react';
import React from 'react';
import useAutoComplete, { AutoCompleteParameters } from '..';

const WORDS = ['ufo', 'tarjosi', 'kaakaon', 'maistoin', 'sanoin', 'hyvää', 'on'];
const OBJECTS = [{ key: 'ufo' }, { key: 'tarjosi' }, { key: 'kaakaon' }];

const DefaultComponent = (args: Partial<AutoCompleteParameters<any>>) => {
  const { result } = useAutoComplete({ url: '/words', input: '', ...args });

  return (
    <div>
      <div data-testid="status">{result.status}</div>
      <div data-testid="content">{result.data.map((item) => item.label).join(',')}</div>
    </div>
  );
};

describe('useAutocomplete tests', () => {
  function resultIs(status: string, words: string) {
    cy.get('[data-testid="status"]').contains(status);
    if (words === '') {
      cy.get('[data-testid="content"]').should('be.empty');
    } else {
      cy.get('[data-testid="content"]').contains(words);
    }
  }

  beforeEach(() => {
    cy.intercept('GET', '**/api/filtered*', (req) => {
      req.reply({
        body: { status: 200, data: WORDS.filter((w) => w.includes(req.query.q as string)) },
      });
    });
    cy.intercept('GET', '**/api/objects*', { statusCode: 200, body: { data: OBJECTS } });
    cy.intercept('GET', '**/api/words?*', { statusCode: 200, body: { data: WORDS } });
  });

  it('useAutoComplete - preFetch, default filter', () => {
    // Default finder is using String.includes to match input to results
    mount(<DefaultComponent preFetch input="a" />);
    resultIs('Ok', 'tarjosi,kaakaon,maistoin,sanoin');
    // case-insensitive
    mount(<DefaultComponent preFetch input="KaAkaO" />);
    resultIs('Ok', 'kaakaon');
    mount(<DefaultComponent preFetch input="no-match-right?" />);
    resultIs('Ok', '');
  });

  it('useAutoComplete - preFetch, custom filter', () => {
    // Override default finder function
    mount(<DefaultComponent preFetch input="a" finder={(item) => item.value.includes('o')} />);
    resultIs('Ok', 'ufo,tarjosi,kaakaon,maistoin,sanoin,on');
    // Changing input should not matter since our custom finder does not use it
    mount(<DefaultComponent preFetch input="kaakao" finder={(item) => item.value.includes('o')} />);
    resultIs('Ok', 'ufo,tarjosi,kaakaon,maistoin,sanoin,on');
  });

  it('useAutoComplete - preFetch, custom payload', () => {
    // Override default result parsing function
    mount(
      <DefaultComponent url="objects" preFetch input="a" parser={(item) => ({ value: item.key, label: item.key })} />,
    );
    resultIs('Ok', 'tarjosi,kaakaon');
  });

  it('useAutoComplete - no preFetch', () => {
    // Don't use prefetch, backend should filter in this case
    mount(<DefaultComponent url="filtered" input="a" params={{ q: 'a' }} />);
    resultIs('Ok', 'tarjosi,kaakaon,maistoin,sanoin');
    mount(<DefaultComponent url="filtered" input="aa" params={{ q: 'aa' }} />);
    resultIs('Ok', 'kaakaon');
  });

  it('useAutoComplete - no preFetch, allow empty search', () => {
    // Request should not be sent if input is empty
    mount(<DefaultComponent url="filtered" input="" params={{ q: '' }} />);
    cy.get('[data-testid="status"]').contains('NotAsked');
    resultIs('NotAsked', '');
    // Adding searchEmpty param allows request without input
    mount(<DefaultComponent url="filtered" input="" params={{ q: '' }} searchEmpty />);
    resultIs('Ok', 'ufo,tarjosi,kaakaon,maistoin,sanoin,hyvää,on');
  });

  it('useAutoComplete - disabled', () => {
    // Is disabled, never requested
    mount(<DefaultComponent url="filtered" input="" params={{ q: '' }} enabled={false} searchEmpty />);
    resultIs('NotAsked', '');

    mount(<DefaultComponent url="filtered" input="kaa" params={{ q: 'kaa' }} enabled={false} searchEmpty />);
    resultIs('NotAsked', '');
  });
});

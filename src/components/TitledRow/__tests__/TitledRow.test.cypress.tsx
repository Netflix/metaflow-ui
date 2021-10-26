import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import TitledRow, { valueToRenderableType } from '..';

describe('TitledRow test', () => {
  it('renderValue', () => {
    // React node
    /* expect(valueToRenderableType(<h1>hello</h1>)).to.equal(<h1>hello</h1>);*/
    // boolean
    expect(valueToRenderableType(true)).to.equal('True');
    expect(valueToRenderableType(false)).to.equal('False');
    // number
    expect(valueToRenderableType(1)).to.equal(1);
    expect(valueToRenderableType(1.1231)).to.equal(1.1231);
    // string
    expect(valueToRenderableType('1')).to.equal('1');
    expect(valueToRenderableType('hello world')).to.equal('hello world');
    // stringified object
    expect(valueToRenderableType('{"a":"hello world"}')).to.deep.equal(<code>{'{\n  \"a\": \"hello world\"\n}'}</code>);
    expect(valueToRenderableType('{"a":"h","b":4,"c":{"a":"a"}}')).to.deep.equal(<code>{'{\n  \"a\": \"h\",\n  \"b\": 4,\n  \"c\": {\n    \"a\": \"a\"\n  }\n}'}</code>);
    // object
    expect(valueToRenderableType({ a: 'hello world' })).to.deep.equal(<code>{`{\n  "a": "hello world"\n}`}</code>);
    expect(valueToRenderableType({ a: 'h', b: 4, c: { a: 'a' } })).to.deep.equal(<code>{'{\n  \"a\": \"h\",\n  \"b\": 4,\n  \"c\": {\n    \"a\": \"a\"\n  }\n}'}</code>);
    // array
    expect(valueToRenderableType([1, 2, 3, 4])).to.deep.equal(<code>{'[1,2,3,4]'}</code>);
  });
  
  it('<TitledRow /> - default mode', () => {
    mount(
      <ThemeProvider theme={theme}>
        <TitledRow type="default" title="Hello" content={<h1>hello world</h1>} />
      </ThemeProvider>
    );
  
    cy.get('[data-testid="titled-row-title"]').contains('Hello');
    cy.get('[data-testid="titled-row-default-mode"]').contains('hello world');
  });
  
  it('<TitledRow /> - table mode', () => {
    mount(
      <ThemeProvider theme={theme}>
        <TitledRow type="table" title="Hello" content={{ 'react-node': <h1>hello world</h1>, booleanvalue: true }} />
      </ThemeProvider>
    );
    cy.get('[data-testid="titledrow-row-title"]').eq(0).contains('react-node');
    cy.get('[data-testid="titledrow-row-value"]').eq(0).contains('hello world');
    cy.get('[data-testid="titledrow-row-title"]').eq(1).contains('booleanvalue');
    cy.get('[data-testid="titledrow-row-value"]').eq(1).contains('True');
  });
});
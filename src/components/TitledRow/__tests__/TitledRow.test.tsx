import React from 'react';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
import TitledRow, { valueToRenderableType } from '..';

test('renderValue', () => {
  // React node
  expect(valueToRenderableType(<h1>hello</h1>)).toEqual(<h1>hello</h1>);
  // boolean
  expect(valueToRenderableType(true)).toBe('True');
  expect(valueToRenderableType(false)).toBe('False');
  // number
  expect(valueToRenderableType(1)).toBe(1);
  expect(valueToRenderableType(1.1231)).toBe(1.1231);
  // string
  expect(valueToRenderableType('1')).toBe('1');
  expect(valueToRenderableType('hello world')).toBe('hello world');
  // stringified object
  expect(valueToRenderableType('{"a":"hello world"}')).toEqual(
    <code>{`{
  "a": "hello world"
}`}</code>,
  );
  expect(valueToRenderableType('{"a":"h","b":4,"c":{"a":"a"}}')).toEqual(
    <code>{`{\n  "a": "h",\n  "b": 4,\n  "c": {\n    "a": "a"\n  }\n}`}</code>,
  );
  // object
  expect(valueToRenderableType({ a: 'hello world' })).toEqual(<code>{`{\n  "a": "hello world"\n}`}</code>);
  expect(valueToRenderableType({ a: 'h', b: 4, c: { a: 'a' } })).toEqual(
    <code>{'{\n  "a": "h",\n  "b": 4,\n  "c": {\n    "a": "a"\n  }\n}'}</code>,
  );
  // array
  expect(valueToRenderableType([1, 2, 3, 4])).toEqual(<code>{'[\n  1,\n  2,\n  3,\n  4\n]'}</code>);
});

test('<TitledRow /> - default mode', () => {
  const { getByTestId } = render(
    <TestWrapper>
      <TitledRow type="default" title="Hello" content={<h1>hello world</h1>} />
    </TestWrapper>,
  );

  expect(getByTestId('titled-row-title').textContent).toBe('Hello');
  expect(getByTestId('titled-row-default-mode').textContent).toBe('hello world');
});

test('<TitledRow /> - table mode', () => {
  const { getAllByTestId } = render(
    <TestWrapper>
      <TitledRow type="table" title="Hello" content={{ 'react-node': <h1>hello world</h1>, booleanvalue: true }} />
    </TestWrapper>,
  );
  expect(getAllByTestId('titledrow-row-title')[0].textContent).toBe('react-node');
  expect(getAllByTestId('titledrow-row-value')[0].textContent).toBe('hello world');
  expect(getAllByTestId('titledrow-row-title')[1].textContent).toBe('booleanvalue');
  expect(getAllByTestId('titledrow-row-value')[1].textContent).toBe('True');
});

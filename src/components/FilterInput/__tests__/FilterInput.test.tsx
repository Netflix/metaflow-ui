import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import FilterInput from '..';
import TestWrapper from '../../../utils/testing';

test('<FilterInput /> - IO events', () => {
  const onSubmit = jest.fn();

  const { getByTestId } = render(
    <TestWrapper>
      <FilterInput onSubmit={onSubmit} sectionLabel="Hello" />
    </TestWrapper>,
  );

  const input = getByTestId('filter-input-field');
  expect(input).toBeInTheDocument();
  // Trigger with Enter
  fireEvent.change(input, { target: { value: 'testing' } });
  fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
  expect(onSubmit).toHaveBeenLastCalledWith('testing');
  // Trigger with button click
  fireEvent.change(input, { target: { value: 'testing, click' } });
  fireEvent.mouseDown(getByTestId('filter-input-submit-button'));
  expect(onSubmit).toHaveBeenLastCalledWith('testing, click');
});

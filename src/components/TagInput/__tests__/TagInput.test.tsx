import React from 'react';
import TagInput from '..';
import { render, fireEvent } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('TagInput component', () => {
  test('<TagInput /> - health check', () => {
    render(
      <TestWrapper>
        <TagInput onSubmit={() => null}>Yo!</TagInput>
      </TestWrapper>,
    );
  });

  test('<TagInput /> - input test', () => {
    const fn = jest.fn();
    const { getByTestId, rerender } = render(
      <TestWrapper>
        <TagInput onSubmit={fn}>Yo!</TagInput>
      </TestWrapper>,
    );

    const openButton = getByTestId('tag-input-activate-button');
    const inputField = getByTestId('tag-input-textarea').querySelector('input');
    const addButton = getByTestId('tag-input-add-button');

    expect(inputField).not.toBeVisible();
    fireEvent.click(openButton);
    expect(inputField).toBeVisible();

    if (!inputField) {
      throw Error('Input field was not found. Maybe Popup failed to open');
    }

    //
    // Add with Enter
    //
    fireEvent.change(inputField, { target: { value: 'test' } });
    fireEvent.keyPress(inputField, {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      charCode: 13,
    });
    expect(fn).toBeCalledWith('test');
    expect(inputField).not.toBeVisible();

    //
    // Add with button
    //
    fireEvent.click(openButton);
    fireEvent.change(inputField, { target: { value: 'Yep!' } });
    fireEvent.click(addButton);
    expect(fn).toBeCalledWith('Yep!');
    expect(inputField).not.toBeVisible();
  });
});

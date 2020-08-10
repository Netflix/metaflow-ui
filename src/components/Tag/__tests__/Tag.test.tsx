import React from 'react';
import Tag, { RemovableTag } from '..';
import { render, fireEvent } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('Tag component', () => {
  test('<Tag /> - health check', () => {
    render(
      <TestWrapper>
        <Tag>Yo!</Tag>
      </TestWrapper>,
    );
  });

  test('<RemovableTag /> - health check', () => {
    const fn = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <RemovableTag onClick={fn}>Hoy!</RemovableTag>
      </TestWrapper>,
    );

    fireEvent.click(getByText('Hoy!'));
    expect(fn).toBeCalledTimes(1);
  });
});

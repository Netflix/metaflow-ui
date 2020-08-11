import React from 'react';
import Button from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('Button component', () => {
  test('<Button /> - health check', () => {
    render(
      <TestWrapper>
        <Button onClick={jest.fn()}>test</Button>
      </TestWrapper>,
    );
  });

  test('<Button /> - Basic features', () => {
    const myFn = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <Button onClick={myFn} active={true} className="my-custom-class">
          test
        </Button>
      </TestWrapper>,
    );

    expect(getByText('test')).toHaveClass('active', 'my-custom-class');
  });
});

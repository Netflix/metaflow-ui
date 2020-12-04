import React from 'react';
import AttemptSelector from '../components/AttemptSelector';
import { fireEvent, render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
import { createTask } from '../../../utils/testhelper';

describe('AttemptSelector component', () => {
  test('<AttemptSelector /> - without tasks', () => {
    expect(
      render(
        <TestWrapper>
          <AttemptSelector tasks={null} currentAttempt={0} onSelect={jest.fn()} />
        </TestWrapper>,
      ).container.innerHTML,
    ).toEqual('');
  });

  test('<AttemptSelector /> - with tasks', () => {
    const fn = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <AttemptSelector
          tasks={[createTask({ attempt_id: 0 }), createTask({ attempt_id: 1 })]}
          currentAttempt={0}
          onSelect={fn}
        />
      </TestWrapper>,
    );
    expect(getByTestId('attempt-tab-0')).toHaveTextContent('1');
    expect(getByTestId('attempt-tab-1')).toHaveTextContent('2');

    fireEvent.click(getByTestId('attempt-tab-1'));
    expect(fn).toHaveBeenCalledWith('1');
  });
});

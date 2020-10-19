import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import DAGControlBar from '../components/DAGControlBar';
import TestWrapper from '../../../utils/testing';

describe('DAGControlBar component', () => {
  test('<DAGControlBar /> - Works', () => {
    const fn = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <DAGControlBar setFullscreen={fn} t={(str: string) => str} />
      </TestWrapper>,
    );
    fireEvent.click(getByTestId('dag-control-fullscreen-button'));

    expect(fn).toHaveBeenCalledWith(true);
  });
});

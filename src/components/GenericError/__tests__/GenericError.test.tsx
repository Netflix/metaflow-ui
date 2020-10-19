import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import GenericError, { APIErrorDetails, APIErrorRenderer } from '..';
import TestWrapper from '../../../utils/testing';

const DEFAULT_ERROR = {
  id: 'generic-error',
  traceback: 'Doing stuff\nERROR!!',
  status: 500,
  title: 'Unknown error',
  detail: 'Absolute failure',
  type: 'error',
};

const NOTFOUND_ERROR = {
  id: 'not-found',
  traceback: undefined,
  status: 404,
  title: 'Resource not found',
  type: 'error',
};

describe('GenericError component', () => {
  test('<GenericError /> - renders', () => {
    const { getByText } = render(<GenericError message="STOP RIGHT THERE!" />);
    expect(getByText('STOP RIGHT THERE!')).toBeInTheDocument();
  });

  test('<GenericError /> - renders with custom icon', () => {
    const { getByTestId } = render(
      <GenericError
        message="STOP RIGHT THERE!"
        icon={<div data-testid="error-custom-icon">you have violated the law</div>}
      />,
    );
    expect(getByTestId('error-custom-icon')).toBeInTheDocument();
  });

  test('<APIErrorRenderer /> - renders', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <APIErrorRenderer error={DEFAULT_ERROR} />
      </TestWrapper>,
    );
    expect(getByTestId('generic-error')).toBeInTheDocument();
  });

  test('<APIErrorRenderer /> - renders with custom message', () => {
    const { getByText } = render(
      <TestWrapper>
        <APIErrorRenderer error={DEFAULT_ERROR} message="they are hacking the mainframe" />
      </TestWrapper>,
    );
    expect(getByText('they are hacking the mainframe')).toBeInTheDocument();
  });

  test('<APIErrorRenderer /> - renders APIErrorDetails', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <APIErrorRenderer error={DEFAULT_ERROR} />
      </TestWrapper>,
    );
    expect(getByTestId('error-details')).toBeInTheDocument();
  });

  test('<APIErrorRenderer /> - renders custom 404 component', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <APIErrorRenderer error={NOTFOUND_ERROR} customNotFound={<div data-testid="custom-404">HAHAA!</div>} />
      </TestWrapper>,
    );
    expect(getByTestId('custom-404')).toBeInTheDocument();
  });

  test('<APIErrorDetails /> - renders error details accordingly', () => {
    const { queryByTestId, getByTestId } = render(
      <TestWrapper>
        <APIErrorDetails error={DEFAULT_ERROR} t={(str: string) => str} />
      </TestWrapper>,
    );

    expect(queryByTestId('error-details-title')).toBeNull();

    fireEvent.click(getByTestId('error-details-seemore'));

    expect(getByTestId('error-details-title').textContent).toBe('500 - Unknown error (generic-error)');
    expect(getByTestId('error-details-subtitle').textContent).toBe('Absolute failure');
    expect(getByTestId('error-details-logs').textContent).toBe('Doing stuff\nERROR!!');

    fireEvent.click(getByTestId('error-details-close'));
    expect(queryByTestId('error-details-title')).toBeNull();
  });
});

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

  test('<APIErrorDetails /> - renders error details accordingly', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <APIErrorDetails error={DEFAULT_ERROR} noIcon={false} t={(str: string) => str} />
      </TestWrapper>,
    );

    fireEvent.click(getByTestId('collapsable-header'));
    expect(getByTestId('titled-row-row-status-0').lastChild?.textContent).toBe('500');
    expect(getByTestId('titled-row-row-detail-2').lastChild?.textContent).toBe('Absolute failure');
    expect(getByTestId('error-details-logs').textContent).toBe('Doing stuff\nERROR!!');
    fireEvent.click(getByTestId('collapsable-header'));
  });
});

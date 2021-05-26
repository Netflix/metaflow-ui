import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import HelpMenu from '..';
import TestWrapper from '../../../utils/testing';

describe('HelpMenu component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('<HelpMenu />', () => {
    const { getByTestId, getAllByTestId } = render(
      <TestWrapper>
        <HelpMenu />
      </TestWrapper>,
    );

    // Should not be visible
    expect(getByTestId('helpmenu-popup')).not.toBeVisible();

    // Open with button
    fireEvent.click(getByTestId('helpmenu-toggle'));
    expect(getByTestId('helpmenu-popup')).toBeVisible();

    // These tests are bit iffy. These links might change
    expect(getAllByTestId('helpmenu-link')[0]).toHaveAttribute('href', 'https://docs.metaflow.org/');
    expect(getAllByTestId('helpmenu-link')[0].textContent).toBe('Documentation');

    // Close by clicking overlay
    fireEvent.click(getByTestId('helpmenu-click-overlay'));
    expect(getByTestId('helpmenu-popup')).not.toBeVisible();

    fireEvent.click(getByTestId('helpmenu-toggle'));
    expect(getByTestId('helpmenu-popup')).toBeVisible();

    fireEvent.click(getByTestId('helpmenu-close'));
    expect(getByTestId('helpmenu-popup')).not.toBeVisible();
  });
});

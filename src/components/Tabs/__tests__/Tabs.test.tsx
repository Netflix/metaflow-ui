import React from 'react';
import Tabs, { TabDefinition } from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

describe('Tabs component', () => {
  test('<Tabs /> - health check', () => {
    render(
      <TestWrapper>
        <Tabs activeTab="" tabs={[]} />
      </TestWrapper>,
    );
  });

  test('<Tabs /> - Logic check', () => {
    const tabs: TabDefinition[] = [
      { key: 'fstTab', label: 'First', component: <div>First tab here</div> },
      { key: 'sndTab', label: 'Second', component: <div>Second tab here</div>, linkTo: 'link-to-somewhere' },
      { key: 'thTab', label: 'Third', component: <div>Third tab here</div> },
    ];

    const { getByTestId, getAllByTestId, rerender } = render(
      <TestWrapper>
        <Tabs activeTab="sndTab" tabs={tabs} />
      </TestWrapper>,
    );

    const buttons = getAllByTestId('tab-heading-item');
    expect(buttons.length).toBe(3);

    for (const index in buttons) {
      const button = buttons[index];
      expect(button.textContent).toBe(tabs[index].label);

      if (button.textContent == 'sndTab') {
        expect(button).toHaveAttribute('href', '/link-to-somewhere');
      }
    }

    expect(getByTestId('tab-active-content').textContent).toBe('Second tab here');

    rerender(
      <TestWrapper>
        <Tabs activeTab="fstTab" tabs={tabs} />
      </TestWrapper>,
    );
    expect(getByTestId('tab-active-content').textContent).toBe('First tab here');
  });
});

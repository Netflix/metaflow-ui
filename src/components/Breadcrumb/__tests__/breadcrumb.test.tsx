import React from 'react';
import Breadcrumb, { findAdditionalButtons } from '..';
import { render, fireEvent } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

const matchWithParams = (params: any) => ({
  isExact: true,
  path: '/',
  url: '/',
  params,
});

describe('Breadcrumb component', () => {
  const RUN_PARAMS = {
    flowId: 'HugeFlow',
    runNumber: '5',
  };

  test('findAdditionalButtons - empty states', () => {
    // Empty returns
    expect(findAdditionalButtons(null, '')).toEqual([]);
    expect(findAdditionalButtons(matchWithParams({}), '')).toEqual([]);
  });

  test('findAdditionalButtons - run', () => {
    expect(findAdditionalButtons(matchWithParams(RUN_PARAMS), '')).toEqual([
      {
        label: 'HugeFlow',
        path: '/?flow_id=HugeFlow',
      },
      {
        label: '5',
        path: '/HugeFlow/5/view/timeline',
      },
    ]);
  });

  const STEP_RESULT = [
    {
      label: 'HugeFlow',
      path: '/?flow_id=HugeFlow',
    },
    {
      label: '5',
      path: '/HugeFlow/5/view/timeline',
    },
    {
      label: 'start',
      path: '/HugeFlow/5/view/timeline?steps=start',
    },
  ];

  test('findAdditionalButtons - step by url params', () => {
    expect(
      findAdditionalButtons(
        matchWithParams({
          ...RUN_PARAMS,
          stepName: 'start',
        }),
        '',
      ),
    ).toEqual(STEP_RESULT);
  });

  test('findAdditionalButtons - step by query params', () => {
    expect(findAdditionalButtons(matchWithParams(RUN_PARAMS), '?steps=start')).toEqual(STEP_RESULT);
  });

  test('findAdditionalButtons - tasks', () => {
    expect(findAdditionalButtons(matchWithParams({ ...RUN_PARAMS, stepName: 'start', taskId: '14' }), '')).toEqual([
      ...STEP_RESULT,
      { label: '14', path: '/HugeFlow/5/start/14' },
    ]);
  });

  // Rendering
  test('<Breadcrumb /> - health check', () => {
    render(
      <TestWrapper>
        <Breadcrumb />
      </TestWrapper>,
    );
  });

  const makeBreadcrumb = (route?: string) => (
    <TestWrapper route={route}>
      <Breadcrumb />
    </TestWrapper>
  );

  // Conditional rendering
  test('<Breadcrumb /> - Should render home and empty field', () => {
    const { getByTestId } = render(makeBreadcrumb());

    getByTestId('home-button');
    getByTestId('breadcrumb-goto-input-inactive');
  });

  test('<Breadcrumb /> - Should render button container', () => {
    const { getByTestId, getByText } = render(makeBreadcrumb('/HugeFlow/4/views/timeline'));

    getByTestId('home-button');
    getByTestId('breadcrumb-button-container');
    getByText('HugeFlow');
    getByText('4');
  });

  test('<Breadcrumb /> - Should render home and after click input field', () => {
    const { getByTestId } = render(makeBreadcrumb());
    // Find breadcrumb input. We need to query the actual input element inside fields.
    const input = getByTestId('breadcrumb-goto-input-inactive').querySelector('input') as Element;
    fireEvent.click(input);
    // After click we should have goto container
    getByTestId('breadcrumb-goto-container');
  });
});

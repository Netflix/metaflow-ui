import React, { useState, useEffect } from 'react';

import { APIError, Run as IRun } from '../../../types';
import { useTranslation } from 'react-i18next';
import Spinner from '../../../components/Spinner';
import ResultGroup from '../ResultGroup';
import useIsInViewport from 'use-is-in-viewport';
import styled from 'styled-components';
import GenericError from '../../../components/GenericError';
import { ItemRow } from '../../../components/Structure';

const HomeContentArea: React.FC<{
  error: APIError | null;
  status: 'Ok' | 'Error' | 'Loading' | 'NotAsked';
  runGroups: Record<string, IRun[]>;
  params: Record<string, string>;
  handleOrderChange: (orderProps: string) => void;
  handleGroupTitleClick: (title: string) => void;
  loadMore: () => void;
  targetCount: number;
}> = ({ error, status, runGroups, handleOrderChange, handleGroupTitleClick, params, loadMore, targetCount }) => {
  const { t } = useTranslation();
  const resultAmount = Object.keys(runGroups).length;

  return (
    <Content>
      {resultAmount > 0 &&
        Object.keys(runGroups).map((k) => {
          return (
            <ResultGroup
              key={k}
              label={k && k !== 'undefined' ? k : 'Runs'}
              initialData={runGroups[k]}
              queryParams={params}
              onOrderChange={handleOrderChange}
              handleGroupTitleClick={handleGroupTitleClick}
              targetCount={targetCount}
              resourceUrl="/runs"
              hideLoadMore={k === 'undefined'}
            />
          );
        })}

      {status === 'Ok' && resultAmount === 0 && (
        <ItemRow margin="md">
          <GenericError icon="searchNotFound" message={t('error.no-results')} />
        </ItemRow>
      )}

      {status === 'Error' && error && (
        <ItemRow margin="md">
          <GenericError message={t('error.load-error')} />
        </ItemRow>
      )}

      <AutoLoadTrigger
        status={status}
        updateVisibility={() => {
          loadMore();
        }}
        resultAmount={resultAmount}
      />
    </Content>
  );
};

//
// Component which triggers update function when ever in viewport. Max once per 250ms
//

const AutoLoadTrigger: React.FC<{
  updateVisibility: () => void;
  status: 'NotAsked' | 'Loading' | 'Error' | 'Ok';
  resultAmount: number;
}> = ({ updateVisibility, status, resultAmount }) => {
  const [isInViewport, targetRef] = useIsInViewport();
  // Track active status so we don't ever spam requests
  const [isUpdatable, setIsUpdatable] = useState(false);

  // If component is in viewport, is ready from earlier request AND request is OK we can load more.
  useEffect(() => {
    if (isInViewport && isUpdatable && status === 'Ok') {
      updateVisibility();
      setIsUpdatable(false);
    }
  }, [isInViewport, updateVisibility, isUpdatable, status]);

  // Set updatable AFTER previous request was OK
  useEffect(() => {
    if (status === 'Ok' && !isUpdatable) {
      setTimeout(() => {
        setIsUpdatable(true);
      }, 250);
    }
  }, [status]); // eslint-disable-line

  // Let trigger be disabled for half a second on initial render
  useEffect(() => {
    setTimeout(() => {
      setIsUpdatable(true);
    }, 500);
  }, []);

  return (
    <>
      {status === 'Loading' && <Center>{resultAmount > 0 ? <Spinner sm /> : <Spinner md />}</Center>}
      <div ref={targetRef} />
    </>
  );
};

export default HomeContentArea;

const Content = styled.div`
  padding-left: ${(p) => p.theme.layout.sidebarWidth + 1}rem;
  padding-top: ${(p) => p.theme.spacer.md}rem;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Center = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

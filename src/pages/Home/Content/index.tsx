import React, { useState, useEffect } from 'react';

import { Run as IRun } from '../../../types';
import { useTranslation } from 'react-i18next';
import Notification, { NotificationType } from '../../../components/Notification';
import { Section } from '../../../components/Structure';
import Spinner from '../../../components/Spinner';
import ResultGroup from '../ResultGroup';
import useIsInViewport from 'use-is-in-viewport';
import styled from 'styled-components';

const HomeContentArea: React.FC<{
  error: Error | null;
  status: 'Ok' | 'Error' | 'Loading' | 'NotAsked';
  runGroups: Record<string, IRun[]>;
  params: Record<string, string>;
  handleOrderChange: (orderProps: string) => void;
  handleRunClick: (r: IRun) => void;
  loadMore: () => void;
}> = ({ error, status, runGroups, handleOrderChange, handleRunClick, params, loadMore }) => {
  const { t } = useTranslation();
  const resultAmount = Object.keys(runGroups).length;

  return (
    <Content>
      {error && <Notification type={NotificationType.Warning}>{error.message}</Notification>}

      {status === 'Ok' && resultAmount === 0 && <Section>{t('home.no-results')}</Section>}

      {resultAmount > 0 &&
        Object.keys(runGroups)
          .sort()
          .map((k) => {
            return (
              <ResultGroup
                key={k}
                label={k && k !== 'undefined' ? k : 'Runs'}
                initialData={runGroups[k]}
                queryParams={params}
                onOrderChange={handleOrderChange}
                onRunClick={handleRunClick}
                resourceUrl="/runs"
                hideLoadMore={k === 'undefined'}
              />
            );
          })}

      <AutoLoadTrigger
        status={status}
        updateVisibility={() => {
          loadMore();
        }}
      />
    </Content>
  );
};

const AutoLoadTrigger: React.FC<{
  updateVisibility: () => void;
  status: 'NotAsked' | 'Loading' | 'Error' | 'Ok';
}> = ({ updateVisibility, status }) => {
  const [isInViewport, targetRef] = useIsInViewport();
  const [isUpdatable, setIsUpdatable] = useState(false);

  useEffect(() => {
    if (isInViewport && isUpdatable && status === 'Ok') {
      updateVisibility();
      setIsUpdatable(false);
    }
  }, [isInViewport, updateVisibility, isUpdatable, status]);

  useEffect(() => {
    if (status === 'Ok' && !isUpdatable) {
      setTimeout(() => {
        setIsUpdatable(true);
      }, 250);
    }
  }, [status]); // eslint-disable-line

  useEffect(() => {
    setTimeout(() => {
      setIsUpdatable(true);
    }, 500);
  }, []);

  return (
    <LoadTriggerContainer ref={targetRef}>
      {status === 'Loading' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
          <span style={{ marginLeft: '0.5rem' }}>Loading Items</span>
        </div>
      )}
    </LoadTriggerContainer>
  );
};

export default HomeContentArea;

const Content = styled.div`
  margin-left: ${(p) => p.theme.layout.sidebarWidth + 1}rem;
  padding-top: ${(p) => p.theme.spacer.md}rem;

  h3:first-of-type {
    margin-top: 0;
  }
`;

const LoadTriggerContainer = styled.div`
  padding: 1rem;
  text-align: center;
  min-height: 55px;
`;

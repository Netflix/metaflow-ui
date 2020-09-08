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
}> = ({ error, status, runGroups, handleOrderChange, handleRunClick, params }) => {
  const [visibleAmount, setVisibleAmount] = useState(5);
  const { t } = useTranslation();
  const resultAmount = Object.keys(runGroups).length;

  useEffect(() => {
    setVisibleAmount(5);
  }, [params._group, params.status, params.flow_id, params._tags]);

  return (
    <Content>
      {error && <Notification type={NotificationType.Warning}>{error.message}</Notification>}
      {status === 'Loading' && (
        <Section style={{ position: 'absolute', left: '50%', background: '#fff' }}>
          <Spinner />
        </Section>
      )}

      {status === 'Ok' && resultAmount === 0 && <Section>{t('home.no-results')}</Section>}

      {resultAmount > 0 &&
        Object.keys(runGroups)
          .sort()
          .slice(0, visibleAmount)
          .map((k) => {
            return (
              <ResultGroup
                key={k}
                field={params._group ? params._group : 'flow_id'}
                fieldValue={k}
                initialData={runGroups[k]}
                queryParams={params}
                onOrderChange={handleOrderChange}
                onRunClick={handleRunClick}
                resourceUrl="/runs"
              />
            );
          })}
      <AutoLoadTrigger
        updateVisibility={() => {
          if (totalLengthOfRuns(runGroups) > visibleAmount) {
            setVisibleAmount(visibleAmount + 5);
          }
        }}
      />
    </Content>
  );
};

function totalLengthOfRuns(grouppedRuns: Record<string, IRun[]>) {
  return Object.keys(grouppedRuns).reduce((amount, key) => {
    return amount + grouppedRuns[key].length;
  }, 0);
}

const AutoLoadTrigger: React.FC<{ updateVisibility: () => void }> = ({ updateVisibility }) => {
  const [isInViewport, targetRef] = useIsInViewport();
  const [isUpdatable, setIsUpdatable] = useState(false);

  useEffect(() => {
    if (isInViewport && isUpdatable) {
      updateVisibility();
      setIsUpdatable(false);

      setTimeout(() => {
        setIsUpdatable(true);
      }, 250);
    }
  }, [isInViewport, updateVisibility, isUpdatable]);

  useEffect(() => {
    setTimeout(() => {
      setIsUpdatable(true);
    }, 500);
  }, []);

  return <div ref={targetRef} />;
};

const MemoContentArea = React.memo<{
  error: Error | null;
  status: 'Ok' | 'Error' | 'Loading' | 'NotAsked';
  runGroups: Record<string, IRun[]>;
  params: Record<string, string>;
  handleOrderChange: (orderProps: string) => void;
  handleRunClick: (r: IRun) => void;
}>((props) => {
  return <HomeContentArea {...props} />;
});

export default MemoContentArea;

const Content = styled.div`
  margin-left: ${(p) => p.theme.layout.sidebarWidth + 1}rem;
  padding-top: ${(p) => p.theme.spacer.md}rem;

  h3:first-of-type {
    margin-top: 0;
  }
`;

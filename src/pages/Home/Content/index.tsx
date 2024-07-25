import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { APIError, AsyncStatus, Run as IRun } from '../../../types';

import ResultGroup from '../ResultGroup';
import GenericError, { APIErrorRenderer } from '../../../components/GenericError';
import { ItemRow } from '../../../components/Structure';
import AutoLoadTrigger from './AutoLoadTrigger';
import Spinner from '../../../components/Spinner';

type Props = {
  error: APIError | null;
  status: AsyncStatus;
  showLoader: boolean;
  runGroups: Record<string, IRun[]>;
  params: Record<string, string>;
  handleOrderChange: (orderProps: string) => void;
  handleGroupTitleClick: (title: string) => void;
  updateListValue: (key: string, value: string) => void;
  loadMore: () => void;
  targetCount: number;
  grouping: boolean;
};

const HomeContentArea: React.FC<Props> = ({
  error,
  status,
  showLoader,
  runGroups,
  handleOrderChange,
  handleGroupTitleClick,
  updateListValue,
  params,
  loadMore,
  targetCount,
  grouping,
}) => {
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
              updateListValue={updateListValue}
              targetCount={targetCount}
              grouping={grouping}
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
      {/* TODO */}
      <BigLoader visible={showLoader && resultAmount > 0}>
        <Spinner md />
      </BigLoader>

      {status === 'Error' && resultAmount === 0 && (
        <ContentErrorContainer>
          <APIErrorRenderer error={error} message={t('error.load-error') ?? ''} />
        </ContentErrorContainer>
      )}

      <AutoLoadTrigger
        status={showLoader ? 'Loading' : status}
        loadMore={() => {
          loadMore();
        }}
        resultAmount={resultAmount}
      />
    </Content>
  );
};

export default HomeContentArea;

const Content = styled.div`
  position: relative;
  margin-left: ${(p) => p.theme.layout.sidebarWidth.md + 1}rem;
  @media (max-width: ${(p) => p.theme.breakpoint.sm}) {
    margin-left: ${(p) => p.theme.layout.sidebarWidth.sm + 1}rem;
  }
  max-width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const BigLoader = styled.div<{ visible: boolean }>`
  position: absolute;
  pointer-events: none;
  display: flex;
  justify-content: center;
  padding: 2rem;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  top: 0;
  left: 0;
  z-index: 999;
  opacity: ${(p) => (p.visible ? '1' : '0')};
  transition: 0.5s opacity;
`;

const ContentErrorContainer = styled.div`
  padding: 3rem 0;
`;

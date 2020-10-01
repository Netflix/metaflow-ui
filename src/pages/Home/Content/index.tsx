import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { APIError, AsyncStatus, Run as IRun } from '../../../types';

import ResultGroup from '../ResultGroup';
import GenericError from '../../../components/GenericError';
import { ItemRow } from '../../../components/Structure';
import AutoLoadTrigger from './AutoLoadTrigger';

type Props = {
  error: APIError | null;
  status: AsyncStatus;
  runGroups: Record<string, IRun[]>;
  params: Record<string, string>;
  handleOrderChange: (orderProps: string) => void;
  handleGroupTitleClick: (title: string) => void;
  loadMore: () => void;
  targetCount: number;
};

const HomeContentArea: React.FC<Props> = ({
  error,
  status,
  runGroups,
  handleOrderChange,
  handleGroupTitleClick,
  params,
  loadMore,
  targetCount,
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

export default HomeContentArea;

const Content = styled.div`
  padding-left: ${(p) => p.theme.layout.sidebarWidth + 1}rem;
  padding-top: ${(p) => p.theme.spacer.md}rem;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

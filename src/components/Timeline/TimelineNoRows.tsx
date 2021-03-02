import React from 'react';
import { useTranslation } from 'react-i18next';
import { AsyncStatus } from '../../types';
import GenericError from '../GenericError';
import SmoothSpinner from '../Spinner';
import { ItemRow } from '../Structure';
import { RowCounts } from './taskdataUtils';

type TimelineNoRowsProps = { counts: RowCounts; searchStatus: AsyncStatus; tasksStatus: AsyncStatus };

const TimelineNoRows: React.FC<TimelineNoRowsProps> = ({ counts, searchStatus, tasksStatus }) => {
  const { t } = useTranslation();

  const errorProps =
    searchStatus === 'NotAsked'
      ? { message: t('timeline.no-rows'), icon: 'listNotFound' as const }
      : { message: t('search.no-results'), icon: 'searchNotFound' as const };

  return (
    <>
      {tasksStatus !== 'NotAsked' && tasksStatus !== 'Loading' && searchStatus !== 'Loading' && (
        <ItemRow justify="center" margin="lg">
          <div>
            <GenericError {...errorProps} />
            {counts.all > 0 && <ItemRow margin="md">{`${counts.all} ${t('timeline.hidden-by-settings')}`}</ItemRow>}
          </div>
        </ItemRow>
      )}

      {(tasksStatus === 'Loading' || searchStatus === 'Loading') && (
        <ItemRow justify="center" margin="lg">
          <SmoothSpinner md />
        </ItemRow>
      )}
    </>
  );
};

export default TimelineNoRows;

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import StatusField from '../../../components/Status';
import { TD } from '../../../components/Table';
import { ForceNoBreakText } from '../../../components/Text';
import { Run } from '../../../types';
import { getRunEndTime, getRunId, getRunStartTime, getUsername } from '../../../utils/run';
import ResultGroupDuration from './ResultGroupDuration';
import { StatusColorCell } from './ResultGroupStatus';
import ResultGroupTags from './ResultGroupTags';

//
// Typedef
//

type ResultGroupCellsProps = {
  r: Run;
  params: Record<string, string>;
  link: string;
  updateListValue: (key: string, value: string) => void;
  timezone: string;
};

//
// Component
//

const ResultGroupCells: React.FC<ResultGroupCellsProps> = React.memo(
  ({ r, params, updateListValue, link, timezone }) => {
    return (
      <>
        {/* STATUS INDICATOR */}
        <StatusColorCell status={r.status} />
        {/* FLOW ID */}
        {params._group !== 'flow_id' && <TDWithLink link={link}>{r.flow_id}</TDWithLink>}
        {/* ID */}
        <TDWithLink link={link}>
          <IDFieldContainer>{getRunId(r)}</IDFieldContainer>
        </TDWithLink>
        {/* USER NAME */}
        {params._group !== 'user' && <TDWithLink link={link}>{getUsername(r)}</TDWithLink>}
        {/* STARTED AT */}
        <TimeCell link={link}>{getRunStartTime(r, timezone)}</TimeCell>
        {/* FINISHED AT */}
        <TimeCell link={link}>{getRunEndTime(r, timezone)}</TimeCell>
        {/* DURATION */}
        <TimeCell link={link}>
          <ResultGroupDuration run={r} />
        </TimeCell>
        {/* STATUS */}
        <TDWithLink link={link}>
          <ForceNoBreakText>
            <StatusField status={r.status} />
          </ForceNoBreakText>
        </TDWithLink>
        {/* USER TAGS */}
        {(r.tags || []).length > 0 ? (
          <ResultGroupTags tags={r.tags || []} updateListValue={updateListValue} />
        ) : (
          <TDWithLink link={link}></TDWithLink>
        )}
      </>
    );
  },
  (previous, next) => {
    return (
      previous.link === next.link &&
      previous.timezone === next.timezone &&
      previous.r.status === next.r.status &&
      previous.r.finished_at === next.r.finished_at
    );
  },
);

//
// Cells
//

const TDWithLink: React.FC<{ link: string }> = ({ children, link }) => {
  return (
    <LinkTD>
      {children}
      <GhostLink to={link}></GhostLink>
    </LinkTD>
  );
};

const LinkTD = styled(TD)`
  position: relative;
`;

const GhostLink = styled(Link)`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
`;

const TimeCell = styled(TDWithLink)`
  word-break: break-word;
`;

const IDFieldContainer = styled.div`
  min-height: 24px;
  display: flex;
  align-items: center;
`;

export default ResultGroupCells;
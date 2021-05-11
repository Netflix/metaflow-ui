import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import AutoUpdating from '../../../components/AutoUpdating';
import { TD } from '../../../components/Table';
import { Run } from '../../../types';
import {
  getRunDuration,
  getRunEndTime,
  getRunId,
  getRunStartTime,
  getTagOfType,
  getUsername,
} from '../../../utils/run';
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
  infoOpen?: boolean;
};

//
// Component
//

const ResultGroupCells: React.FC<ResultGroupCellsProps> = React.memo(
  ({ r, params, updateListValue, link, timezone, infoOpen }) => {
    return (
      <>
        {/* STATUS INDICATOR */}
        <StatusColorCell status={r.status} title={r.status} hideBorderBottom={infoOpen} />
        {/* FLOW ID */}
        {params._group !== 'flow_id' && (
          <TDWithLink link={link}>
            <ProjectText>{projectString(r)}</ProjectText>
            <div>{r.flow_id}</div>
          </TDWithLink>
        )}
        {params._group === 'flow_id' && <TDWithLink link={link}>{projectString(r)}</TDWithLink>}
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
          <AutoUpdating enabled={r.status === 'running'} content={() => getRunDuration(r)} />
        </TimeCell>
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
      previous.r.finished_at === next.r.finished_at &&
      previous.infoOpen === next.infoOpen
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

function projectString(run: Run) {
  const project = getTagOfType(run.system_tags || [], 'project');
  const projectBranch = getTagOfType(run.system_tags || [], 'project_branch');

  return project ? `${project}${project && projectBranch ? '/' : ''}${projectBranch || ''}` : '';
}

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

const ProjectText = styled.div`
  font-size: 0.625rem;
`;

export default ResultGroupCells;

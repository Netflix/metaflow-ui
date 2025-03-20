import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Run } from '@/types';
import DateTimeCell from '@pages/Home/ResultGroup/Cells/DateTimeCell';
import ExpandToggle, { ExpandToggleProps } from '@pages/Home/ResultGroup/Cells/ExpandToggle';
import ResultGroupTags from '@pages/Home/ResultGroup/Cells/TagCell';
import TriggeredByCell from '@pages/Home/ResultGroup/Cells/TriggeredByCell';
import AutoUpdating from '@components/AutoUpdating';
import StatusIndicator from '@components/StatusIndicator';
import { TD } from '@components/Table';
import { getRunDuration, getRunId, getTagOfType } from '@utils/run';

//
// Typedef
//

type ResultGroupCellsProps = {
  r: Run;
  params: Record<string, string>;
  link: string;
  updateListValue: (key: string, value: string) => void;
  expand: ExpandToggleProps;
};

//
// Component
//

const ResultGroupCells: React.FC<ResultGroupCellsProps> = React.memo(
  ({ r, params, updateListValue, link, expand }) => {
    return (
      <>
        {/* ID */}
        <TDWithLink link={link}>
          <ExpandToggle {...expand} />
          <FlexCell>
            <StatusIndicator status={r.status} />
            {getRunId(r)}
          </FlexCell>
        </TDWithLink>
        {/* FLOW ID */}
        {params._group !== 'flow_id' && (
          <TDWithLink link={link}>
            <div>{r.flow_id}</div>
          </TDWithLink>
        )}
        {/* PROJECT */}
        <TDWithLink link={link}>{projectString(r)}</TDWithLink>
        {/* STARTED AT */}
        <DateTimeCell date={new Date(r.ts_epoch)} link={link} />
        {/* DURATION */}
        <TDWithLink link={link}>
          <WordBreak>
            <AutoUpdating enabled={r.status === 'running'} content={() => getRunDuration(r, 'short')} />
          </WordBreak>
        </TDWithLink>
        {/* FINISHED AT */}
        <DateTimeCell date={r.finished_at ? new Date(r.finished_at) : null} link={link} />
        {/* TRIGGERED BY */}
        <TriggeredByCell link={link} run={r} />
        {/* USER TAGS */}
        {(r.tags || []).length > 0 ? (
          <ResultGroupTags id={r.run_number.toString()} tags={r.tags || []} updateListValue={updateListValue} />
        ) : (
          <TDWithLink link={link}></TDWithLink>
        )}
      </>
    );
  },
  (previous, next) => {
    return (
      previous.link === next.link &&
      previous.r.status === next.r.status &&
      previous.r.finished_at === next.r.finished_at &&
      previous.expand.active === next.expand.active &&
      previous.expand.visible === next.expand.visible &&
      previous.r.tags === next.r.tags
    );
  },
);

//
// Cells
//

export const TDWithLink: React.FC<{ children?: ReactNode; link?: string }> = ({ children, link }) => {
  return (
    <LinkTD>
      {children}
      {link ? <GhostLink to={link}></GhostLink> : null}
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

const WordBreak = styled.div`
  word-break: break-word;
  text-align: right;
`;

const FlexCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export default ResultGroupCells;

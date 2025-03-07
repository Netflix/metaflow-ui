import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Section } from '@components/Structure';
import { TR } from '@components/Table';
import VerticalToggle from '@components/VerticalToggle';
import { Run } from '@/types';
import { getPath } from '@utils/routing';
import { getRunId } from '@utils/run';
import HeightAnimatedContainer from '@components/HeightAnimatedContainer';
import { TableColDefinition } from '@pages/Home/ResultGroup';
import TimelinePreview from '@pages/Home/ResultGroup/TimelinePreview';
import ResultGroupCells from '@pages/Home/ResultGroup/ResultGroupCells';
import ParametersPreview from '@pages/Home/ResultGroup/ParametersPreview';

//
// Typedef
//

type Props = {
  isStale: boolean;
  queryParams: Record<string, string>;
  updateListValue: (key: string, value: string) => void;
  run: Run;
  timezone: string;
  cols: TableColDefinition[];
};

enum RowState {
  Closed,
  Opening,
  Open,
  Closing,
}

//
// Row component that will lock it's state when hovered or set active
//
const ResultGroupRow: React.FC<Props> = ({ isStale, queryParams, updateListValue, run, timezone, cols }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [rowState, setRowState] = useState<RowState>(RowState.Closed);
  const visible = isVisible(rowState);

  // Update state after 250 of closing or opening
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    if (isTransitioning(rowState)) {
      t1 = setTimeout(() => {
        setRowState((rs) => (rs === RowState.Opening ? RowState.Open : rs === RowState.Closing ? RowState.Closed : rs));
      }, 250);
    }
    return () => {
      clearTimeout(t1);
    };
  }, [rowState]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleToggleClick = () => {
    if (rowState === RowState.Opening || rowState === RowState.Open) {
      setRowState(RowState.Closing);
    } else {
      setRowState(RowState.Opening);
    }
  };

  return (
    <>
      <StyledTR
        data-testid="result-group-row"
        data-flow_id={run.flow_id}
        data-run_id={getRunId(run)}
        data-status={run.status}
        data-user={run.user}
        data-tags={(run.tags || []).join(' ')}
        clickable
        stale={isStale}
        active={visible}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ResultGroupCells
          r={run}
          params={queryParams}
          updateListValue={updateListValue}
          link={getPath.run(run.flow_id, getRunId(run))}
          timezone={timezone}
          infoOpen={visible}
        />
        <ExpandCell>
          <VerticalToggle
            visible={visible || isHovering}
            active={rowState === RowState.Opening || rowState === RowState.Open}
            onClick={handleToggleClick}
          />
        </ExpandCell>
      </StyledTR>
      {visible && (
        <tr>
          <StyledTD colSpan={cols.length}>
            <HeightAnimatedContainer active={isTransitioning(rowState)}>
              <StyledSection closing={rowState === RowState.Closing}>
                <TimelinePreview run={run} />
                <ParametersPreview run={run} />
              </StyledSection>
            </HeightAnimatedContainer>
          </StyledTD>
          <td></td>
        </tr>
      )}
    </>
  );
};

//
// Utils
//

function isVisible(rs: RowState) {
  return rs !== RowState.Closed;
}

function isTransitioning(rs: RowState) {
  return rs === RowState.Closing || rs === RowState.Opening;
}

//
// Styles
//

const StyledTR = styled(TR)`
  height: 3.5rem;
`;

// Need to align expand area by one pixel so that border is on correct position
const StyledTD = styled.td`
  padding-right: 1px;
  padding-bottom: 1px;
  position: relative;
  overflow: hidden;
`;

const StyledSection = styled(Section)<{ closing: boolean }>`
  padding: var(--result-group-expand-padding);
  margin-bottom 0;
  border-right: var(--border-thin-1);
  border-bottom: var(--border-thin-1);
  ${(p) => p.closing && 'position: absolute;'}
  width: 100%;
`;

const ExpandCell = styled.td`
  border-top: var(--result-group-expand-cell-border-top);
  border-right: var(--result-group-expand-cell-border-right);
  border-bottom: var(--result-group-expand-cell-border-bottom);
  border-left: var(--result-group-expand-cell-border-left);
`;

export default ResultGroupRow;

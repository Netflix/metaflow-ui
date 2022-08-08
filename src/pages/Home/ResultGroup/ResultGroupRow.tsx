import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Section } from '../../../components/Structure';
import { TR } from '../../../components/Table';
import VerticalToggle from '../../../components/VerticalToggle';
import { Run } from '../../../types';
import { getPath } from '../../../utils/routing';
import { getRunId } from '../../../utils/run';
import TimelinePreview from './TimelinePreview';
import ResultGroupCells from './ResultGroupCells';
import { StatusColorCell } from './ResultGroupStatus';
import { TableColDefinition } from './';
import HeightAnimatedContainer from '../../../components/HeightAnimatedContainer';
import ParametersPreview from './ParametersPreview';

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
        setRowState((rs) => (rs === RowState.Opening ? RowState.Open : RowState.Closing ? RowState.Closed : rs));
      }, 250);
    }
    return () => {
      clearTimeout(t1);
    };
  }, [rowState]);

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
        onMouseEnter={() => {
          setIsHovering(true);
        }}
        onMouseLeave={() => {
          setIsHovering(false);
        }}
      >
        <ResultGroupCells
          r={run}
          params={queryParams}
          updateListValue={updateListValue}
          link={getPath.run(run.flow_id, getRunId(run))}
          timezone={timezone}
          infoOpen={visible}
        />
        <td>
          <VerticalToggle
            visible={visible || isHovering}
            active={rowState === RowState.Opening || rowState === RowState.Open}
            onClick={() => {
              if (rowState === RowState.Opening || rowState === RowState.Open) {
                setRowState(RowState.Closing);
              } else {
                setRowState(RowState.Opening);
              }
            }}
          />
        </td>
      </StyledTR>
      {visible && (
        <tr>
          <StatusColorCell status={run.status} title={run.status} hideBorderTop={true} />
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

const StyledTR = styled(TR)``;

// Need to align expand area by one pixel so that border is on correct position
const StyledTD = styled.td`
  padding-right: 1px;
  padding-bottom: 1px;
  position: relative;
  overflow: hidden;
`;

const StyledSection = styled(Section)<{ closing: boolean }>`
  padding: 0.5rem 0.5rem 0;
  margin-bottom 0;
  border-right: ${(p) => p.theme.border.thinLight};
  border-bottom: ${(p) => p.theme.border.thinLight};
  ${(p) => p.closing && 'position: absolute;'}
  width: 100%;
`;

export default ResultGroupRow;

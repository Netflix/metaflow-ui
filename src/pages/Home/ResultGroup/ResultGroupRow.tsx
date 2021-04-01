import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Section } from '../../../components/Structure';
import { TR } from '../../../components/Table';
import VerticalToggle from '../../../components/VerticalToggle';
import { Run } from '../../../types';
import { getPath } from '../../../utils/routing';
import { getRunId } from '../../../utils/run';
import RunParameterTable from '../../Run/RunParameterTable';
import TimelinePreview from './TimelinePreview';
import ResultGroupCells from './ResultGroupCells';
import { StatusColorCell } from './ResultGroupStatus';
import { TableColDefinition } from './';
import HeightAnimatedContainer from '../../../components/HeightAnimatedContainer';

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
  const [runToRender, setRunToRender] = useState(run);
  const [isHovering, setIsHovering] = useState(false);
  const [rowState, setRowState] = useState<RowState>(RowState.Closed);

  useEffect(() => {
    if (!isHovering && !isVisible(rowState)) {
      setRunToRender(run);
    }
  }, [isHovering, isVisible(rowState)]); // eslint-disable-line

  useEffect(() => {
    if ((!isHovering && !isVisible(rowState)) || run.run_number === runToRender.run_number) {
      setRunToRender(run);
    }
  }, [run]); // eslint-disable-line

  // Update state after 250 of closing or opening
  useEffect(() => {
    let t1: number | undefined = undefined;
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
        clickable
        stale={isStale}
        active={isVisible(rowState)}
        onMouseOver={() => {
          setIsHovering(true);
        }}
        onMouseLeave={() => {
          setIsHovering(false);
        }}
      >
        <ResultGroupCells
          r={runToRender}
          params={queryParams}
          updateListValue={updateListValue}
          link={getPath.run(runToRender.flow_id, getRunId(runToRender))}
          timezone={timezone}
          infoOpen={isVisible(rowState)}
        />
        <td>
          <VerticalToggle
            visible={isVisible(rowState) || isHovering}
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
      {isVisible(rowState) && (
        <tr>
          <StatusColorCell status={runToRender.status} title={runToRender.status} hideBorderTop={true} />
          <StyledTD colSpan={cols.length}>
            <HeightAnimatedContainer active={isTransitioning(rowState)}>
              <StyledSection closing={rowState === RowState.Closing}>
                <RunParameterTable run={runToRender} initialState={false} />
                <TimelinePreview flowid={runToRender.flow_id} runid={getRunId(runToRender)} />
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

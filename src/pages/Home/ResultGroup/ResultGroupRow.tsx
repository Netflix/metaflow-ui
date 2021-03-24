import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Section } from '../../../components/Structure';
import { TR } from '../../../components/Table';
import VerticalToggle from '../../../components/VerticalToggle';
import { Run } from '../../../types';
import { getPath } from '../../../utils/routing';
import { getRunId } from '../../../utils/run';
import RunParameterTable from '../../Run/RunParameterTable';
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

//
// Row component that will lock it's state when hovered or set active
//
const ResultGroupRow: React.FC<Props> = ({ isStale, queryParams, updateListValue, run, timezone, cols }) => {
  const [runToRender, setRunToRender] = useState(run);
  const [isHovering, setIsHovering] = useState(false);
  // Show extra information bar
  const [showInfo, setShowInfo] = useState(false);
  // Track closing state since we need to animate row away
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isHovering && !showInfo) {
      setRunToRender(run);
    }
  }, [isHovering, showInfo]); // eslint-disable-line

  useEffect(() => {
    if ((!isHovering && !showInfo) || run.run_number === runToRender.run_number) {
      setRunToRender(run);
    }
  }, [run]); // eslint-disable-line

  // Remove row from dom after 250ms
  useEffect(() => {
    let t: number | undefined = undefined;
    if (closing) {
      t = setTimeout(() => {
        setClosing(false);
      }, 250);
    }
    return () => clearTimeout(t);
  }, [closing]);

  return (
    <>
      <StyledTR
        clickable
        stale={isStale}
        active={showInfo}
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
          infoOpen={showInfo}
        />
        <td>
          <VerticalToggle
            visible={showInfo || isHovering}
            active={showInfo}
            onClick={() => {
              setShowInfo((b) => !b);
              if (showInfo) {
                setClosing(true);
              }
            }}
          />
        </td>
      </StyledTR>
      {(showInfo || closing) && (
        <tr>
          <StatusColorCell status={runToRender.status} title={runToRender.status} hideBorderTop={true} />
          <StyledTD colSpan={cols.length}>
            <HeightAnimatedContainer>
              <StyledSection closing={closing}>
                <RunParameterTable run={runToRender} initialState={false} />
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

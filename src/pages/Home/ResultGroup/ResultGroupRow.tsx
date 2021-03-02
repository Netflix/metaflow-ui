import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { TR } from '../../../components/Table';
import { Run } from '../../../types';
import { getPath } from '../../../utils/routing';
import { getRunId } from '../../../utils/run';
import ResultGroupCells from './ResultGroupCells';

//
// Typedef
//

type Props = {
  isStale: boolean;
  queryParams: Record<string, string>;
  updateListValue: (key: string, value: string) => void;
  run: Run;
  timezone: string;
};

//
// Row component that will lock it's state when hovered
//
const ResultGroupRow: React.FC<Props> = ({ isStale, queryParams, updateListValue, run, timezone }) => {
  const [runToRender, setRunToRender] = useState(run);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!isHovering) {
      setRunToRender(run);
    }
  }, [isHovering]); // eslint-disable-line

  useEffect(() => {
    if (!isHovering || run.run_number === runToRender.run_number) {
      setRunToRender(run);
    }
  }, [run]); // eslint-disable-line

  return (
    <StyledTR
      clickable
      stale={isStale}
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
      />
    </StyledTR>
  );
};

//
// Styles
//

const StyledTR = styled(TR)`
  transition: transform 0.15s, box-shadow 0.25s;
  &:hover {
    transform: scale(1.005);
    box-shadow: 2px 1px 4px rgba(0, 0, 0, 0.25);
  }
`;

export default ResultGroupRow;

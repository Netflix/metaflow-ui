import React from 'react';
import styled from 'styled-components';
import { Run } from '@/types';
import { TDWithLink } from '@pages/Home/ResultGroup/Cells';
import ExpandToggle, { ExpandToggleProps } from '@pages/Home/ResultGroup/Cells/ExpandToggle';
import StatusIndicator from '@components/StatusIndicator';
import { getRunId } from '@utils/run';

const RunCell: React.FC<{ link: string; run: Run; expand: ExpandToggleProps }> = ({ link, run, expand }) => {
  return (
    <TDWithLink link={link}>
      <ExpandToggle {...expand} />
      <FlexCell>
        <StatusIndicator status={run.status} />
        {getRunId(run)}
      </FlexCell>
    </TDWithLink>
  );
};

const FlexCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export default RunCell;

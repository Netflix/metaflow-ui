import React from 'react';
import styled from 'styled-components';
import { RunStatus } from '@/types';
import StatusIndicator from '@components/StatusIndicator';
import { TD } from '@components/Table';
import { SmallText } from '@components/Text';

//
// Small status indicator on left side of the rows
//

type StatusColorCellProps = {
  status: keyof RunStatus;
  title: keyof RunStatus;
};

const StatusColorCell: React.FC<StatusColorCellProps> = ({ status, title }) => {
  return (
    <>
      <StatusCell>
        <StatusIndicator status={status} />
        <Text>{title} Run</Text>
      </StatusCell>
    </>
  );
};

const StatusCell = styled(TD)`
  text-align: center;
  position: relative;
  padding: var(--result-group-status-cell-padding);

  i {
    vertical-align: middle;
  }
  :hover small {
    opacity: 1;
  }
`;

const Text = styled(SmallText)`
  white-space: 'nowrap';
  transition: opacity 0.25s;
  opacity: 0;
  position: absolute;
  left: 50%;
  top: 75%;
  color: var(--color-text-alternative);
  background: var(--tooltip-bg);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  white-space: nowrap;
  text-transform: capitalize;
  z-index: 10;
`;

export default StatusColorCell;

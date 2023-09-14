import React from 'react';
import styled from 'styled-components';
import { RunStatus, TaskStatus } from '../../types';
import StatusIndicator from '../StatusIndicator';

const StatusField: React.FC<{ status: keyof RunStatus | TaskStatus }> = ({ status }) => {
  return (
    <StatusContainer data-testid="status-container">
      <StatusIndicator status={status} />
      {status}
    </StatusContainer>
  );
};

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  text-transform: capitalize;
`;

export const StatusColorIndicator = styled.div`
  display: flex;
  margin-right: 0.5rem;
`;

export default StatusField;

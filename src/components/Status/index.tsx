import React from 'react';
import styled from 'styled-components';
import { RunStatus, TaskStatus } from '@/types';
import StatusIndicator from '@components/StatusIndicator';

const StatusField: React.FC<{ status: keyof RunStatus | TaskStatus }> = ({ status }) => {
  return (
    <StatusContainer data-testid="status-container">
      <StatusIndicator status={status} />
      <StatusText>{status}</StatusText>
    </StatusContainer>
  );
};

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  text-transform: capitalize;
`;

const StatusText = styled.span`
  margin-left: 0.5rem;
`;

export default StatusField;

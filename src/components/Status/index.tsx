import React from 'react';
import styled from 'styled-components';

const StatusField: React.FC<{ status: string }> = ({ status }) => (
  <StatusContainer>
    <StatusColorIndicator status={status} />
    {status}
  </StatusContainer>
);

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  text-transform: capitalize;
`;

export const StatusColorIndicator = styled.div<{ status: string }>`
  height: 8px;
  width: 8px;
  border-radius: 2px;
  margin-right: 0.5rem;
  background: ${(p) => {
    switch (p.status) {
      case 'completed':
        return p.theme.color.bg.green;
      case 'failed':
        return p.theme.color.bg.red;
      case 'running':
        return p.theme.color.bg.yellow;
      default:
        return p.theme.color.bg.dark;
    }
  }};
`;

export default StatusField;

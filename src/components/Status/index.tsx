import React from 'react';
import styled from 'styled-components';
import { colorByStatus } from '../../utils/style';

const StatusField: React.FC<{ status: string }> = ({ status }) => (
  <StatusContainer data-testid="status-container">
    <StatusColorIndicator status={status} data-testid="status-container-color" />
    {status}
  </StatusContainer>
);

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  text-transform: capitalize;
`;

export const StatusColorIndicator = styled.div<{ status: string }>`
  height: 0.5rem;
  width: 0.5rem;
  border-radius: 2px;
  margin-right: 0.5rem;
  background: ${(p) => colorByStatus(p.theme, p.status)};
`;

export default StatusField;

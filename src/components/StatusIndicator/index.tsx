import React from 'react';
import styled from 'styled-components';
import { RunStatus, TaskStatus } from '@/types';
import Icon from '@components/Icon';
import { colorByStatus, iconByStatus } from '@utils/style';

const StatusIndicator: React.FC<{ status: keyof RunStatus | TaskStatus }> = ({ status }) => {
  const iconName = iconByStatus(status);
  return (
    <StatusColorIndicator data-testid="status-container-color" status={status}>
      {iconName && <Icon name={iconName} size="xs" />}
    </StatusColorIndicator>
  );
};

const StatusColorIndicator = styled.div<{ status: string }>`
  display: flex;
  color: ${(p) => (p.status === 'failed' ? 'white' : colorByStatus(p.status))};
  justify-content: center;
`;

export default StatusIndicator;

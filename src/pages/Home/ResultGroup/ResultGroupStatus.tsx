import styled from 'styled-components';
import { TD } from '../../../components/Table';
import { colorByStatus, iconByStatus } from '../../../utils/style';
import Icon, { SupportedIcons } from '../../../components/Icon';
import React from 'react';
import { RunStatus } from '../../../types';

//
// Small status indicator on left side of the rows
//

type StatusColorCellProps = {
  status: keyof RunStatus;
  title: keyof RunStatus;
};

const StatusColorCell: React.FC<StatusColorCellProps> = ({ status, title }) => {
  const name: keyof SupportedIcons | undefined = iconByStatus(status);
  console.log('name', name, title);
  return <StatusCell status={status}>{name && <Icon name={name} size="xs" />}</StatusCell>;
};

const StatusCell = styled(TD)<{
  status: string;
}>`
  text-align: center;
  color: ${(p) => colorByStatus(p.theme, p.status) || 'transparent'} !important;
`;

export default StatusColorCell;

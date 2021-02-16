import styled, { css } from 'styled-components';
import { TD, TH } from '../../../components/Table';
import { RunStatus } from '../../../types';

//
// Small status indicator on left side of the rows
//

const statusColors: RunStatus = {
  completed: 'green',
  running: 'yellow',
  failed: 'red',
};

const statusCellCSS = css`
  width: 0.25rem;
  padding: 1px;
`;

export const StatusColorCell = styled(TD)<{ status: keyof RunStatus }>`
  background: ${(p) => p.theme.color.bg[statusColors[p.status]] || 'transparent'} !important;
  ${statusCellCSS};
`;

export const StatusColorHeaderCell = styled(TH)`
  ${statusCellCSS};
`;

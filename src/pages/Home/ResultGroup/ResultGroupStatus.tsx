import styled, { css } from 'styled-components';
import { TD, TH } from '../../../components/Table';
import { RunStatus } from '../../../types';

//
// Small status indicator on left side of the rows
//

const statusColors = {
  completed: 'green' as const,
  running: 'yellow' as const,
  failed: 'red' as const,
};

const statusCellCSS = css`
  width: 0.25rem;
  padding: 1px;
`;

export const StatusColorCell = styled(TD)<{
  status: keyof RunStatus;
  hideBorderTop?: boolean;
  hideBorderBottom?: boolean;
}>`
  background: ${(p) => p.theme.color.bg[statusColors[p.status]] || 'transparent'} !important;
  ${statusCellCSS};
  ${(p) => (p.hideBorderTop ? 'border-top: none;' : null)};
  ${(p) => (p.hideBorderBottom ? 'border-bottom: none;' : null)};
`;

export const StatusColorHeaderCell = styled(TH)`
  ${statusCellCSS};
`;

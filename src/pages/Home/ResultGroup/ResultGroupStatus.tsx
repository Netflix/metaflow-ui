import styled, { css } from 'styled-components';
import { TD, TH } from '../../../components/Table';
import { colorByStatus } from '../../../utils/style';

//
// Small status indicator on left side of the rows
//

const statusCellCSS = css`
  width: 0.25rem;
  padding: 1px;
`;

export const StatusColorCell = styled(TD)<{
  status: string;
  hideBorderTop?: boolean;
  hideBorderBottom?: boolean;
}>`
  background: ${(p) => colorByStatus(p.theme, p.status) || 'transparent'} !important;
  ${statusCellCSS};
  ${(p) => (p.hideBorderTop ? 'border-top: none;' : null)};
  ${(p) => (p.hideBorderBottom ? 'border-bottom: none;' : null)};
`;

export const StatusColorHeaderCell = styled(TH)`
  ${statusCellCSS};
`;

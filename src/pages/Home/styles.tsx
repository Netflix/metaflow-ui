import styled, { css } from 'styled-components';
import { Section } from '../../components/Structure';
import { TD, TH } from '../../components/Table';
import { RunStatus } from '../../types';

export const ResultGroup = styled(Section)`
  margin-bottom: ${(p) => p.theme.spacer.hg}rem;

  table {
    margin-bottom: ${(p) => p.theme.spacer.md}rem;
  }

  .load-more {
    display: block;
    color: ${(p) => p.theme.color.text.blue};

    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  }

  td.timeline-link a {
    text-decoration: none;
    color: ${(p) => p.theme.color.text.light};
    white-space: nowrap;
  }

  tr:hover td.timeline-link a {
    color: ${(p) => p.theme.color.text.blue};

    svg #line1 {
      color: ${(p) => p.theme.color.bg.red};
    }
    svg #line2 {
      color: ${(p) => p.theme.color.bg.yellow};
    }
  }
`;

const statusColors: RunStatus = {
  completed: 'white',
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

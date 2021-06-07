import styled, { css } from 'styled-components';
import { ForceNoWrapText } from '../Text';
import { AsyncStatus } from '../../types';

export const InputLabel = styled(ForceNoWrapText)<{ active: boolean; status?: AsyncStatus }>`
  background: #fff;
  font-size: 0.875rem;
  font-weight: bold;
  padding: 0 0.25rem;
  position: absolute;
  top: 0;
  transition: all 125ms linear;

  color: ${(p) => (p.status === 'Error' ? p.theme.color.bg.red : 'inherit')};

  ${(p) =>
    p.active
      ? css`
          transform: scale(0.75) translate(-0.625rem, -0.75rem);
        `
      : css`
          transform: scale(1) translate(-0.25rem, 0.6875rem);
        `}
`;

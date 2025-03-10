import styled, { css } from 'styled-components';
import { AsyncStatus } from '@/types';
import { ForceNoWrapText } from '@components/Text';

//
// Label for InputWrapper that has Material UI kind of animation when focused on.
//

export const InputLabel = styled(ForceNoWrapText)<{ active: boolean; status?: AsyncStatus }>`
  background: inherit;
  font-size: var(--input-label-font-size);
  font-weight: var(--input-label-font-weight);
  padding: 0 0.25rem;
  position: absolute;
  top: 0;
  left: 0.75rem;
  transition: all 125ms linear;

  color: ${(p) => (p.status === 'Error' ? 'var(--color-bg-danger)' : 'inherit')};

  ${(p) =>
    p.active
      ? css`
          transform: var(--input-label-transform-active);
        `
      : css`
          transform: var(--input-label-transform);
        `}
`;

import styled, { css } from 'styled-components';

const TextCSS = css`
  display: inline-flex;
  align-items: center;
`;

export const Text = styled.span`
  ${TextCSS};
`;

export const SmallText = styled.small`
  ${TextCSS};
  font-size: var(--font-size-primary);
`;

export const ForceBreakText = styled.span`
  word-break: break-all;
`;

export const ForceNoBreakText = styled.span`
  word-break: normal;
`;

export const ForceNoWrapText = styled.span`
  white-space: nowrap;
`;

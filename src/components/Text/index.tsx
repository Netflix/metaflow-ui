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
  font-size: 0.75rem;
`;

export const Paragraph = styled.p``;

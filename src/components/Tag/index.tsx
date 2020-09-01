import React from 'react';
import styled, { css } from 'styled-components';
import { darken } from 'polished';
import Icon from '../Icon';

const ActiveTagCSS = css`
  cursor: pointer;
  background: ${(p) => p.theme.color.bg.blueLight};
  color: ${(p) => p.theme.color.text.blue};
  border-bottom: 1px solid ${(p) => darken(0.1, p.theme.color.bg.blueLight)};
  padding: ${(p) => p.theme.spacer.sm}rem;
  font-weight: 400;
  box-shadow: none;

  &:hover {
    background: ${(p) => darken(0.03, p.theme.color.bg.blueLight)};
  }
`;

const Tag = styled.span`
  display: inline-flex;
  background: ${(p) => p.theme.color.bg.white};
  color: ${(p) => p.theme.color.text.mid};
  padding: ${(p) => p.theme.spacer.xs}rem ${(p) => p.theme.spacer.sm}rem;
  border-radius: 0.25rem;
  border: 0;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1rem;
  cursor: default;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.4);

  ${(p) => p.onClick && ActiveTagCSS};
`;

export default Tag;

export const RemovableTag: React.FC<{ onClick: () => void }> = ({ children, onClick }) => (
  <Tag onClick={onClick}>
    {children}
    <Icon name="times" padLeft />
  </Tag>
);

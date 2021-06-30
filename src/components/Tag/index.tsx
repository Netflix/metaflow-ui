import React from 'react';
import styled, { css } from 'styled-components';
import { darken } from 'polished';
import Icon from '../Icon';

const ActiveTagCSS = css`
  cursor: pointer;
  background: ${(p) => p.theme.color.bg.blueLight};
  color: ${(p) => p.theme.color.text.blue};
  border-bottom: 1px solid ${(p) => darken(0.1, p.theme.color.bg.blueLight)};
  font-weight: 400;
  box-shadow: none;

  &:hover {
    background: ${(p) => darken(0.03, p.theme.color.bg.blueLight)};
  }
`;

const DarkTagCSS = css`
  font-weight: 500;
`;

const Tag = styled.span<{ highlighted?: boolean; dark?: boolean }>`
  display: inline-flex;
  color: ${(p) => p.theme.color.text.mid};
  padding: 0.375rem ${(p) => p.theme.spacer.sm}rem;
  border-radius: 0.25rem;
  border: 0;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1rem;
  cursor: ${(p) => (p.onClick ? 'pointer' : 'default')};

  transition: all 0.15s;

  &:hover {
    background: ${(p) => p.theme.color.bg.white};
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.4);
  }

  ${(p) => p.highlighted && ActiveTagCSS};
  ${(p) => p.dark && DarkTagCSS}
`;

export default Tag;

export const RemovableTag: React.FC<{ className?: string; title?: string; onClick: () => void }> = ({
  className,
  children,
  title,
  onClick,
}) => (
  <Tag onClick={onClick} className={`removable-tag  ${className}`} title={title} highlighted>
    {children}
    <Icon name="times" padLeft />
  </Tag>
);

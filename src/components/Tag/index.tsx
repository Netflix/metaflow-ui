import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import Icon from '../Icon';
import { darkenCssVar } from '../../utils/style';

const ActiveTagCSS = css`
  cursor: pointer;
  background: var(--color-bg-secondary-highlight);
  color: var(--color-text-highlight);
  border-bottom: 1px solid ${darkenCssVar('--color-bg-secondary-highlight', 10)};
  font-weight: 400;
  box-shadow: none;

  &:hover {
    background: ${darkenCssVar('--color-bg-secondary-highlight', 3)};
  }
`;

const DarkTagCSS = css`
  font-weight: 500;
`;

const Tag = styled.span<{ highlighted?: boolean; dark?: boolean }>`
  display: inline-flex;
  color: var(--color-text-secondary);
  padding: 0.375rem var(--spacing-3);
  border-radius: 0.25rem;
  border: 0;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1rem;
  cursor: ${(p) => (p.onClick ? 'pointer' : 'default')};

  transition: all 0.15s;

  &:hover {
    background: var(--color-bg-primary);
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.4);
  }

  ${(p) => p.highlighted && ActiveTagCSS};
  ${(p) => p.dark && DarkTagCSS}
`;

export default Tag;

export const RemovableTag: React.FC<{
  className?: string;
  children: ReactNode;
  title?: string;
  onClick: () => void;
}> = ({ className, children, title, onClick }) => (
  <Tag onClick={onClick} className={`removable-tag  ${className}`} title={title} highlighted>
    {children}
    <Icon name="times" padLeft />
  </Tag>
);

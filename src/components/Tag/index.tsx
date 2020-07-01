import React from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import Icon from '../Icon';

const Tag = styled.span`
  display: inline-block;
  background: ${(p) => p.theme.color.bg.blueLight};
  color: ${(p) => p.theme.color.text.blue};
  margin-right: ${(p) => p.theme.spacer.xs}rem;
  margin-bottom: ${(p) => p.theme.spacer.xs}rem;
  padding: ${(p) => p.theme.spacer.xs}rem ${(p) => p.theme.spacer.sm}rem;
  border-radius: 0.25rem;
  border-bottom: 1px solid ${(p) => darken(0.1, p.theme.color.bg.blueLight)};
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1rem;

  &:hover {
    background: ${(p) => darken(0.03, p.theme.color.bg.blueLight)};
  }

  i {
    margin-left: ${(p) => p.theme.spacer.xs}rem;
    height: 1rem;
  }

  &.removable {
    cursor: pointer;
  }
`;

export default Tag;

export const RemovableTag: React.FC<{ onClick: () => void }> = ({ children, onClick }) => (
  <Tag className="removable" onClick={() => onClick()}>
    {children}
    <Icon name="times" />
  </Tag>
);

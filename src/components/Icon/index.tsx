import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { sizeTable, SupportedSizes } from '@components/Icon/icon-size';
import { icons } from '@components/Icon/icons';

export type SupportedIcons = typeof icons;

export type IconKeys = keyof SupportedIcons;

interface IconProps {
  name: keyof SupportedIcons;
  size?: keyof SupportedSizes;
  customSize?: string;
  rotate?: number;
  className?: string;
  padLeft?: boolean;
  padRight?: boolean;
  spin?: boolean;
  title?: string;
  visible?: boolean;
  onClick?: () => void;
}

const Icon: React.FC<IconProps> = ({ name, size = 'sm', visible = true, rotate, ...rest }) => {
  const IconComponent = icons[name];
  return (
    <Wrapper className={`icon icon-${name}`} {...rest} {...{ size, visible, rotate }}>
      <IconComponent />
    </Wrapper>
  );
};

export default Icon;

const Wrapper = styled.i<{
  size: keyof SupportedSizes;
  customSize?: string;
  rotate?: number;
  spin?: boolean;
  padLeft?: boolean;
  padRight?: boolean;
  title?: string;
  visible?: boolean;
}>`
  vertical-align: text-top;
  display: ${(p) => (p.visible ? 'inline-flex' : 'none')};
  align-items: center;
  margin: 0;
  padding: 0;
  padding-left: ${(p) => (p.padLeft ? 'var(--spacing-3)' : 0)}rem;
  padding-right: ${(p) => (p.padRight ? 'var(--spacing-3)' : 0)}rem;

  ${(p) =>
    p.spin
      ? css`
          animation: ${SpinKeyframes} 1.2s linear infinite;
        `
      : null}

  svg {
    height: ${(p) => p.customSize || sizeTable[p.size] + 'rem'};
    transform: ${(p) => (p.rotate ? `rotate(${p.rotate}deg)` : 'none')};
    transition: transform 0.25s;
    width: auto;
  }
`;

const SpinKeyframes = keyframes`
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
`;

type SortIconProps = Omit<IconProps, 'name'> & { direction: 'up' | 'down'; active?: boolean };

export const SortIcon: React.FC<SortIconProps> = ({ direction, ...rest }) => (
  <StyledSortIcon direction={direction} name="sort" className="icon icon-sort" {...rest} />
);

const StyledSortIcon = styled(Icon)<SortIconProps>`
  color: var(--color-icon-light);

  #up {
    color: ${(p) => (p.active && p.direction === 'up' ? 'var(--color-icon-primary)' : 'currentColor')};
  }

  #down {
    color: ${(p) => (p.active && p.direction === 'down' ? 'var(--color-icon-primary)' : 'currentColor')};
  }
`;

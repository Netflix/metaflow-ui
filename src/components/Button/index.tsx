import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

//
// Typedef
//

type ButtonVariant = 'default' | 'text' | 'primaryText';

export type ButtonProps = {
  className?: string;
  disabled?: boolean;
  active?: boolean;
  textOnly?: boolean;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: ButtonVariant;
  tabIndex?: number;
  withIcon?: boolean | 'left' | 'right';
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  title?: string;
};

const buttonFontSizes = {
  sm: 'var(--button-font-size-sm)',
  md: 'var(--button-font-size-md)',
  lg: 'var(--button-font-size-lg)',
};

//
// Basic button through out the application
// TODO: Check if we really need all therse params
//

const Button: React.FC<ButtonProps> = ({
  className = '',
  active = false,
  disabled = false,
  textOnly = false,
  iconOnly = false,
  variant = 'default',
  size = 'md',
  tabIndex = 99,
  withIcon = false,
  children,
  ...rest
}) => {
  return (
    <StyledButton
      className={`button ${className} ${active ? 'active' : ''}`}
      {...{ disabled, tabIndex, active, textOnly, variant, size, withIcon, iconOnly, ...rest }}
    >
      {children}
    </StyledButton>
  );
};

//
// Button but its actually a link.
//

export const ButtonLink: React.FC<Omit<ButtonProps, 'onClick'> & { to: string }> = ({ to, disabled, ...rest }) => {
  return (
    <StyledButtonLink to={to} style={{ pointerEvents: disabled ? 'none' : 'all' }}>
      <BigButton {...rest} disabled={disabled} onClick={() => null} />
    </StyledButtonLink>
  );
};

//
// Style
//

const StyledButtonLink = styled(Link)`
  text-decoration: none;
`;

const DisabledButtonCSS = css`
  border-color: var(--color-bg-secondary);
  color: var(--color-text-light);
  cursor: not-allowed;
  background: var(--color-bg-secondary);
`;

const ActiveButtonCSS = css`
  font-weight: var(--button-active-font-weight);
`;

const TextOnlyButtonCSS = css`
  border-width: 0;

  &:hover,
  &:active,
  .active {
    border-width: 0;
  }
`;

const IconOnLeftCSS = css`
  > *:not(:first-child) {
    margin-left: 0.5rem;
  }
`;

const IconOnRightCSS = css`
  > *:not(:last-child) {
    margin-right: 0.5rem;
  }
`;

type StyledButtonProps = {
  disabled?: boolean;
  active?: boolean;
  textOnly?: boolean;
  iconOnly?: boolean;
  size: NonNullable<ButtonProps['size']>;
  variant: NonNullable<ButtonProps['variant']>;
  withIcon: NonNullable<ButtonProps['withIcon']>;
};

const getButtonColors = (variant: ButtonVariant) => css`
  background: var(--button-${variant}-bg, --button-default-bg);
  color: var(--button-${variant}-text-color, --button-default-text-color);
  border: var(--button-${variant}-border, --button-default-border);

  &:hover {
    background: var(--button-${variant}-bg-hover, --button-default-bg-hover);
  }

  &:active {
    background: var(--button-${variant}-active-bg, --button-default-active-bg);
  }

  &.active {
    background: var(--button-${variant}-active-bg, --button-default-active-bg);
    color: var(--button-${variant}-active-text-color, --button-default-active-active-text-color);
  }
`;

// TODO: make padding react to the size variant
export const ButtonCSS = css`
  display: flex;
  align-items: center;
  outline: 0;
  cursor: pointer;
  text-decoration: none;
  border-radius: var(--radius-primary);
  border: var(--border-primary-thin);
  min-height: var(--button-min-height);
  transition: background 0.15s;
`;

const StyledButton = styled.button<StyledButtonProps>`
  ${ButtonCSS};
  padding: var(--spacing-1) ${(p) => (p.iconOnly ? 'var(--spacing-1)' : 'var(--spacing-3)')};
  ${(p) => getButtonColors(p.variant)};
  ${(p) => p.active && ActiveButtonCSS};
  ${(p) => p.disabled && DisabledButtonCSS};
  ${(p) => p.textOnly && TextOnlyButtonCSS};
  ${(p) => (p.withIcon === true || p.withIcon === 'left') && IconOnLeftCSS};
  ${(p) => p.withIcon === 'right' && IconOnRightCSS};
  font-size: ${(p) => buttonFontSizes[p.size]};
`;

export const BigButton = styled(Button)`
  line-height: var(--big-button-line-height);
  font-size: var(--big-button-font-size);
  white-space: nowrap;

  padding-left: 0.75rem;
  padding-right: 0.75rem;
  &:hover {
    background: transparent;
  }
`;

export default Button;

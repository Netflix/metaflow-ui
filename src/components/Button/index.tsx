import React, { ReactNode } from 'react';
import styled, { css, ButtonColors } from 'styled-components';
import { useHistory } from 'react-router-dom';
import { darken } from 'polished';

export type ButtonProps = {
  className?: string;
  disabled?: boolean;
  active?: boolean;
  textOnly?: boolean;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'text' | 'primaryText';
  tabIndex?: number;
  withIcon?: boolean | 'left' | 'right';
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  title?: string;
};

const buttonFontSizes = {
  sm: 0.875,
  md: 1,
  lg: 1.25,
};

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

export const ButtonLink: React.FC<Omit<ButtonProps, 'onClick'> & { to: string }> = ({ to, ...rest }) => {
  const history = useHistory();
  return <BigButton {...rest} onClick={() => history.push(to)} />;
};

const DisabledButtonCSS = css`
  border-color: ${(p) => p.theme.color.bg.light};
  color: ${(p) => p.theme.color.text.light};
  cursor: not-allowed;
  background: ${(p) => p.theme.color.bg.light};
`;

const ActiveButtonCSS = css`
  font-weight: 500;
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

const getButtonColors = (variant: ButtonColors) => css`
  background: ${variant.bg};
  color: ${variant.text};

  ${variant.border && `border: ${variant.border};`}

  &:hover {
    background: ${darken(0.05, variant.bg === 'transparent' ? '#fff' : variant.bg)};
  }

  &:active {
    background: ${darken(0.1, variant.bg === 'transparent' ? '#fff' : variant.bg)};
  }

  &.active {
    background: ${variant.activeBg};
    color: ${variant.activeText};
  }
`;

// TODO: make padding react to the size variant
export const ButtonCSS = css`
  display: flex;
  align-items: center;
  outline: 0;
  cursor: pointer;
  text-decoration: none;
  border-radius: 0.25rem;
  border: ${(p) => p.theme.border.thinNormal};
  min-height: 28px;
  transition: background 0.15s;
`;

const StyledButton = styled.button<StyledButtonProps>`
  ${ButtonCSS};
  padding: ${(p) => p.theme.spacer.xs}rem ${(p) => (p.iconOnly ? p.theme.spacer.xs : p.theme.spacer.sm)}rem;
  ${(p) => getButtonColors(p.theme.color.button[p.variant])};
  ${(p) => p.active && ActiveButtonCSS};
  ${(p) => p.disabled && DisabledButtonCSS};
  ${(p) => p.textOnly && TextOnlyButtonCSS};
  ${(p) => (p.withIcon === true || p.withIcon === 'left') && IconOnLeftCSS};
  ${(p) => p.withIcon === 'right' && IconOnRightCSS};
  font-size: ${(p) => buttonFontSizes[p.size]}rem;
`;

export const BigButton = styled(Button)`
  line-height: 1.875rem;
  font-size: 0.875rem;
  white-space: nowrap;
  border-color: ${(p) => p.theme.color.bg.blue};
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  &:hover {
    background: transparent;
  }
`;

export default Button;

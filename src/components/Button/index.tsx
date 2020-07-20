import React, { ReactNode } from 'react';
import styled, { css, ButtonColors } from 'styled-components';
import { useHistory } from 'react-router-dom';
import { darken } from 'polished';

export type ButtonProps = {
  className?: string;
  disabled?: boolean;
  active?: boolean;
  textOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'text' | 'primaryText';
  tabIndex?: number;
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  children: ReactNode;
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
  variant = 'default',
  size = 'md',
  tabIndex = 99,
  children,
  ...rest
}) => {
  return (
    <StyledButton
      className={`button ${className} ${active ? 'active' : ''}`}
      {...{ disabled, tabIndex, active, textOnly, variant, size, ...rest }}
    >
      {children}
    </StyledButton>
  );
};

export const ButtonLink: React.FC<Omit<ButtonProps, 'onClick'> & { to: string }> = ({ to, ...rest }) => {
  const history = useHistory();
  return <Button {...rest} onClick={() => history.push(to)} />
};

const DisabledButtonCSS = css`
  border-color:  ${p => p.theme.color.bg.light} !important;
  color: ${p => p.theme.color.text.light} !important;
  cursor: not-allowed;
  background: ${p => p.theme.color.bg.light} !important;
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

type StyledButtonProps = {
  disabled?: boolean;
  active?: boolean;
  textOnly?: boolean;
  size: NonNullable<ButtonProps['size']>;
  variant: NonNullable<ButtonProps['variant']>;
};

const getButtonColors = (variant: ButtonColors) => css`
  background: ${variant.bg};
  color: ${variant.text};

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
  padding: ${(p) => p.theme.spacer.xs}rem ${(p) => p.theme.spacer.sm}rem;
  text-decoration: none;
  border-radius: 0.25rem;
  border: 1px solid ${(p) => p.theme.color.border.light};
`;

const StyledButton = styled.button<StyledButtonProps>`
  ${ButtonCSS};
  ${(p) => getButtonColors(p.theme.color.button[p.variant])};
  ${(p) => p.active && ActiveButtonCSS};
  ${(p) => p.disabled && DisabledButtonCSS};
  ${(p) => p.textOnly && TextOnlyButtonCSS};
  font-size: ${(p) => buttonFontSizes[p.size]}rem;
`;

export default Button;

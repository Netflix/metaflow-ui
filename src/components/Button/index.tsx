import React from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

type ButtonProps = {
  // If given we will render button as link
  to?: string;
  // Click handler if we dont have to attr
  onClick?: () => void;
  // Optional label, we can also render children instead.
  label?: string;
  disabled?: boolean;
  tabIndex?: number;
  testid?: string;
};

const Button: React.FC<ButtonProps> = ({ label, children, to, onClick, disabled, tabIndex = 99, testid = '' }) => {
  const Element = () => (
    <ButtonStyle
      onClick={() => (!to && onClick ? onClick() : null)}
      disabled={disabled}
      tabIndex={tabIndex}
      data-testid={testid || label + '-button'}
    >
      {label || children}
    </ButtonStyle>
  );

  return to && !disabled ? (
    <ButtonLinkContainer>
      <Link to={to}>
        <Element />
      </Link>
    </ButtonLinkContainer>
  ) : (
    <Element />
  );
};

const ButtonStyles = css`
  padding: 0 10px;
  height: 40px;
  line-height: 38px;
  background: ${({ theme }) => theme.color.bg.light};
  color: ${({ theme }) => theme.color.text.lightest};
  text-decoration: none;
  border-radius: 4px;
  margin: 0 5px;
  border: ${({ theme }) => '1px solid ' + theme.color.border.light};
`;

const ButtonStyle = styled.div<{ disabled?: boolean }>`
  ${ButtonStyles}
  border-color: ${({ disabled }) => (disabled ? '#fff' : '#d7d7d7')}
`;

export const ButtonContainer = styled.div`
  ${ButtonStyles}
  padding: 0px;
  display: flex;
  position: relative;
  overflow: hidden;
`;

export const ButtonContainerItem = styled.div<{ active?: boolean }>`
  padding: 0 10px;
  color: ${({ active, theme }) => (active ? theme.color.text.dark : theme.color.text.lightest)};
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
`;

export const ButtonContainerHighlightedItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.text.lightest};
  background: #fff;
  height: 40px;
  line-height: 16px;
  border-left: ${({ theme }) => '1px solid ' + theme.color.border.light};
  cursor: pointer;

  transition: padding 0.15s;

  &:focus {
    padding: 0 5px;
  }
`;

export const ButtonContainerSeparator = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
`;

export const ButtonLinkContainer = styled.div`
  a {
    color: ${({ theme }) => theme.color.text.lightest};
  }
`;

export default Button;

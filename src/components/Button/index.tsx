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
};

const Button: React.FC<ButtonProps> = ({ label, children, to, onClick }) => {
  const Element = () => (
    <ButtonStyle onClick={() => (!to && onClick ? onClick() : null)}>{label || children}</ButtonStyle>
  );

  return to ? (
    <Link to={to}>
      <Element />
    </Link>
  ) : (
    <Element />
  );
};

const ButtonStyles = css`
  padding: 10px;
  background: #f6f6f6;
  color: #828282;
  text-decoration: none;
  border-radius: 4px;
  margin: 0 5px;
  border: 1px solid #d7d7d7;
`;

const ButtonStyle = styled.div`
  ${ButtonStyles}
`;

export const ButtonContainer = styled.div`
  ${ButtonStyles}
  padding: 0px;
  display: flex;
  position: relative;
  overflow: hidden;
`;

export const ButtonContainerItem = styled.div<{ active?: boolean }>`
  padding: 10px;
  color: #828282;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
`;

export const ButtonContainerHighlightedItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #828282;
  background: #fff;
  height: 40px;
  border-left: 1px solid #d7d7d7;
`;

export const ButtonContainerSeparator = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
`;

export default Button;

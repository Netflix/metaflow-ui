import React from 'react';
import styled from 'styled-components';

type ButtonGroupItemProps = {
  label: string;
  action: () => void;
  active?: boolean;
};

type ButtonGroupProps = {
  buttons: ButtonGroupItemProps[];
};

const ButtonGroup: React.FC<ButtonGroupProps> = ({ buttons }) => (
  <ButtonGroupContainer>
    {buttons.map((item) => (
      <ButtonGroupItem key={item.label} active={item.active} onClick={() => item.action()}>
        {item.label}
      </ButtonGroupItem>
    ))}
  </ButtonGroupContainer>
);

const ButtonGroupContainer = styled.div`
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid ${(p) => p.theme.color.border.normal};
  display: flex;
`;

const ButtonGroupItem = styled.div<{ active?: boolean }>`
  font-size: 14px;
  line-height: 24px;
  height: 26px;
  padding: 0 0.8rem;
  cursor: pointer;
  background: ${(p) => (p.active ? p.theme.color.bg.blueGray : '#fff')};

  &:not(:last-child) {
    border-right: 1px solid ${(p) => p.theme.color.border.normal};
  }

  &:hover {
    background: ${(p) => (p.active ? p.theme.color.bg.blueGray : p.theme.color.bg.light)};
  }
`;

export default ButtonGroup;

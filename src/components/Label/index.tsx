import React from 'react';
import styled from 'styled-components';

export enum LabelType {
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
  Danger = 'danger',
  Default = 'default',
}

export interface LabelProps {
  type?: LabelType;
  children: React.ReactNode;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ type = LabelType.Default, children, className = '' }) => {
  return (
    <Wrapper type={type} className={className}>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ type: LabelType }>`
  border-radius: 0.5rem;
  color: ${({ type }) => `var(--color-text-${type}, --color-secondary)`};
`;

export default Label;

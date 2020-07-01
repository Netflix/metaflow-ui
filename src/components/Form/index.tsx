import React, { ReactNode } from 'react';
import styled from 'styled-components';
import checkUrl from '../../assets/check.svg';

type FieldProps = {
  horizontal?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export const Field: React.FC<FieldProps> = ({ children, ...rest }) => {
  return <FieldWrapper {...rest}>{children}</FieldWrapper>;
}

const FieldWrapper = styled.div<FieldProps>`
  display: ${(p) => (p.horizontal ? 'flex' : 'block')};
  margin-bottom: ${p => p.theme.spacer.xs}rem;
  align-items: center;

  label {
    display: ${(p) => (p.horizontal ? 'inline-block' : 'block')};
    margin-bottom: ${(p) => (p.horizontal ? 0 : p.theme.spacer.sm)}rem;
    margin-right: ${(p) => (p.horizontal ? p.theme.spacer.sm : 0)}rem;
  }

  input[type='checkbox'] + label, span.checkbox + label {
    margin-left: ${(p) => p.theme.spacer.sm}rem;
    margin-bottom: 0;
    display: inline-block;
  }

  input[type='text'] {
    background: ${p => p.theme.color.bg.light};
    padding: ${(p) => p.theme.spacer.xs}rem ${(p) => p.theme.spacer.sm}rem;
    border: 1px solid ${p => p.theme.color.border.light};
    border-radius: 0.25rem;
  }

  span.checkbox {
    width: 1.25rem;
    height: 1.25rem;
    line-height: 1.25rem;
    display: inline-block;
    border-radius: 0.125rem;
    text-align: center;
    background: ${p => p.theme.color.bg.light};
    border: 1px solid ${p => p.theme.color.border.light};
  }

  &.active {
    span.checkbox.checked {
      color: #fff;
      border-color: transparent;
      background-color: ${p => p.theme.color.bg.blue};

      &.status_running {
        background-color: ${p => p.theme.color.bg.yellow};
      }
      &.status_failed {
        background: ${p => p.theme.color.bg.red};
      }
      &.status_completed {
        background: ${p => p.theme.color.bg.green};
      }
    }
  }

  input,
  select {
    border: 0;
  }
`;

import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { v4 as uuid } from 'uuid';
import Icon from '../Icon';

//
// Types
//

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  className?: string;
  onChange: () => void;
  'data-testid'?: string;
};

//
// Checkbox
//

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  checked = false,
  onChange,
  className,
  ...rest
}) => {
  const [id] = useState(uuid());
  const testid = rest['data-testid'];
  return (
    <CheckboxWrapper
      checked={checked}
      data-testid={testid}
      className={className}
      onClick={() => onChange !== undefined && onChange()}
    >
      <span className={`checkbox ${id}`}>{checked && <Icon name="check" />}</span>
      <label htmlFor={id}>{label}</label>
    </CheckboxWrapper>
  );
};

//
// Style
//

const CheckboxWrapper = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  width: auto;
  position: relative;
  cursor: pointer;

  label {
    display: inline-block;
    margin-bottom: 0rem;
    margin-right: ${(p) => p.theme.spacer.sm}rem;
    margin-left: ${(p) => p.theme.spacer.sm}rem;
    cursor: pointer;
  }

  span.checkbox {
    color: #fff;
    width: 1.25rem;
    height: 1.25rem;
    line-height: 1.25rem;
    display: inline-block;
    border-radius: 0.125rem;
    text-align: center;
    background: ${(p) => p.theme.color.bg.light};
    border: ${(p) => p.theme.border.thinNormal};
  }

  span.checkbox svg path {
    fill: #fff;
  }

  ${(p) =>
    p.checked &&
    css`
      span.checkbox {
        color: ${(p) => p.theme.color.text.white};
        border-color: ${(p) => p.theme.color.bg.blue};
        color: ${(p) => p.theme.color.bg.blue};
        background: ${(p) => p.theme.color.bg.white};
      }

      &.status-running span.checkbox {
        border-color: ${(p) => p.theme.color.bg.greenLight};
        color: ${(p) => p.theme.color.bg.greenLight};
      }
      &.status-failed span.checkbox {
        border-color: ${(p) => p.theme.color.bg.red};
        color: ${(p) => p.theme.color.bg.red};
      }
      &.status-completed span.checkbox {
        border-color: ${(p) => p.theme.color.bg.green};
        color: ${(p) => p.theme.color.bg.green};
      }
    `}
`;

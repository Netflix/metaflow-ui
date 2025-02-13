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
  onChange?: () => void;
  disabled?: boolean;
  'data-testid'?: string;
};

//
// Checkbox
//

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  checked = false,
  onChange = () => {
    /*empty*/
  },
  className,
  disabled = false,
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
      disabled={disabled}
    >
      <span className={`checkbox ${id}`}>{checked && <Icon name="check" />}</span>
      <label htmlFor={id}>{label}</label>
    </CheckboxWrapper>
  );
};

//
// Style
//

const CheckboxWrapper = styled.div<{ checked: boolean; disabled: boolean }>`
  display: flex;
  align-items: center;
  width: auto;
  position: relative;
  cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};

  label {
    display: inline-block;
    margin-bottom: 0rem;
    margin-right: var(--spacing-3);
    margin-left: var(--spacing-3);
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
    background: var(--color-bg-secondary);
    border: var(--border-primary-thin);
  }

  span.checkbox svg path {
    fill: transparent;
  }

  ${(p) =>
    p.checked &&
    css`
      span.checkbox {
        color: var(--color-text-alternative);
        border-color: var(--color-bg-brand-primary);
        color: var(--color-bg-brand-primary);
        background: var(--color-bg-primary);
      }

      &.status-running span.checkbox {
        border-color: var(--color-bg-success-light);
        color: var(--color-bg-success-light);
      }
      &.status-failed span.checkbox {
        border-color: var(--color-bg-danger);
        color: var(--color-bg-danger);
      }
      &.status-completed span.checkbox {
        border-color: var(--color-bg-success);
        color: var(--color-bg-success);
      }
    `}
`;

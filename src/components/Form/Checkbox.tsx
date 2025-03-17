import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { v4 as uuid } from 'uuid';
import Icon from '@components/Icon';

//
// Types
//

type CheckboxFieldProps = {
  label?: string | null;
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
      {label && <label htmlFor={id}>{label}</label>}
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
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--checkbox-size);
    height: var(--checkbox-size);
    line-height: var(--checkbox-size);
    border-radius: var(--checkbox-border-radius);
    text-align: center;
    background: var(--checkbox-background);
    border: var(--checkbox-border);
  }

  span.checkbox svg path {
    fill: transparent;
  }

  svg {
    max-width: 100%;
  }

  ${(p) =>
    p.checked &&
    css`
      span.checkbox {
        border-color: var(--checkbox-color-checked);
        color: var(--checkbox-color-checked);
        background: var(--checkbox-background-checked);
      }

      &.status-running span.checkbox {
        border-color: var(--checkbox-color-checked-success-light);
        color: var(--checkbox-color-checked-success-light);
      }
      &.status-failed span.checkbox {
        border-color: var(--checkbox-color-checked-danger);
        color: var(--checkbox-color-checked-danger);
      }
      &.status-completed span.checkbox {
        border-color: var(--checkbox-color-checked-success);
        color: var(--checkbox-color-checked-success);
      }
    `}
`;

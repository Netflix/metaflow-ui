import React, { ReactNode } from 'react';
import styled from 'styled-components';
import Icon from '../Icon';
import { v4 as uuid } from 'uuid';

type CommonFieldProps<T> = {
  className?: string;
  horizontal?: boolean;
  active?: boolean;
  value?: string;
  onClick?: (e?: React.MouseEvent<T>) => void;
  onChange?: (e?: React.ChangeEvent<T>) => void;
  onKeyPress?: (e?: React.KeyboardEvent<T>) => void;
};

type FieldBaseProps = CommonFieldProps<HTMLDivElement> & {
  children: ReactNode;
  type: string;
};

export const Field: React.FC<FieldBaseProps> = ({ children, type, className, horizontal, active, onClick }) => (
  <FieldWrapper
    {...{
      className: `field field-${type} ${className} ${active ? 'active' : ''}`,
      horizontal,
      active,
      type,
      onClick,
    }}
  >
    {children}
  </FieldWrapper>
);

export const SelectField: React.FC<
  { label?: string; options: [string, string][] } & CommonFieldProps<HTMLSelectElement>
> = ({ label, options, horizontal, ...rest }) => {
  const id = uuid();
  return (
    <Field horizontal={horizontal} type="select">
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} {...rest}>
        {options.map((o) => (
          <option key={o[0]} value={o[0]}>
            {o[1]}
          </option>
        ))}
      </select>
    </Field>
  );
};

export const CheckboxField: React.FC<{ label: string; checked: boolean } & CommonFieldProps<HTMLInputElement>> = ({
  label,
  checked = false,
  onChange,
  className,
}) => {
  const id = uuid();
  return (
    <Field
      horizontal
      active={checked}
      type="checkbox"
      className={className}
      onClick={() => onChange !== undefined && onChange()}
    >
      <span className={`checkbox ${id} ${checked ? 'checked' : ''}`}>{checked && <Icon name="check" />}</span>
      <label htmlFor={id}>{label}</label>
    </Field>
  );
};

export const TextInputField = React.forwardRef<
  HTMLInputElement,
  { label?: string } & CommonFieldProps<HTMLInputElement>
>(({ label, horizontal, value, onChange, onKeyPress }, ref) => {
  const id = uuid();
  return (
    <Field horizontal={horizontal} type="text">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} ref={ref} type="text" value={value} onChange={onChange} onKeyPress={onKeyPress} />
    </Field>
  );
});

const FieldWrapper = styled.div<FieldBaseProps>`
  display: ${(p) => (p.horizontal ? 'flex' : 'block')};
  margin-bottom: ${(p) => (p.horizontal ? 0 : p.theme.spacer.xs)}rem;
  align-items: center;

  label {
    display: ${(p) => (p.horizontal ? 'inline-block' : 'block')};
    margin-bottom: ${(p) => (p.horizontal ? 0 : p.theme.spacer.sm)}rem;
    margin-right: ${(p) => (p.horizontal ? p.theme.spacer.sm : 0)}rem;
  }

  input[type='checkbox'] + label,
  span.checkbox + label {
    margin-left: ${(p) => p.theme.spacer.sm}rem;
    margin-bottom: 0;
    display: inline-block;
  }

  input[type='text'] {
    background: ${(p) => p.theme.color.bg.light};
    padding: ${(p) => p.theme.spacer.xs}rem ${(p) => p.theme.spacer.sm}rem;
    border: 1px solid ${(p) => p.theme.color.border.light};
    border-radius: 0.25rem;
  }

  span.checkbox {
    width: 1.25rem;
    height: 1.25rem;
    line-height: 1.25rem;
    display: inline-block;
    border-radius: 0.125rem;
    text-align: center;
    background: ${(p) => p.theme.color.bg.light};
    border: 1px solid ${(p) => p.theme.color.border.light};
  }

  &.field-checkbox {
    margin-bottom: ${(p) => p.theme.spacer.xs}rem;
    cursor: pointer;
    label {
      cursor: pointer;
    }
  }

  &.active {
    span.checkbox.checked {
      color: #fff;
      border-color: transparent;
      background-color: ${(p) => p.theme.color.bg.blue};
    }

    &.status-running span.checkbox.checked {
      background-color: ${(p) => p.theme.color.bg.yellow};
    }
    &.status-failed span.checkbox.checked {
      background: ${(p) => p.theme.color.bg.red};
    }
    &.status-completed span.checkbox.checked {
      background: ${(p) => p.theme.color.bg.green};
    }
  }

  input,
  select {
    border: 0;
  }
`;
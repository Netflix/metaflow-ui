import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import Icon from '../Icon';
import Spinner from '../Spinner';
import Dropdown from './Dropdown';
import { ForceNoWrapText } from '../Text';

//
// Base field
//

export type CommonFieldProps<T> = {
  className?: string;
  horizontal?: boolean;
  active?: boolean;
  value?: string;
  onClick?: (e?: React.MouseEvent<T>) => void;
  onChange?: (e?: React.ChangeEvent<T>) => void;
  onKeyPress?: (e: React.KeyboardEvent<T>) => void;
  onKeyDown?: (e: React.KeyboardEvent<T>) => void;
  onKeyUp?: (e: React.KeyboardEvent<T>) => void;
  'data-testid'?: string;
};

type FieldBaseProps = CommonFieldProps<HTMLDivElement> & {
  children: ReactNode;
  type: string;
  noMinWidth?: boolean;
};

export const Field: React.FC<FieldBaseProps> = ({
  children,
  type,
  className,
  horizontal,
  active,
  onClick,
  noMinWidth,
  ...rest
}) => {
  const testid = rest['data-testid'];
  return (
    <FieldWrapper
      {...{
        className: `field field-${type} ${className} ${active ? 'active' : ''}`,
        horizontal,
        active,
        type,
        onClick,
        noMinWidth,
      }}
      data-testid={testid}
    >
      {children}
    </FieldWrapper>
  );
};

//
// Dropdown
//

export const DropdownField: React.FC<
  {
    label?: string;
    options: [string, string][];
    disabled?: boolean;
    noMinWidth?: boolean;
    maxWidth?: boolean;
    labelRenderer?: (value: string, label: string) => JSX.Element;
    optionRenderer?: (value: string, label: string) => JSX.Element;
    onClose?: () => void;
  } & CommonFieldProps<HTMLSelectElement>
> = ({ label, options, horizontal, noMinWidth, ...rest }) => {
  const [id] = useState(uuid());
  const testid = rest['data-testid'];

  return (
    <Field horizontal={horizontal} type="select" data-testid={testid} noMinWidth={noMinWidth}>
      {label && <DropdownLabelTitle>{label}</DropdownLabelTitle>}
      <Dropdown id={id} options={options} {...rest} />
    </Field>
  );
};

//
// Checkbox
//

export const CheckboxField: React.FC<{ label: string; checked: boolean } & CommonFieldProps<HTMLInputElement>> = ({
  label,
  checked = false,
  onChange,
  className,
  ...rest
}) => {
  const [id] = useState(uuid());
  const testid = rest['data-testid'];
  return (
    <Field
      data-testid={testid}
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

//
// TextInput
//

export const TextInputField = React.forwardRef<
  HTMLInputElement,
  {
    label?: string;
    defaultValue?: string;
    placeholder?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    loading?: boolean;
    async?: boolean;
  } & CommonFieldProps<HTMLInputElement>
>(
  (
    {
      label,
      horizontal,
      value,
      placeholder,
      defaultValue,
      autoFocus,
      onChange,
      onClick,
      onKeyPress,
      disabled,
      loading,
      async,
      ...rest
    },
    ref,
  ) => {
    const [id] = useState(uuid());
    const { 'data-testid': testid, ...props } = rest;
    const valueProps = defaultValue ? { defaultValue } : { value };

    return (
      <Field horizontal={horizontal} type="text" data-testid={testid}>
        {label && <label htmlFor={id}>{label}</label>}
        {async && (
          <InputLoader visible={loading || false}>
            <Spinner />
          </InputLoader>
        )}
        <input
          id={id}
          ref={ref}
          type="text"
          placeholder={placeholder}
          {...valueProps}
          onChange={onChange}
          onClick={onClick}
          onKeyPress={onKeyPress}
          autoFocus={autoFocus}
          disabled={disabled}
          {...props}
        />
      </Field>
    );
  },
);

//
// Style
//

const InputLoader = styled.div<{ visible: boolean }>`
  position: absolute;
  right: 0.3125rem;
  top: 0.3125rem;

  opacity: ${(p) => (p.visible ? '1' : '0')};
  transition: 0.15s opacity;
`;

const FieldWrapper = styled.div<FieldBaseProps>`
  display: ${(p) => (p.horizontal ? 'flex' : 'block')};
  margin-bottom: ${(p) => (p.horizontal ? 0 : p.theme.spacer.xs)}rem;
  align-items: center;
  width: ${(p) => (p.noMinWidth ? '100%' : 'auto')};
  position: relative;

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

  input[type='text'],
  select {
    width: 100%;
    min-width: ${(p) => (p.noMinWidth ? 'none' : '9.375rem')};
    border-radius: 0.25rem;
    outline: 0;
    line-height: 1.25rem;
    padding: ${(p) => p.theme.spacer.xs}rem ${(p) => p.theme.spacer.sm}rem;
  }

  input[type='text'] {
    border: ${(p) => p.theme.border.thinNormal};

    &:focus,
    &:not(:disabled):hover {
      background: ${(p) => p.theme.color.bg.white};
    }
  }

  span.checkbox {
    width: 1.25rem;
    height: 1.25rem;
    line-height: 1.25rem;
    display: inline-block;
    border-radius: 0.125rem;
    text-align: center;
    background: ${(p) => p.theme.color.bg.light};
    border: ${(p) => p.theme.border.thinNormal};
  }

  &.field-checkbox {
    margin-bottom: 0.4rem;
    cursor: pointer;
    label {
      cursor: pointer;
    }
  }

  &.active {
    span.checkbox.checked {
      color: ${(p) => p.theme.color.text.white};
      border-color: ${(p) => p.theme.color.bg.blue};
      color: ${(p) => p.theme.color.bg.blue};
      background: ${(p) => p.theme.color.bg.white};
    }

    &.status-running span.checkbox.checked {
      border-color: ${(p) => p.theme.color.bg.yellow};
      color: ${(p) => p.theme.color.bg.yellow};
    }
    &.status-failed span.checkbox.checked {
      border-color: ${(p) => p.theme.color.bg.red};
      color: ${(p) => p.theme.color.bg.red};
    }
    &.status-completed span.checkbox.checked {
      border-color: ${(p) => p.theme.color.bg.green};
      color: ${(p) => p.theme.color.bg.green};
    }
  }

  input,
  select {
    border: 0;
  }
`;

const DropdownLabelTitle = styled(ForceNoWrapText)`
  background: #fff;
  font-size: 0.625rem;
  font-weight: bold;
  left: 0.75rem;
  margin-right: 0.3125rem;
  padding: 0 0.25rem;
  position: absolute;
  top: -0.375rem;
  z-index: 1;
`;

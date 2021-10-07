import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Icon from '../Icon';
import Button from '../Button';
import InputWrapper from './InputWrapper';
import { InputLabel } from './InputLabel';
import { PopoverWrapper } from '../Popover';
import useOnKeyPress from '../../hooks/useOnKeyPress';

type DropdownProps = {
  id?: string;
  // [value, label]
  options: [string, string][];
  useNativeComponent?: boolean;
  label?: string;
  labelRenderer?: (value: string, label: string) => JSX.Element;
  optionRenderer?: (value: string, label: string) => JSX.Element;
  value?: string;
  size?: 'sm' | 'md';
  optionsAlignment?: 'left' | 'right';
  onClose?: () => void;
  onChange?: (e?: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  useNativeComponent = false,
  onChange,
  value,
  labelRenderer,
  optionRenderer,
  children,
  onClose,
  label,
  size,
  optionsAlignment = 'right',
  ...rest
}) => {
  const selectEl = useRef<HTMLSelectElement>(null);
  const [open, setOpen] = useState(false);
  const activeOption = getActiveOption(options, value);
  const acitveOptionId = activeOption[0];

  useOnKeyPress('Escape', () => setOpen(false));

  useEffect(() => {
    setOpen(false);
  }, [acitveOptionId]);

  useEffect(() => {
    if (!open && onClose) {
      onClose();
    }
  }, [open, onClose]);

  return (
    <InputWrapper active={open} size={size} data-testid="select-field">
      {label && (
        <InputLabel active={true} data-testid="select-label">
          {label}
        </InputLabel>
      )}
      <DropdownWrapper>
        <select
          style={{ display: useNativeComponent ? 'inline' : 'none' }}
          ref={selectEl}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
            onChange && onChange(event);
          }}
          value={value}
          {...rest}
        >
          {options.map((o, index) => (
            <option key={o[0] + index} value={o[0]}>
              {o[1]}
            </option>
          ))}
        </select>
        {!useNativeComponent && (
          <DropdownButton
            data-testid="select-open-button"
            className="dropdown-button"
            textOnly
            variant="text"
            size={size || 'md'}
            withIcon={size === 'sm' ? false : 'right'}
            onClick={() => {
              setOpen(true);
            }}
          >
            <span
              style={{
                width: '100%',
                textAlign: 'left',
              }}
            >
              {labelRenderer ? labelRenderer(activeOption[0], activeOption[1]) : activeOption[1]}
            </span>
            <Icon name="caretDown" padLeft customSize="1.25rem" rotate={open ? 180 : 0} />
          </DropdownButton>
        )}

        {open && (
          <>
            <PopupClickOverlay onClick={() => setOpen(false)} />
            <DropdownOptions show={open} alignment={optionsAlignment}>
              {children ||
                options.map((o) => {
                  const val = o[0];
                  const isSelected = val === value;
                  return (
                    <DropdownOption
                      data-testid={`option-${o[0]}`}
                      key={o[0]}
                      textOnly
                      variant={isSelected ? 'primaryText' : 'text'}
                      size="sm"
                      onClick={() => {
                        // Simulate native onChange event
                        if (selectEl.current) {
                          selectEl.current.value = val;
                          const event = document.createEvent('HTMLEvents');
                          event.initEvent('change', true, false);
                          selectEl.current.dispatchEvent(event);
                        }
                        setOpen(false);
                      }}
                    >
                      {optionRenderer ? optionRenderer(o[0], o[1]) : o[1]}
                    </DropdownOption>
                  );
                })}
            </DropdownOptions>
          </>
        )}
      </DropdownWrapper>
    </InputWrapper>
  );
};

//
// Utils
//

function getActiveOption(options: [string, string][], value: string | undefined): [string, string] {
  return options.length === 0 ? ['', ''] : options.find((o) => o[0] === value) || options[0];
}

//
// Styles
//

const DropdownWrapper = styled.div`
  position: relative;
  flex: auto;
  margin: 0 -1rem;
  padding: 0 0.75rem 0 1rem;

  select {
    width: 100%;
    border-radius: 0.25rem;
    outline: 0;
    line-height: 1.25rem;
    border: 0;
    padding: ${(p) => p.theme.spacer.xs}rem 0rem;
  }
`;

const DropdownButton = styled(Button)`
  border-radius: 0.25rem;
  height: ${(p) => (p.size ? '2rem' : '2.5rem')};
  line-height: 1rem;
  padding: 0.5rem 0rem 0.5rem 0rem;
  width: 100%;

  &:hover,
  &:focus {
    background: transparent;
  }
`;

const DropdownOptions = styled(PopoverWrapper)`
  position: absolute;
  width: 100%;
  min-width: 9.375rem;

  top: 100%;
  margin-top: 0.375rem;

  padding: 0.625rem;
  z-index: 999;
  white-space: nowrap;

  max-height: 80vh;
  overflow-y: auto;
`;

export const DropdownOption = styled(Button)`
  width: 100%;
`;

const PopupClickOverlay = styled.div`
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  z-index: 999;
`;

export default Dropdown;

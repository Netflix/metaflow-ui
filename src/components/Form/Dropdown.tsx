import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Icon from '../Icon';
import Button from '../Button';
import InputWrapper from './InputWrapper';
import { InputLabel } from './InputLabel';

type DropdownProps = {
  id?: string;
  options: [string, string][];
  useNativeComponent?: boolean;
  label?: string;
  labelRenderer?: (value: string, label: string) => JSX.Element;
  optionRenderer?: (value: string, label: string) => JSX.Element;
  value?: string;
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
  ...rest
}) => {
  const selectEl = useRef<HTMLSelectElement>(null);
  const [open, setOpen] = useState(false);
  const activeOption = getActiveOption(options, value);
  const acitveOptionId = activeOption[0];

  useEffect(() => {
    setOpen(false);
  }, [acitveOptionId]);

  useEffect(() => {
    if (!open && onClose) {
      onClose();
    }
  }, [open, onClose]);

  return (
    <InputWrapper active={open} data-testid="select-field">
      {label && <InputLabel active={true}>{label}</InputLabel>}
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
            className="dropdown-button"
            textOnly
            variant="text"
            size="sm"
            withIcon="right"
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
            <Icon name="arrowDown" padLeft />
          </DropdownButton>
        )}

        {open && (
          <>
            <DropdownOptions>
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
            <PopupClickOverlay onClick={() => setOpen(false)} />
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
  padding: 0 1rem;

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
  height: 2.5rem;
  line-height: 1rem;
  padding: 0.5rem 0rem 0.5rem 0rem;
  width: 100%;

  &:hover,
  &:focus {
    background: transparent;
  }

  svg path {
    fill: #fff;
  }
`;

const DropdownOptions = styled.div`
  position: absolute;
  width: 100%;
  min-width: 9.375rem;

  top: 110%;
  left: 0;

  padding: 0.625rem;
  background: ${(p) => p.theme.color.bg.white};
  border: ${(p) => p.theme.border.thinMid};
  z-index: 10;
  white-space: nowrap;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.06);

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
`;

export default Dropdown;

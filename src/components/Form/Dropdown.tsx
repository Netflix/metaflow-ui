import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Button from '@components/Button';
import { InputLabel } from '@components/Form/InputLabel';
import InputWrapper from '@components/Form/InputWrapper';
import Icon from '@components/Icon';
import { PopoverWrapper } from '@components/Popover';
import useOnKeyPress from '@hooks/useOnKeyPress';

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
  children?: React.ReactNode;
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
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
    if (!open) {
      setHighlightedIndex(-1);
    }
  }, [open, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen(true);
          return;
        }
      }

      if (open) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((i) => Math.min(i + 1, options.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((i) => Math.max(i - 1, 0));
        } else if ((e.key === 'Enter' || e.key === ' ') && highlightedIndex >= 0) {
          e.preventDefault();
          const val = options[highlightedIndex][0];
          if (selectEl.current) {
            selectEl.current.value = val;
            const event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, false);
            selectEl.current.dispatchEvent(event);
          }
          setOpen(false);
        }
      }
    },
    [open, highlightedIndex, options],
  );

  return (
    <InputWrapper active={open} size={size} data-testid="select-field">
      {label && (
        <InputLabel active={true} data-testid="select-label">
          {label}
        </InputLabel>
      )}
      <DropdownWrapper onKeyDown={handleKeyDown}>
        <select
          style={{ display: useNativeComponent ? 'inline' : 'none' }}
          ref={selectEl}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
            onChange && onChange(event);
          }}
          value={value}
          aria-label={label || 'Select option'}
          {...rest}
        >
          {options.map((o, index) => (
            <option key={o[0] + index} value={o[0]}>
              {o[1]}
            </option>
          ))}
        </select>
        {!useNativeComponent && (
          <DropdownTrigger aria-haspopup="listbox" aria-expanded={open} aria-label={label || 'Select option'}>
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
                  whiteSpace: 'nowrap',
                }}
              >
                {labelRenderer ? labelRenderer(activeOption[0], activeOption[1]) : activeOption[1]}
              </span>
              <Icon name="caretDown" padLeft customSize="1.25rem" rotate={open ? 180 : 0} />
            </DropdownButton>
          </DropdownTrigger>
        )}

        {open && (
          <>
            <PopupClickOverlay onClick={() => setOpen(false)} aria-hidden="true" />
            <DropdownOptions show={open} alignment={optionsAlignment} role="listbox" aria-label={label || 'Options'}>
              {children ||
                options.map((o, index) => {
                  const val = o[0];
                  const isSelected = val === value;
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <DropdownOptionItem
                      key={o[0]}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <DropdownOption
                        data-testid={`option-${o[0]}`}
                        textOnly
                        variant={isSelected ? 'primaryText' : 'text'}
                        size="sm"
                        className={isHighlighted ? 'highlighted' : ''}
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
                    </DropdownOptionItem>
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
    border-radius: var(--radius-primary);
    outline: 0;
    line-height: 1.25rem;
    border: 0;
    padding: var(--spacing-1) 0rem;
  }
`;

const DropdownTrigger = styled.div`
  display: flex;
  width: 100%;
`;

const DropdownOptionItem = styled.div``;

const DropdownButton = styled(Button)`
  border-radius: var(--radius-primary);
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
  min-width: var(--dropdown-options-min-width);

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

  &.highlighted {
    background: var(--color-bg-secondary);
  }
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

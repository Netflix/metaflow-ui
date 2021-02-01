import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Icon from '../../Icon';
import Button from '../../Button';

import { CommonFieldProps } from '../';

export const Dropdown: React.FC<
  {
    id?: string;
    options: [string, string][];
    useNativeComponent?: boolean;
    labelRenderer?: (value: string) => JSX.Element;
  } & CommonFieldProps<HTMLSelectElement>
> = ({ options, useNativeComponent = false, onChange, value, labelRenderer, ...rest }) => {
  const selectEl = useRef<HTMLSelectElement>(null);
  const [open, setOpen] = useState(false);
  const activeOption = options.find((o) => o[0] === value) || options[0];

  return (
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
        {options.map((o) => (
          <option key={o[0]} value={o[0]}>
            {o[1]}
          </option>
        ))}
      </select>
      {!useNativeComponent && (
        <DropdownButton
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
            {labelRenderer ? labelRenderer(activeOption[1]) : activeOption[1]}
          </span>
          <Icon name="arrowDown" padLeft />
        </DropdownButton>
      )}

      {open && (
        <>
          <DropdownOptions>
            {options.map((o) => {
              const val = o[0];
              const isSelected = val === value;
              return (
                <DropdownOption
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
                  {o[1]}
                </DropdownOption>
              );
            })}
          </DropdownOptions>
          <PopupClickOverlay onClick={() => setOpen(false)} />
        </>
      )}
    </DropdownWrapper>
  );
};

const DropdownWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownButton = styled(Button)`
  width: 100%;
  line-height: 1.5rem;
`;

const DropdownOptions = styled.div`
  position: absolute;
  width: 100%;
  min-width: 150px;

  top: 110%;
  left: 0;

  padding: 10px;
  background: ${(p) => p.theme.color.bg.white};
  border: ${(p) => p.theme.border.thinMid};
  z-index: 10;
  white-space: nowrap;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.06);
`;

const DropdownOption = styled(Button)`
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

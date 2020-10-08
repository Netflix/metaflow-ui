import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import Icon from '../Icon';
import { SectionHeader } from '../Structure';

const FilterInput: React.FC<{ onSubmit: (k: string) => void; sectionLabel: string }> = ({ onSubmit, sectionLabel }) => {
  const [hasFocus, setHasFocus] = useState(false);
  const [val, setVal] = useState('');
  const inputEl = useRef<HTMLInputElement>(null);

  return (
    <FilterInputWrapper
      active={hasFocus}
      onClick={() => {
        inputEl.current?.focus();
      }}
    >
      <FitlerInputContainer>
        <input
          ref={inputEl}
          placeholder={sectionLabel}
          value={val}
          onKeyPress={(e) => {
            if (e.charCode === 13 && e.currentTarget.value) {
              onSubmit(e.currentTarget.value);
              setVal('');
              setHasFocus(false);
            }
          }}
          onChange={(e) => {
            setVal(e.currentTarget.value);
          }}
          onFocus={() => {
            setHasFocus(true);
          }}
          onBlur={() => {
            setHasFocus(false);
          }}
        />
        <SubmitIconHolder
          focus={hasFocus}
          onClick={() => {
            if (inputEl?.current?.value) {
              onSubmit(inputEl.current.value);
              setVal('');
              setHasFocus(false);
            }
          }}
        >
          <Icon name="enter" size="xs" />
        </SubmitIconHolder>
      </FitlerInputContainer>
    </FilterInputWrapper>
  );
};

const FilterInputWrapper = styled(SectionHeader)<{ active: boolean }>`
  padding-bottom: 0.375rem;
  transition: border 0.15s;

  ${(p) => (p.active ? `border-bottom-color: ${p.theme.color.text.blue};` : '')}

  input {
    width: 100%;
    border: none;
    cursor: ${(p) => (p.active ? 'auto' : 'pointer')};
    background-color: transparent;
    &:focus {
      outline: none;
      border: none;
    }
  }
  cursor: ${(p) => (p.active ? 'auto' : 'pointer')};

  &:hover {
    background-color: ${(p) => (p.active ? 'transparent' : p.theme.color.bg.light)};
  }
`;

const FitlerInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SubmitIconHolder = styled.div<{ focus: boolean }>`
  position: absolute;
  right: 0;
  top: 0;
  line-height: 26px;
  opacity: ${(p) => (p.focus ? 1 : 0)};
  transition: opacity 0.15s;
  cursor: pointer;
`;

export default FilterInput;

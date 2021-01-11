import React, { useRef, useState } from 'react';
import styled, { css } from 'styled-components';
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
          onMouseDown={() => {
            if (inputEl?.current?.value) {
              onSubmit(inputEl.current.value);
              setVal('');
              setHasFocus(false);
            }
          }}
        >
          <Icon name={hasFocus ? 'enter' : 'plus'} size="xs" />
        </SubmitIconHolder>
      </FitlerInputContainer>
    </FilterInputWrapper>
  );
};

const FilterInputWrapper = styled(SectionHeader)<{ active: boolean }>`
  padding-bottom: 0.375rem;
  transition: border 0.15s;
  color: #333;

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

    &::placeholder {
      color: #333;
      opacity: 1;
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
  cursor: pointer;
  z-index: 10;

  &:hover {
    ${(p) =>
      p.focus
        ? css`
            svg path {
              stroke: ${p.theme.color.text.blue};
            }
          `
        : css`
            svg {
              color: ${p.theme.color.text.blue};
            }
          `}} 

  }
`;

export default FilterInput;

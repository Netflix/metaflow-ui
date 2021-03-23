import React, { useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import Icon from '../Icon';
import { ForceNoWrapText } from '../Text';

//
// Typedef
//

type FilterInputProps = { onSubmit: (k: string) => void; sectionLabel: string };

//
// Component
//

const FilterInput: React.FC<FilterInputProps> = ({ onSubmit, sectionLabel }) => {
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
      {sectionLabel && <LabelTitle active={hasFocus || val !== ''}>{sectionLabel}</LabelTitle>}
      <FitlerInputContainer>
        <input
          data-testid="filter-input-field"
          ref={inputEl}
          value={val}
          onKeyPress={(e) => {
            if (e.charCode === 13 && e.currentTarget.value) {
              onSubmit(e.currentTarget.value);
              setVal('');
              // Currently it feels more natural to keep the focus on the input when adding tags
              // Enable these if user feedback suggets that more conventional behaviour is wanted
              // setHasFocus(false);
              // e.currentTarget.blur();
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
          data-testid="filter-input-submit-button"
          focus={hasFocus}
          onMouseDown={() => {
            if (inputEl?.current?.value) {
              onSubmit(inputEl.current.value);
              setVal('');
              // Currently it feels more natural to keep the focus on the input when adding tags
              // Enable these if user feedback suggets that more conventional behaviour is wanted
              // setHasFocus(false);
              // inputEl.current.blur();
            }
          }}
        >
          <Icon name={hasFocus ? 'enter' : 'plus'} size="xs" />
        </SubmitIconHolder>
      </FitlerInputContainer>
    </FilterInputWrapper>
  );
};

//
// Styles
//

const FilterInputWrapper = styled.section<{ active: boolean }>`
  align-items: center;
  border: ${(p) => p.theme.border.thinLight};
  border-radius: 0.25rem;
  color: #333;
  display: flex;
  height: 2.5rem;
  padding: 0.5rem 1rem;
  position: relative;
  transition: border 0.15s;

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
      font-weight: 500;
      opacity: 1;
    }
  }
  cursor: ${(p) => (p.active ? 'auto' : 'pointer')};

  &:hover {
    border-color: ${(p) => (p.active ? p.theme.color.text.blue : '#333')};
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
  line-height: 1.625rem;
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

const LabelTitle = styled(ForceNoWrapText)<{ active: boolean }>`
  background: #fff;
  font-size: 0.875rem;
  font-weight: bold;
  padding: 0 0.25rem;
  position: absolute;
  top: 0;
  transition: all 125ms linear;

  ${(p) =>
    p.active
      ? css`
          transform: scale(0.75) translate(-0.625rem, -0.75rem);
        `
      : css`
          transform: scale(1) translate(-0.25rem, 0.75rem);
        `}
`;

export default FilterInput;

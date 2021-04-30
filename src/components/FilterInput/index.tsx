import React, { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import useAutoComplete, { AutoCompleteItem } from '../../hooks/useAutoComplete';
import Icon, { IconKeys, IconSizes } from '../Icon';
import AutoComplete from '../AutoComplete';
import { ForceNoWrapText } from '../Text';

//
// Typedef
//

export type InputAutocompleteSettings = {
  url: string;
  finder?: (item: AutoCompleteItem, input: string) => boolean;
  params?: (input: string) => Record<string, string>;
  preFetch?: boolean;
};

type FilterInputProps = {
  onSubmit: (k: string) => void;
  sectionLabel: string;
  onChange?: (k: string) => void;
  autoCompleteSettings?: InputAutocompleteSettings;
  autoCompleteEnabled?: (str: string) => boolean;
  initialValue?: string;
  autoFocus?: boolean;
  customIcon?: [IconKeys, IconSizes];
  noIcon?: boolean;
  noClear?: boolean;
};

//
// Component
//

const FilterInput: React.FC<FilterInputProps> = ({
  onSubmit,
  onChange,
  sectionLabel,
  autoCompleteSettings,
  autoCompleteEnabled,
  initialValue = '',
  autoFocus = false,
  noIcon = false,
  customIcon,
  noClear = false,
}) => {
  const [hasFocus, setHasFocus] = useState(false);
  const [val, setVal] = useState(initialValue);
  const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
  const [activeAutoCompleteOption, setActiveOption] = useState<string | null>(null);
  const inputEl = useRef<HTMLInputElement>(null);
  const autoCEnabled = autoCompleteSettings ? (autoCompleteEnabled ? autoCompleteEnabled(val) : true) : false;

  const autoCompleteResult = useAutoComplete<string>(
    autoCompleteSettings
      ? {
          ...autoCompleteSettings,
          params: autoCompleteSettings.params ? autoCompleteSettings.params(val) : {},
          input: val,
          enabled: autoCEnabled,
        }
      : { url: '', input: '', enabled: false },
  );
  useEffect(() => {
    let t: number | undefined = undefined;

    if (hasFocus && !autoCompleteOpen) {
      t = setTimeout(() => {
        setAutoCompleteOpen(true);
      }, 150);
    } else if (!hasFocus && autoCompleteOpen) {
      t = setTimeout(() => {
        setAutoCompleteOpen(false);
      }, 150);
    }

    return () => clearTimeout(t);
  }, [hasFocus, autoCompleteOpen]);

  return (
    <FilterInputWrapper
      active={hasFocus}
      onClick={() => {
        inputEl.current?.focus();
      }}
    >
      {sectionLabel && <LabelTitle active={hasFocus || val !== ''}>{sectionLabel}</LabelTitle>}
      <FilterInputContainer>
        <input
          data-testid="filter-input-field"
          ref={inputEl}
          value={val}
          autoFocus={autoFocus}
          onKeyPress={(e) => {
            if (e.charCode === 13 && e.currentTarget.value) {
              if (activeAutoCompleteOption) {
                onSubmit(activeAutoCompleteOption);
              } else {
                onSubmit(e.currentTarget.value);
              }
              if (!noClear) {
                setVal('');
              } else {
                setVal(activeAutoCompleteOption || e.currentTarget.value);
              }
              setActiveOption(null);
              // Currently it feels more natural to keep the focus on the input when adding tags
              // Enable these if user feedback suggets that more conventional behaviour is wanted
              // setHasFocus(false);
              // e.currentTarget.blur();
            }
          }}
          onChange={(e) => {
            setVal(e.currentTarget.value);
            onChange && onChange(e.currentTarget.value);
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
              if (!noClear) {
                setVal('');
              }
              // Currently it feels more natural to keep the focus on the input when adding tags
              // Enable these if user feedback suggets that more conventional behaviour is wanted
              // setHasFocus(false);
              // inputEl.current.blur();
            }
          }}
        >
          {!noIcon && (
            <Icon
              name={hasFocus ? 'enter' : customIcon ? customIcon[0] : 'search'}
              size={hasFocus || !customIcon ? 'xs' : customIcon[1]}
            />
          )}
        </SubmitIconHolder>
      </FilterInputContainer>
      {autoCompleteOpen && autoCompleteResult.data.length > 0 && val !== '' && autoCEnabled && (
        <AutoComplete
          result={autoCompleteResult.data}
          setActiveOption={(active) => {
            setActiveOption(active);
          }}
          onSelect={(selected) => {
            onSubmit(selected);
            if (!noClear) {
              setVal('');
              setHasFocus(false);
            } else {
              setVal(selected);
            }
            setActiveOption(null);
          }}
        />
      )}
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

const FilterInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SubmitIconHolder = styled.div<{ focus: boolean }>`
  position: absolute;
  right: 0;
  top: 0;
  line-height: 1.125rem;
  cursor: pointer;
  z-index: 10;

  i {
    margin: -0.125rem 0 0;
    vertical-align: middle;
  }

  .icon-enter svg {
    color: #fff;
  }

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
          transform: scale(1) translate(-0.25rem, 0.6875rem);
        `}
`;

export default FilterInput;

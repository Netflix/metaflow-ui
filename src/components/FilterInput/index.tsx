import React, { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import useAutoComplete, { AutoCompleteItem } from '../../hooks/useAutoComplete';
import Icon, { IconKeys, IconSizes } from '../Icon';
import AutoComplete from '../AutoComplete';
import { AsyncStatus } from '../../types';
import { InputLabel } from '../Form/InputLabel';
import InputWrapper from '../Form/InputWrapper';
import InputTip from '../Form/InputTip';

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
  status?: AsyncStatus;
  tip?: string;
  errorMsg?: string;
  inputType?: string;
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
  status = 'Ok',
  tip,
  errorMsg,
}) => {
  const [hasFocus, setHasFocus] = useState(false);
  const [val, setVal] = useState(initialValue);
  const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
  const [activeAutoCompleteOption, setActiveOption] = useState<string | null>(null);
  const inputEl = useRef<HTMLInputElement>(null);
  const autoCEnabled = autoCompleteSettings ? (autoCompleteEnabled ? autoCompleteEnabled(val) : true) : false;

  const {
    result: autoCompleteResult,
    reset: resetAutocomplete,
    refetch: refetchAutocomplete,
  } = useAutoComplete<string>(
    autoCompleteSettings
      ? {
          ...autoCompleteSettings,
          params: autoCompleteSettings.params ? autoCompleteSettings.params(val) : {},
          input: val,
          enabled: autoCEnabled,
        }
      : { url: '', input: '', enabled: false },
  );

  // Open or close autocomplete list with slight delay so click events gets registered
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    if (hasFocus && !autoCompleteOpen) {
      t = setTimeout(() => {
        setAutoCompleteOpen(true);
      }, 150);
    } else if (!hasFocus && autoCompleteOpen) {
      t = setTimeout(() => {
        setAutoCompleteOpen(false);
        resetAutocomplete();
      }, 150);
    }

    return () => clearTimeout(t);
  }, [hasFocus, autoCompleteOpen, resetAutocomplete]);

  return (
    <InputWrapper
      status={status}
      active={hasFocus}
      onClick={() => {
        inputEl.current?.focus();
      }}
    >
      {sectionLabel && (
        <InputLabel active={hasFocus || val !== ''} status={status}>
          {sectionLabel}
        </InputLabel>
      )}
      <FilterInputContainer>
        <input
          data-testid="filter-input-field"
          type="text"
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
              resetAutocomplete();
              // Currently it feels more natural to keep the focus on the input when adding tags
              // Enable these if user feedback suggets that more conventional behaviour is wanted
              // setHasFocus(false);
              // e.currentTarget.blur();
            }
          }}
          onChange={(e) => {
            setVal(e.currentTarget.value);
            onChange && onChange(e.currentTarget.value);
            if (!e.currentTarget.value || e.currentTarget.value === '') {
              resetAutocomplete();
            }
          }}
          onFocus={() => {
            setHasFocus(true);
            if (val) {
              refetchAutocomplete();
            }
          }}
          onBlur={() => {
            setHasFocus(false);
          }}
        />
        <SubmitIconHolder
          data-testid="filter-input-submit-button"
          status={status}
          focus={hasFocus}
          onMouseDown={() => {
            if (inputEl?.current?.value) {
              onSubmit(inputEl.current.value);
              if (!noClear) {
                setVal('');
              }
            }
          }}
        >
          {!noIcon && (
            <Icon
              name={hasFocus ? 'enter' : status === 'Error' ? 'danger' : customIcon ? customIcon[0] : 'plus'}
              size={hasFocus || !customIcon ? 'xs' : customIcon[1]}
            />
          )}
        </SubmitIconHolder>

        {tip && <InputTip visible={hasFocus && val === ''}>{tip}</InputTip>}
      </FilterInputContainer>
      {autoCompleteOpen && autoCompleteResult.data.length > 0 && val !== '' && autoCEnabled && (
        <AutoComplete
          result={autoCompleteResult.data}
          setActiveOption={(active) => {
            setActiveOption(active);
          }}
          onSelect={(selected) => {
            onSubmit(selected);
            resetAutocomplete();
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

      {status === 'Error' && errorMsg && <ErrorMsgContainer title={errorMsg}>{errorMsg}</ErrorMsgContainer>}
    </InputWrapper>
  );
};

//
// Styles
//

const FilterInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SubmitIconHolder = styled.div<{ focus: boolean; status: AsyncStatus }>`
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

  ${(p) =>
    p.status === 'Error' &&
    css`
      svg,
      svg path {
        stroke: ${(p) => p.theme.color.bg.red};
      }
    `}

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

const ErrorMsgContainer = styled.div`
  position: absolute;
  top: 100%;
  font-size: 0.75rem;
  color: ${(p) => p.theme.color.bg.red};
  padding-top: 0.25rem;
  width: 100%;
  left: 0;
  padding-left: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default FilterInput;

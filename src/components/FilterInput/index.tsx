import React, {
  ChangeEvent,
  ChangeEventHandler,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled, { css } from 'styled-components';
import { AsyncStatus } from '@/types';
import AutoComplete from '@components/AutoComplete';
import { InputLabel } from '@components/Form/InputLabel';
import InputTip from '@components/Form/InputTip';
import InputWrapper from '@components/Form/InputWrapper';
import Icon, { IconKeys, IconSizes } from '@components/Icon';
import useAutoComplete, { AutoCompleteItem } from '@hooks/useAutoComplete';

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
  customIconElement?: React.ReactNode;
  noIcon?: boolean;
  noClear?: boolean;
  status?: AsyncStatus;
  tip?: string;
  infoMsg?: string;
  errorMsg?: string;
  inputType?: string;
};

//
// Input field with bunch of features like autocomplete.
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
  customIconElement,
  noClear = false,
  status = 'Ok',
  tip,
  infoMsg,
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

  const handleKeyPress: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.charCode === 13 && e?.currentTarget?.value) {
        if (activeAutoCompleteOption) {
          onSubmit(activeAutoCompleteOption);
        } else {
          onSubmit(e.currentTarget?.value);
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
    },
    [activeAutoCompleteOption, noClear, onSubmit, resetAutocomplete],
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value);
      onChange && onChange(e.currentTarget.value);
      if (!e.currentTarget.value || e.currentTarget.value === '') {
        resetAutocomplete();
      }
    },
    [onChange, resetAutocomplete],
  );
  const handleFocus = useCallback(() => {
    setHasFocus(true);
    if (val) {
      refetchAutocomplete();
    }
  }, [refetchAutocomplete, val]);

  const handleBlur = useCallback(() => {
    setHasFocus(false);
  }, []);

  const handleClick = useCallback(() => {
    inputEl.current?.focus();
  }, []);

  const handleMouseDown = useCallback(() => {
    if (inputEl?.current?.value) {
      onSubmit(inputEl.current.value);
      if (!noClear) {
        setVal('');
      }
    }
  }, [noClear, onSubmit]);

  return (
    <InputWrapper status={status} active={hasFocus} onClick={handleClick}>
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
          onKeyPress={handleKeyPress}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        <SubmitIconHolder
          data-testid="filter-input-submit-button"
          status={status}
          focus={hasFocus}
          onMouseDown={handleMouseDown}
        >
          {customIconElement
            ? customIconElement
            : !noIcon && (
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

      {status !== 'Error' && infoMsg && hasFocus && <InfoMsgContainer title={infoMsg}>{infoMsg}</InfoMsgContainer>}
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
        stroke: var(--color-bg-danger);
      }
    `}

  &:hover {
    ${(p) =>
      p.focus
        ? css`
            svg path {
              stroke: var(--color-text-highlight);
            }
          `
        : css`
            svg {
              color: var(--color-text-highlight);
            }
          `}} 

  }
`;

const InfoMsgContainer = styled.div`
  color: var(--color-bg-heavy);
  font-size: 0.5rem;
  font-weight: 500;
  left: 0;
  overflow: hidden;
  padding: 0.25rem 0 0 1rem;
  position: absolute;
  text-overflow: ellipsis;
  top: 100%;
  white-space: nowrap;
  width: 100%;
`;

const ErrorMsgContainer = styled.div`
  color: var(--color-bg-danger);
  font-size: 0.5rem;
  font-weight: 500;
  left: 0;
  overflow: hidden;
  padding: 0.25rem 0 0 1rem;
  position: absolute;
  text-overflow: ellipsis;
  top: 100%;
  white-space: nowrap;
  width: 100%;
`;

export default FilterInput;

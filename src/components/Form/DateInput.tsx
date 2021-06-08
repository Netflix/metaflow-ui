import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { isFirefox } from '../../utils/browser';
import { InputLabel } from './InputLabel';
import InputWrapper from './InputWrapper';
import InputTip from './InputTip';

//
// Typedef
//

type DateInputProps = {
  onSubmit: (k: string) => void;
  label: string;
  onChange?: (k: string) => void;
  initialValue?: string;
  tip?: string;
  inputType?: 'date' | 'datetime-local';
};

//
// Component
//

const DateInput: React.FC<DateInputProps> = ({
  onSubmit,
  onChange,
  label,
  initialValue = '',
  tip,
  inputType = 'date',
}) => {
  const [hasFocus, setHasFocus] = useState(false);
  const [val, setVal] = useState(getInitialValue(inputType, initialValue));
  const inputEl = useRef<HTMLInputElement>(null);

  return (
    <InputWrapper
      active={hasFocus}
      onClick={() => {
        inputEl.current?.focus();
      }}
    >
      {label && <InputLabel active={true}>{label}</InputLabel>}
      <DateInputContainer>
        <input
          data-testid="filter-input-field"
          type={inputType}
          ref={inputEl}
          value={val}
          onKeyPress={(e) => {
            if (e.charCode === 13 && e.currentTarget.value) {
              onSubmit(e.currentTarget.value);
              setVal(e.currentTarget.value);
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
          {...getInputProps(inputType)}
        />

        {tip && <InputTip visible={hasFocus && val === ''}>{tip}</InputTip>}
      </DateInputContainer>
    </InputWrapper>
  );
};

//
// Utils
//

function getInitialValue(inputType: string, initialValue: string) {
  // Lets hide T from date format on firefox since it doesnt support native datetime fields.
  if (inputType === 'datetime-local' && isFirefox && initialValue) {
    return initialValue.replace('T', ' ');
  }
  return initialValue;
}

function getInputProps(inputType: string): Record<string, string | number> {
  if (inputType === 'datetime-local') {
    return { max: '9999-12-31T23:59' };
  } else if (inputType === 'date') {
    return { max: '9999-12-31' };
  }
  return {};
}

//
// Stlyyes
//

const DateInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

export default DateInput;

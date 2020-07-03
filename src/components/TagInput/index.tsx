import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Popover from '../Popover';
import Icon from '../Icon';
import { TextInputField } from '../Form';

const TagInputWrapper = styled.div`
  position: relative;

  .popover {
    left: 120%;
    top: -0.5rem;
    display: flex;
    align-items: center;

    input {
      margin-right: ${(p) => p.theme.spacer.sm}rem;
    }

    &.hide {
      display: none;
    }
  }
`;

const TagInput: React.FC<{ onSubmit: (k: string) => void }> = ({ onSubmit }) => {
  const [formActive, setFormActive] = useState(false);
  const [val, setVal] = useState('');
  const inputEl = useRef<HTMLInputElement>(null);

  const handleSubmit = (v: string, closeForm = true) => {
    onSubmit(v);
    closeForm && setFormActive(false);
    setVal('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement> | undefined) => {
    if (e && e.charCode === 13) handleSubmit(val, !e.shiftKey);
  };

  const handleFormActivation = () => {
    setFormActive(!formActive);
    setTimeout(() => inputEl.current && inputEl.current.focus(), 0);
  };

  return (
    <TagInputWrapper>
      <button onClick={handleFormActivation} className={formActive ? 'active' : ''}>
        <Icon name={formActive ? 'times' : 'plus'} />
      </button>
      <Popover show={formActive}>
        <TextInputField
            value={val}
            ref={inputEl}
            onChange={(e) => e && setVal(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e)}
          />
        <button onClick={() => handleSubmit(val)}>Add</button>
      </Popover>
    </TagInputWrapper>
  );
};

export default TagInput;

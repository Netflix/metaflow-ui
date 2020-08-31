import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Popover from '../Popover';
import Icon from '../Icon';
import Button from '../Button';
import { TextInputField } from '../Form';
import { SectionHeader, SectionHeaderContent } from '../Structure';

const TagInputWrapper = styled.div`
  position: relative;

  .popover {
    left: 120%;
    top: -0.55rem;
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

const TagInput: React.FC<{ onSubmit: (k: string) => void; sectionLabel: string }> = ({ onSubmit, sectionLabel }) => {
  const [formActive, setFormActive] = useState(false);
  const [val, setVal] = useState('');
  const inputEl = useRef<HTMLInputElement>(null);

  const handleSubmit = (v: string, closeForm = true) => {
    if (v.length < 1) return;
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
    <TagInputHeader
      onClick={() => {
        if (!formActive) {
          setFormActive(true);
          setTimeout(() => inputEl.current && inputEl.current.focus(), 0);
        }
      }}
    >
      {sectionLabel}
      <SectionHeaderContent align="right">
        <TagInputWrapper>
          <Button onClick={handleFormActivation} active={formActive} iconOnly data-testid="tag-input-activate-button">
            <Icon name={formActive ? 'times' : 'plus'} />
          </Button>
          <Popover show={formActive}>
            <TextInputField
              data-testid="tag-input-textarea"
              horizontal
              autoFocus
              value={val}
              ref={inputEl}
              onChange={(e) => e && setVal(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e)}
            />
            <Button onClick={() => handleSubmit(val)} data-testid="tag-input-add-button">
              Add
            </Button>
          </Popover>
        </TagInputWrapper>
      </SectionHeaderContent>
      {formActive && <TagInputPopupOutsideClickDetector onClick={() => setFormActive(false)} />}
    </TagInputHeader>
  );
};

const TagInputPopupOutsideClickDetector = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  zindex: 10;
`;

const TagInputHeader = styled(SectionHeader)`
  padding-bottom: 0.375rem;
`;

export default TagInput;

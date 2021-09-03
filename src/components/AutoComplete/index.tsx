import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AutoCompleteItem } from '../../hooks/useAutoComplete';
import { PopoverStyles } from '../Popover';

//
// Typedef
//

type Props = {
  result: AutoCompleteItem[];
  setActiveOption: (item: string | null) => void;
  onSelect: (item: string) => void;
};

//
// Render list of autocomplete items in fixed popup container.
// Active item can be changed with up and down arrows.
//

const AutoComplete: React.FC<Props> = ({ result, setActiveOption, onSelect }) => {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && active < (4 < result.length ? 4 : result.length)) {
        setActive((a) => a + 1);
      } else if (e.key === 'ArrowUp' && active > -1) {
        setActive((a) => a - 1);
      }
    };
    window.addEventListener('keyup', listener);
    return () => window.removeEventListener('keyup', listener);
  });

  useEffect(() => {
    setActiveOption(result[active]?.value || null);
  }, [active]); // eslint-disable-line

  useEffect(() => {
    setActive(-1);
  }, [result]);

  return (
    <AutoCompletePopup
      data-testid="autocomplete-popup"
      onMouseOut={() => {
        setActive(-1);
      }}
    >
      {result.slice(0, 5).map((item, index) => (
        <AutoCompleteLine
          key={item.value}
          active={index === active}
          onMouseDown={() => {
            onSelect(item.value);
          }}
          onMouseOver={() => {
            setActive(index);
          }}
        >
          {item.label}
        </AutoCompleteLine>
      ))}
    </AutoCompletePopup>
  );
};

//
// Styles
//

const AutoCompletePopup = styled.div`
  ${PopoverStyles};
  position: absolute;
  top: 100%;
  margin-top: 0.375rem;
  left: 0;
  width: 100%;
  word-break: break-all;
  z-index: 999;
`;

export const AutoCompleteLine = styled.div<{ active: boolean }>`
  padding: 8px 0;
  cursor: pointer;
  color: ${(p) => (p.active ? p.theme.color.text.blue : p.theme.color.text.dark)};
`;

export default AutoComplete;

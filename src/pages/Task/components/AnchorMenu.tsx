import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { HEADER_SIZE_PX } from '../../../constants';

//
// Anchor menu
//

type AnchorItem = {
  key: string;
  label: string;
  position?: number;
};

type AnchorMenuProps = {
  items: AnchorItem[];
  setSection: (value: string | null) => void;
  activeSection: string | null | undefined;
};

const AnchorMenu: React.FC<AnchorMenuProps> = ({ items, activeSection, setSection }) => {
  const [active, setActive] = useState<string | undefined>(activeSection || items[0]?.key);
  const [initialised, setInitialised] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = () => {
      const current = [...items]
        .reverse()
        .find((item) => item.position && item.position < window.scrollY + HEADER_SIZE_PX + 20);
      setActive((current && current.key) || items[0]?.key);
      const newKey = (current && current.key) || null;
      if (activeSection !== newKey) {
        setSection(newKey);
      }
    };

    window.addEventListener('scroll', listener);
    return () => window.removeEventListener('scroll', listener);
  }, [items, setSection, activeSection]); // eslint-disable-line

  useEffect(() => {
    if (activeSection) {
      const s = items.find((item) => item.key === activeSection);

      if (s && s.position && !initialised) {
        window.scrollTo({ top: s.position - HEADER_SIZE_PX + 2, behavior: 'smooth' });
        setInitialised(true);
      }
    } else {
      setInitialised(true);
    }
  }, [items, activeSection, initialised]);

  return (
    <AnchorMenuContainer ref={ref}>
      <div style={{ position: 'sticky', top: HEADER_SIZE_PX + 'px' }}>
        {items.map(({ key, label, position }) => (
          <AnchorMenuItem
            key={key}
            active={key === active}
            onClick={() => {
              if (position) {
                window.scroll({ top: position - HEADER_SIZE_PX + 2 });
                setSection(key);
                setActive(key);
              }
            }}
          >
            {label}
          </AnchorMenuItem>
        ))}
      </div>
    </AnchorMenuContainer>
  );
};

const AnchorMenuContainer = styled.div`
  width: 165px;
  flex-shrink: 0;
  position: relative;
`;

const AnchorMenuItem = styled.div<{ active?: boolean }>`
  cursor: pointer;
  line-height: 2rem;
  padding: 0 1rem;
  margin-bottom 0.5rem;
  border-left: 2px solid ${(p) => (p.active ? p.theme.color.text.blue : p.theme.color.border.light)};
  transition: 0.15s border;
`;

export default AnchorMenu;

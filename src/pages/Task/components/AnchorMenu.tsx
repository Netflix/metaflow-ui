import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { getHeaderSizePx } from '../../../utils/style';

//
// Anchor menu
//

type AnchorItem = {
  key: string;
  label: React.ReactNode | string;
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
  const headerSize = getHeaderSizePx();

  useEffect(() => {
    const listener = () => {
      const current = [...items]
        .reverse()
        .find((item) => item.position && item.position < window.scrollY + headerSize + 20);
      setActive((current && current.key) || items[0]?.key);
      const newKey = (current && current.key) || null;
      if (activeSection !== newKey) {
        setSection(newKey);
      }
    };

    window.addEventListener('scroll', listener);
    return () => window.removeEventListener('scroll', listener);
  }, [items, setSection, activeSection, headerSize]);

  useEffect(() => {
    if (activeSection) {
      const s = items.find((item) => item.key === activeSection);

      if (s && s.position && !initialised) {
        window.scrollTo({ top: s.position - headerSize + 2, behavior: 'smooth' });
        setInitialised(true);
      }
    } else {
      setInitialised(true);
    }
  }, [items, activeSection, initialised, headerSize]);

  return (
    <AnchorMenuContainer ref={ref}>
      <div style={{ position: 'sticky', top: headerSize + 'px' }}>
        {items.map(({ key, label, position }) => (
          <AnchorMenuItem
            key={key}
            active={key === active}
            onClick={() => {
              if (position) {
                window.scroll({ top: position - headerSize + 2 });
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
  padding-top: 0.75rem;
  width: 6.25rem;
  flex-shrink: 0;
  position: relative;
`;

const AnchorMenuItem = styled.div<{ active?: boolean }>`
  cursor: pointer;
  font-size: var(--font-size-primary);
  padding: 0.5rem 1rem;
  margin-bottom 0.5rem;
  border-left: 2px solid ${(p) => (p.active ? 'var(--color-text-highlight)' : 'var(--color-border-1)')};
  transition: 0.15s border;
  word-break: break-word;
`;

export default AnchorMenu;

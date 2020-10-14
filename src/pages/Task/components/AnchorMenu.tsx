import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

//
// Anchor menu
//

const HEADER_SIZE_PX = 112;

type AnchorItem = {
  key: string;
  label: string;
  position?: number;
};

type AnchorMenuProps = {
  items: AnchorItem[];
};

const AnchorMenu: React.FC<AnchorMenuProps> = ({ items }) => {
  const [viewScrollTop, setScrollTop] = useState(0);
  const [active, setActive] = useState<string | undefined>(items[0]?.key);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = () => {
      setScrollTop(window.scrollY);
      const current = [...items]
        .reverse()
        .find((item) => item.position && item.position < window.scrollY + HEADER_SIZE_PX + 20);
      setActive((current && current.key) || items[0]?.key);
    };

    window.addEventListener('scroll', listener);

    return () => window.removeEventListener('scroll', listener);
  }, [items]);

  const isScrolledOver = ref && ref.current && viewScrollTop + HEADER_SIZE_PX > ref.current.offsetTop;

  return (
    <AnchorMenuContainer ref={ref}>
      <div
        style={
          // Adding header height here manually. We need to think it makes sense to have sticky header
          isScrolledOver ? { position: 'fixed', top: HEADER_SIZE_PX + 'px' } : {}
        }
      >
        {items.map(({ key, label, position }) => (
          <AnchorMenuItem
            key={key}
            active={key === active}
            onClick={() => {
              if (position) {
                window.scroll({ top: position - HEADER_SIZE_PX + 2 });
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

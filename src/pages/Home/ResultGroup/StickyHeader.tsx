import React, { useEffect, useState } from 'react';
import { HEADER_SIZE_PX } from '../../../constants';
import styled from 'styled-components';

type Props = {
  tableRef: React.RefObject<HTMLTableElement>;
};

const StickyHeader: React.FC<Props> = ({ tableRef, children }) => {
  const scrollState = useState(0);
  const rect = tableRef.current?.getBoundingClientRect();

  useEffect(() => {
    const listener = () => {
      scrollState[1](window.scrollY);
    };

    window.addEventListener('scroll', listener);

    return () => window.removeEventListener('scroll', listener);
  }, []); // eslint-disable-line

  const isSticky = headerShouldStick(rect);

  return (
    <StickyHeaderTHead
      className={isSticky ? 'sticky' : ''}
      style={isSticky ? { transform: `translateY(${headerTopValue(rect)}px)` } : {}}
    >
      {children}
    </StickyHeaderTHead>
  );
};

function headerShouldStick(rect: DOMRect | undefined) {
  if (rect && rect.y < HEADER_SIZE_PX && rect.y + rect.height > 84) {
    return true;
  }
  return false;
}

function headerTopValue(rect: DOMRect | undefined) {
  if (rect) {
    const baseValueFromTop = -(rect.y - HEADER_SIZE_PX);
    // If table is on top, but rows are no longer visible, header should start "floating" on top of next
    // table instead of going over it.
    const floatingValueWhenOnTop = rect.y + rect.height < 160 ? 160 - (rect.y + rect.height) : 0;

    return baseValueFromTop - floatingValueWhenOnTop;
  }
  return 0;
}

const StickyHeaderTHead = styled.thead`
  position: relative;
  z-index: 12;
`;

export default StickyHeader;

import React, { useEffect, useState } from 'react';
import { HEADER_SIZE_PX } from '../../../constants';
import styled from 'styled-components';

//
// Typedef
//

type Props = {
  tableRef: React.RefObject<HTMLTableElement>;
};

//
// Component
//

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

  return <StickyHeaderTHead className={isSticky ? 'sticky' : ''}>{children}</StickyHeaderTHead>;
};

//
// Utils
//

function headerShouldStick(rect: DOMRect | undefined) {
  if (rect && rect.y < HEADER_SIZE_PX && rect.y + rect.height > 84) {
    return true;
  }
  return false;
}

//
// Styles
//

const StickyHeaderTHead = styled.thead`
  position: relative;
  z-index: 12;
  th {
    position: sticky;
  }

  .result-group-title th {
    top: ${HEADER_SIZE_PX}px;
  }

  .result-group-columns th {
    top: ${HEADER_SIZE_PX + 56}px;
`;

export default StickyHeader;

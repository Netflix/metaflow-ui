import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getHeaderSizePx } from '@utils/style';

//
// Typedef
//

type Props = {
  tableRef: React.RefObject<HTMLTableElement>;
  children: React.ReactNode;
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
  }, [scrollState]);

  const isSticky = headerShouldStick(rect);

  return <StickyHeaderTHead className={isSticky ? 'sticky' : ''}>{children}</StickyHeaderTHead>;
};

//
// Utils
//

function headerShouldStick(rect: DOMRect | undefined) {
  if (rect && rect.y < getHeaderSizePx() && rect.y + rect.height > 84) {
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
    top: var(--layout-application-bar-height);
  }

  .result-group-columns th {
    top: var(--layout-application-bar-height);
  }

  .result-group-title + .result-group-columns {
    th {
      top: calc(var(--layout-application-bar-height) + 2.5rem);
    }
  }

  &.sticky {
    th:first-child,
    th:last-child {
      border-top-left-radius: 0px;
      border-top-right-radius: 0px;
    }
  }
`;

export default StickyHeader;

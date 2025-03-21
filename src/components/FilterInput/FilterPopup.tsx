import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { PopoverStyles } from '../Popover';

const FilterPopup: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const clickedParentOrPopup =
        ref.current && event.target instanceof Node && ref.current.parentNode?.contains(event.target);
      if (!clickedParentOrPopup) {
        onClose();
      }
    }
    document.addEventListener('mouseup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [ref, onClose]);

  return <FilterPopupBase ref={ref}>{children}</FilterPopupBase>;
};

const FilterPopupBase = styled.div`
  ${PopoverStyles}
  position: absolute;
  top: 100%;
  margin-top: 0.375rem;
  left: 0;
  z-index: 999;
  min-width: 12.5rem;
  max-width: 18.75rem;
`;

export default FilterPopup;

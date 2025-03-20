import React from 'react';
import ReactTooltip, { TooltipProps } from 'react-tooltip';
import styled from 'styled-components';

//
// Component
// Basically custom styles wrapper for react-tooltip. Use by giving the trigger component data-tip and data-for=[name]
// attributes and then giving id=[name] for Tooltip component. eg:
//
// <button data-tip data-for="my-tooltip">This has tooltip</button>
// <Tooltip id="my-tooltip">Tooltip content</Tooltip>
//

const Tooltip: React.FC<TooltipProps> = ({ children, ...props }) => {
  return (
    <CustomTooltip>
      <ReactTooltip
        className="custom-tooltip"
        delayHide={250}
        place="bottom"
        effect="solid"
        arrowColor="transparent"
        {...props}
      >
        {children}
      </ReactTooltip>
    </CustomTooltip>
  );
};

//
// Custom styles
//

const CustomTooltip = styled.div`
  .custom-tooltip {
    cursor: auto;
    max-width: 37.5rem;
    padding: 0.25rem 0.5rem;
    background: #31302fe5;
    color: #fff;
    font-size: 0.75rem;
    border-radius: var(--radius-primary);
    white-space: pre;
    pointer-events: auto;

    &::before {
      display: none;
    }

    &.show {
      opacity: 1;
    }

    &:hover {
      visibility: visible;
      opacity: 1;
    }
  }
`;

//
// Very basic title
//

export const TooltipTitle = styled.div`
  margin-bottom 0.5rem;
  font-weight: 500;
`;

export default Tooltip;

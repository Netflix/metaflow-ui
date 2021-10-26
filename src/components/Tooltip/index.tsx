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
      <ReactTooltip className="custom-tooltip" delayHide={250} place="bottom" effect="solid" {...props}>
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
    background: #fff;
    color: #333;
    padding: 1rem;
    font-size: 0.75rem;
    border-radius: 0.25rem;
    border: 1px solid #d0d0d0;
    box-shadow: 2px 2px 4px rgb(0 0 0 / 25%);
    white-space: pre;
    pointer-events: auto;

    &.show {
      opacity: 1;
    }

    &.place-bottom::before {
      border-bottom: 7px solid #d0d0d0;
      top: -7px;
    }

    &.place-bottom::after {
      border-bottom-color: #fff;
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

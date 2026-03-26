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
    background: var(--tooltip-surface-bg);
    color: var(--tooltip-surface-text);
    padding: 1rem;
    font-size: 0.75rem;
    border-radius: var(--radius-primary);
    border: var(--tooltip-surface-border);
    box-shadow: var(--tooltip-surface-shadow);
    white-space: pre;
    pointer-events: auto;

    &.show {
      opacity: 1;
    }

    &.place-bottom::after,
    &.place-top::after {
      border-bottom-color: var(--tooltip-surface-bg);
      background: var(--tooltip-surface-bg);
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
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

export default Tooltip;

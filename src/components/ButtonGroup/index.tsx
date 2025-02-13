import styled from 'styled-components';

//
// Render bunch of buttons in grouped container
//

const ButtonGroup = styled.div<{ big?: boolean }>`
  display: flex;
  align-items: center;

  > .button {
    border-radius: 0;
    margin-left: -1px;
    min-height: ${(p) => (p.big ? 'var(--button-group-big-height)' : 'var(--button-group-height)')};
    min-width: ${(p) => (p.big ? 'var(--button-group-big-width)' : 'var(--button-group-width)')};
    font-size: ${(p) => (p.big ? 'var(--button-group-big-font-size)' : 'var(--button-group-font-size)')};
    border-color: var(--color-border-primary);

    white-space: nowrap;

    &:not(.active):not(:hover) {
      background: var(--color-bg-primary);
    }

    &.active {
      background: var(--button-default-active-bg);
    }

    &:first-of-type {
      margin-left: 0;
      border-top-left-radius: var(--radius-primary);
      border-bottom-left-radius: var(--radius-primary);
    }

    &:last-of-type {
      border-top-right-radius: var(--radius-primary);
      border-bottom-right-radius: var(--radius-primary);
    }

    i {
      margin: 0 auto;
    }
  }

  > a {
    border-radius: 0;
    margin-left: -1px;
    display: inline-block;

    &:first-of-type {
      margin-left: 0;
      border-top-left-radius: var(--radius-primary);
      border-bottom-left-radius: var(--radius-primary);
    }

    &:last-of-type {
      border-top-right-radius: var(--radius-primary);
      border-bottom-right-radius: var(--radius-primary);
    }

    > .button {
      border: 0;
    }
  }
`;

export default ButtonGroup;

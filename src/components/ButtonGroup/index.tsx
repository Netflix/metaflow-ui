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
    min-height: ${(p) => (p.big ? '2.5rem' : '1.75rem')};
    min-width: ${(p) => (p.big ? '2.5rem' : '1.75rem')};
    font-size: ${(p) => (p.big ? '1rem' : '0.875rem')};
    border-color: #d0d0d0;

    white-space: nowrap;

    &:not(.active):not(:hover) {
      background: #fff;
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

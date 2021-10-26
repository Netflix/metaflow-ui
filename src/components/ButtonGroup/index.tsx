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
      background: ${(p) => p.theme.color.button.default.activeBg};
    }

    &:first-of-type {
      margin-left: 0;
      border-top-left-radius: 0.25rem;
      border-bottom-left-radius: 0.25rem;
    }

    &:last-of-type {
      border-top-right-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
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
      border-top-left-radius: 0.25rem;
      border-bottom-left-radius: 0.25rem;
    }

    &:last-of-type {
      border-top-right-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
    }

    > .button {
      border: 0;
    }
  }
`;

export default ButtonGroup;

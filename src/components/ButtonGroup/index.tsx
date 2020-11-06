import styled, { css } from 'styled-components';

const ButtonGroup = styled.div<{ big?: boolean }>`
  display: flex;
  align-items: center;

  > .button {
    border-radius: 0;
    margin-left: -1px;
    min-height: ${(p) => (p.big ? '36px' : '28px')};
    font-size: ${(p) => (p.big ? '1rem' : '0.875rem')};

    ${(p) =>
      p.big
        ? css`
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          `
        : ''}

    white-space: nowrap;

    &:not(.active):not(:hover) {
      background: #fff;
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

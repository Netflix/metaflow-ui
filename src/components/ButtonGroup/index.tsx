import styled from 'styled-components';

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;

  > .button {
    border-radius: 0;
    margin-left: -1px;

    white-space: nowrap;
    overflow-x: hidden;
    max-width: 200px;

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

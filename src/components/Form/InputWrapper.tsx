import styled from 'styled-components';
import { AsyncStatus } from '../../types';

type InputWrapperProps = { active: boolean; status?: AsyncStatus; size?: 'sm' | 'md' };

//
// Wrapper for input and dropdown fields. Makes correct kind of borders and stylings for elements,
//

const InputWrapper = styled.section<InputWrapperProps>`
  align-items: center;
  border: ${(p) => (p.status && p.status === 'Error' ? '1px solid ' + p.theme.color.bg.red : p.theme.border.thinLight)};
  border-radius: 0.25rem;
  color: #333;
  background: #fff;
  display: flex;
  height: ${(p) => (p.size === 'sm' ? '2.0rem' : '2.5rem')};
  width: 100%;
  padding: ${(p) => (p.size === 'sm' ? '0.5rem' : '0.5rem 1rem')};
  position: relative;
  transition: border 0.15s;

  input {
    width: 100%;
    border: none;
    cursor: ${(p) => (p.active ? 'auto' : 'pointer')};
    background-color: transparent;
    padding-right: 1.5rem;

    &:focus {
      outline: none;
      border: none;
    }

    &::placeholder {
      color: #333;
      font-weight: 500;
      opacity: 1;
    }
  }

  input[type='datetime-local'],
  input[type='date'] {
    padding-right: 0;
  }

  cursor: ${(p) => (p.active ? 'auto' : 'pointer')};

  &:hover {
    border-color: ${(p) =>
      p.status && p.status === 'Error' ? p.theme.color.bg.red : p.active ? p.theme.color.text.blue : '#333'};
  }
`;

export default InputWrapper;

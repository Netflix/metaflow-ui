import styled from 'styled-components';
import { AsyncStatus } from '@/types';

type InputWrapperProps = { active: boolean; status?: AsyncStatus; size?: 'sm' | 'md' };

//
// Wrapper for input and dropdown fields. Makes correct kind of borders and stylings for elements,
//

const InputWrapper = styled.section<InputWrapperProps>`
  align-items: center;
  border: ${(p) => (p.status && p.status === 'Error' ? 'var(--input-border-danger)' : 'var(--input-border)')};
  border-radius: var(--radius-primary);
  color: var(--input-text-color);
  background: var(--input-bg);
  display: flex;
  height: ${(p) => (p.size === 'sm' ? 'var(--input-height-sm)' : 'var(--input-height)')};
  width: 100%;
  padding: ${(p) => (p.size === 'sm' ? 'var(--input-padding-sm)' : 'var(--input-padding)')};
  position: relative;
  transition: border 0.15s;

  input {
    width: 100%;
    border: none;
    cursor: ${(p) => (p.active ? 'auto' : 'pointer')};
    background-color: transparent;
    padding-right: 1.5rem;
    font-size: ${(p) => (p.size === 'sm' ? 'var(--input-font-size-sm)' : 'var(--input-font-size)')};

    &:focus {
      outline: none;
      border: none;
    }

    &::placeholder {
      color: var(--input-placeholder-color);
      font-size: var(--input-placeholder-font-size);
      font-weight: var(--input-placeholder-font-weight);
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
      p.status && p.status === 'Error'
        ? 'var(--color-bg-danger)'
        : p.active
          ? 'var(--color-text-highlight)'
          : 'var(--color-text-primary)'};
  }
`;

export default InputWrapper;

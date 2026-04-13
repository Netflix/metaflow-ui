import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Icon from '@components/Icon';
import { PopoverStyles } from '@components/Popover';
import { TitledSectionHeader } from '@components/TitledSection';
import useOnKeyPress from '@hooks/useOnKeyPress';

//
// Typedef
//

type ModalProps = {
  show: boolean;
  title?: string;
  actionbar?: JSX.Element;
  onClose: () => void;
  children?: React.ReactNode;
};

//
// Component
//

const Modal: React.FC<ModalProps> = ({ show, title, actionbar, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useOnKeyPress('Escape', onClose);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const el = modalRef.current;
    if (el) {
      el.focus();
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, handleKeyDown]);

  if (!show) return null;

  return (
    <ModalBackDrop data-testid="modal-container" role="dialog" aria-modal="true" aria-label={title || 'Dialog'}>
      <ModalClickHandler onClick={() => onClose()} data-testid="modal-background" aria-hidden="true" />

      <ModalContainer ref={modalRef} tabIndex={-1}>
        <TitledSectionHeader
          label={title}
          actionbar={
            <>
              {actionbar}
              <CloseModal onClick={onClose} role="button" aria-label="Close dialog" tabIndex={0}>
                <Icon name="times" customSize="1.25rem" />
              </CloseModal>
            </>
          }
        />
        <ModalContent data-testid="modal-content">{children}</ModalContent>
      </ModalContainer>
    </ModalBackDrop>
  );
};

//
// Style
//

const ModalBackDrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalClickHandler = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const ModalContainer = styled.div`
  ${PopoverStyles}
  position: relative;
  z-index: 1;
  padding: 0.75rem 1rem 1rem 1rem;
  width: 80%;
  max-width: 80rem;
`;

const ModalContent = styled.div`
  padding-top: 1rem;
`;

const CloseModal = styled.div`
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 0.25rem;
`;

export default Modal;

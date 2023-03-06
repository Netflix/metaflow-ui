import React from 'react';
import styled from 'styled-components';
import useOnKeyPress from '../../hooks/useOnKeyPress';
import Icon from '../Icon';
import { PopoverStyles } from '../Popover';
import { TitledSectionHeader } from '../TitledSection';

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
  useOnKeyPress('Escape', onClose);
  if (!show) return null;

  return (
    <ModalBackDrop data-testid="modal-container">
      <ModalClickHandler onClick={() => onClose()} data-testid="modal-background" />

      <ModalContainer>
        <TitledSectionHeader
          label={title}
          actionbar={
            <>
              {actionbar}
              <CloseModal onClick={onClose}>
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

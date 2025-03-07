import React, { useState } from 'react';
import { mount } from '@cypress/react';
import Modal from '..';
import TestWrapper, { gid } from '@utils/testing';

const MockComponent = () => {
  const [show, setShow] = useState(false);
  return (
    <TestWrapper>
      <Modal show={show} onClose={() => setShow(false)} title="Hello world">
        test content
      </Modal>
      <button onClick={() => setShow(true)}>open</button>
    </TestWrapper>
  );
};

describe('Modal', () => {
  it('Should not render with show false', () => {
    mount(<Modal show={false} onClose={() => null} />);
    gid('modal-container').should('not.exist');
  });

  it('Should trigger open and close', () => {
    mount(<MockComponent />);
    gid('modal-container').should('not.exist');
    cy.get('button').contains('open').click();
    gid('modal-container');
    gid('modal-background').click({ force: true });
    gid('modal-container').should('not.exist');
  });

  it('Should render content ok', () => {
    mount(<MockComponent />);
    cy.get('button').contains('open').click();
    gid('modal-container').contains('Hello world');
    gid('modal-content').contains('test content');
  });
});

import React from 'react';
import { mount } from '@cypress/react';
import useTaskCards from '../useTaskCards';
import { createDataModel, createTask } from '../../../utils/testhelper';
import { gid } from '../../../utils/testing';
import { Task } from '../../../types';
import { Decorator } from '../../DAG/DAGUtils';

const MockComponent: React.FC<{ task?: Task | null; decos?: Decorator[] }> = ({ task = null, decos = [] }) => {
  const cards = useTaskCards(task, decos);

  return (
    <div data-testid="cardslist">
      {cards.map((value) => (
        <div key={value.hash} data-testid="card">{JSON.stringify(value)}</div>
      ))}
    </div>
  );
};

describe('useTaskCards', () => {
  it('should return empty list when task is null', () => {
    mount(<MockComponent />);
    gid('cardslist').children().should('have.length', 0);
  });

  it('should return empty list no decorators provided', () => {
    mount(<MockComponent task={createTask({})} />);
    gid('cardslist').children().should('have.length', 0);
  });

  it('should return empty list since requests will fail', () => {
    mount(<MockComponent task={createTask({})} decos={[
      { name: 'card', attributes: {}, statically_defined: false },
    ]} />);
    gid('cardslist').children().should('have.length', 0);
  });

  it('should return 1 card definition', () => {
    cy.intercept('**/cards', createDataModel([{ id: '123', type: 'xd', hash: 'unique1' }], {}))
    mount(<MockComponent task={createTask({})} decos={[
      { name: 'card', attributes: {}, statically_defined: false },
    ]} />);
    gid('cardslist').children().should('have.length', 1);
  });

  it('should return 1 card definition first and second after a while', () => {
    cy.intercept('**/cards', createDataModel([{ id: '123', type: 'xd', hash: 'unique1' }], {}))
    mount(<MockComponent task={createTask({ finished_at: Date.now() })} decos={[
      { name: 'card', attributes: {}, statically_defined: false },
      { name: 'card', attributes: {}, statically_defined: false }
    ]} />);
    gid('cardslist').children().should('have.length', 1);

    // Lets mock so that second request will return two results
    cy.intercept('**/cards', createDataModel([
      { id: '123', type: 'xd', hash: 'unique1' },
      { id: '321', type: 'xd', hash: 'unique2' }
    ], {}));
    gid('cardslist').children({ timeout: 6000 }).should('have.length', 2); 
  });
});

import { mount } from '@cypress/react';
import React from 'react';
import { Task } from '@/types';
import { createDataModel, createTask } from '@utils/testhelper';
import { gid } from '@utils/testing';
import { Decorator } from '../../DAG/DAGUtils';
import useTaskCards from '../useTaskCards';

const MockComponent: React.FC<{ task?: Task | null; decos?: Decorator[] }> = ({ task = null, decos = [] }) => {
  const cardsResult = useTaskCards(task, decos);

  return (
    <div data-testid="cardslist" className={cardsResult.status}>
      {cardsResult.cards.map((value) => (
        <div key={value.hash} data-testid="card">
          {JSON.stringify(value)}
        </div>
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
    mount(
      <MockComponent task={createTask({})} decos={[{ name: 'card', attributes: {}, statically_defined: false }]} />,
    );
    gid('cardslist').children().should('have.length', 0);
  });

  it('should return 1 card definition', () => {
    cy.intercept('**/cards', createDataModel([{ id: '123', type: 'xd', hash: 'unique1' }], {}));
    mount(
      <MockComponent task={createTask({})} decos={[{ name: 'card', attributes: {}, statically_defined: false }]} />,
    );
    gid('cardslist').children().should('have.length', 1);
  });

  it('should return 1 card definition first and second after a while', () => {
    cy.intercept('**/cards*', createDataModel([{ id: '123', type: 'xd', hash: 'unique1' }], {}));
    mount(
      <MockComponent
        task={createTask({ finished_at: Date.now() })}
        decos={[
          { name: 'card', attributes: {}, statically_defined: false },
          { name: 'card', attributes: {}, statically_defined: false },
        ]}
      />,
    );
    gid('cardslist').children().should('have.length', 1);
    cy.get('.loading').should('have.length', 1);

    // Lets mock so that second request will return two results
    cy.intercept(
      '**/cards*',
      createDataModel(
        [
          { id: '123', type: 'xd', hash: 'unique1' },
          { id: '321', type: 'xd', hash: 'unique2' },
        ],
        {},
      ),
    );
    gid('cardslist').children({ timeout: 6000 }).should('have.length', 2);
    cy.get('.success').should('have.length', 1);
  });
});

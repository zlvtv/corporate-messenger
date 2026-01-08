import React from 'react';
import Button from '../../../src/components/ui/button/button';

describe('Button', () => {
  it('renders primary button and triggers click', () => {
    const handleClick = cy.spy().as('clickHandler');

    cy.mount(<Button variant="primary" onClick={handleClick}>Click me</Button>);

    cy.get('button').should('contain', 'Click me');
    cy.get('button').should('have.class', 'button--primary');
    cy.get('button').click();
    cy.get('@clickHandler').should('have.been.calledOnce');
  });

  it('renders secondary button', () => {
    cy.mount(<Button variant="secondary">Cancel</Button>);
    cy.get('button').should('have.class', 'button--secondary');
    cy.get('button').should('contain', 'Cancel');
  });

  it('is disabled', () => {
    cy.mount(<Button disabled>Disabled</Button>);
    cy.get('button').should('be.disabled');
    cy.get('button').should('have.css', 'opacity', '0.6');
  });
});

declare namespace Cypress {
  interface Chainable {
    login(username?: string, password?: string): Chainable<void>;
    clickStepperNext(label?: string | RegExp): Chainable<void>;
  }
}

/** Clicks a stepper action button in the active (visible) step only. */
Cypress.Commands.add('clickStepperNext', (label: string | RegExp = 'Next') => {
  cy.get('.step-actions')
    .filter(':visible')
    .contains('button', label)
    .should('be.visible')
    .should('not.be.disabled')
    .click();
});

Cypress.Commands.add('login', (username = 'testuser', password = 'password123') => {
  cy.visit('/login');
  cy.get('input[formControlName="username"]').clear().type(username);
  cy.get('input[formControlName="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();

  // Complete MFA with valid code
  cy.url().should('include', '/mfa');
  cy.get('input[formControlName="code"]').clear().type('123456');
  cy.get('button[type="submit"]').click();

  // Should land on dashboard
  cy.url().should('include', '/dashboard');
});

declare namespace Cypress {
  interface Chainable {
    login(username?: string, password?: string): Chainable<void>;
  }
}

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

describe('Login → MFA → Dashboard', () => {
  it('should complete full login and MFA flow and see dashboard', () => {
    cy.login();

    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
    cy.get('boa-account-card').should('have.length.greaterThan', 0);
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[formControlName="username"]').type('locked');
    cy.get('input[formControlName="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.contains('locked').should('be.visible');
  });

  it('should show error for invalid MFA code', () => {
    cy.visit('/login');
    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/mfa');
    cy.get('input[formControlName="code"]').type('000000');
    cy.get('button[type="submit"]').click();

    cy.contains('attempt').should('be.visible');
  });

  it('should redirect unauthenticated user to login', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });
});

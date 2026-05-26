describe('Account Detail and Transactions', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should navigate to account detail from dashboard', () => {
    cy.get('boa-account-card').first().click();
    cy.url().should('include', '/accounts/');
    cy.contains('Available Balance').should('be.visible');
  });

  it('should display transactions table on account detail page', () => {
    cy.get('boa-account-card').first().click();
    cy.get('boa-data-table').should('exist');
  });

  it('should navigate to transactions page via sidenav', () => {
    cy.contains('Transactions').click();
    cy.url().should('include', '/transactions');
    cy.contains('Transactions').should('be.visible');
  });

  it('should display transactions list with filters', () => {
    cy.contains('Transactions').click();
    cy.get('input[formControlName="searchTerm"]').should('exist');
    cy.get('boa-data-table').should('exist');
  });
});

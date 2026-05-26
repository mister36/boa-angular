describe('Transfer Flow', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should navigate to transfer page', () => {
    cy.contains('Transfers').click();
    cy.url().should('include', '/transfer');
  });

  it('should complete a full transfer flow', () => {
    cy.contains('Transfers').click();

    // Step 1: Select source account
    cy.get('mat-select[formControlName="sourceAccountId"]').click();
    cy.get('mat-option').first().click();
    cy.contains('Next').click();

    // Step 2: Select destination account
    cy.get('mat-select[formControlName="destinationAccountId"]').click();
    cy.get('mat-option').first().click();
    cy.contains('Next').click();

    // Step 3: Enter amount
    cy.get('input[formControlName="amount"]').type('100');
    cy.contains('Next').click();

    // Step 4: Review
    cy.contains('Review').should('be.visible');
    cy.contains('Next').click();

    // Step 5: Confirm
    cy.contains('Confirm').click();

    // Step 6: Success receipt
    cy.contains('confirmation', { matchCase: false }).should('be.visible');
  });

  it('should show validation error for zero amount', () => {
    cy.contains('Transfers').click();

    cy.get('mat-select[formControlName="sourceAccountId"]').click();
    cy.get('mat-option').first().click();
    cy.contains('Next').click();

    cy.get('mat-select[formControlName="destinationAccountId"]').click();
    cy.get('mat-option').first().click();
    cy.contains('Next').click();

    cy.get('input[formControlName="amount"]').type('0');
    cy.get('input[formControlName="amount"]').blur();
    cy.contains('greater than zero').should('be.visible');
  });
});

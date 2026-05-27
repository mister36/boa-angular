describe('Transfer Flow', () => {
  const activeStep = () => cy.get('.mat-horizontal-stepper-content').filter(':visible');

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
    activeStep().find('mat-select[formControlName="sourceAccountId"]').click();
    cy.get('.cdk-overlay-container mat-option').first().click();
    cy.clickStepperNext('Next');

    // Step 2: Select destination account
    activeStep().find('mat-select[formControlName="destinationAccountId"]').click();
    cy.get('.cdk-overlay-container mat-option').first().click();
    cy.clickStepperNext('Next');

    // Step 3: Enter amount
    activeStep().find('input[formControlName="amount"]').type('100');
    cy.clickStepperNext('Next');

    // Step 4: Review
    cy.contains('Review Transfer').should('be.visible');
    cy.clickStepperNext('Continue to Confirm');

    // Step 5: Confirm
    activeStep().contains('button', 'Confirm Transfer').click();

    // Step 6: Success receipt
    cy.contains('Transfer Successful!').should('be.visible');
    cy.contains('Confirmation Number').should('be.visible');
  });

  it('should show validation error for zero amount', () => {
    cy.contains('Transfers').click();

    activeStep().find('mat-select[formControlName="sourceAccountId"]').click();
    cy.get('.cdk-overlay-container mat-option').first().click();
    cy.clickStepperNext('Next');

    activeStep().find('mat-select[formControlName="destinationAccountId"]').click();
    cy.get('.cdk-overlay-container mat-option').first().click();
    cy.clickStepperNext('Next');

    activeStep().find('input[formControlName="amount"]').type('0').blur();
    activeStep().contains('greater than zero').should('be.visible');
  });
});

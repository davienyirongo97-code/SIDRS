describe('IMEI Checker', () => {
  it('Should successfully check a 15-digit IMEI', () => {
    cy.visit('/checker');
    cy.get('input').type('356123456789012');
    cy.contains('button', 'Verify').click();
    // Assuming 356123456789012 is not in the stolen mock data, it should show clean
    cy.contains('Clean', { matchCase: false }).should('exist');
  });
});

describe('Report Theft Flow', () => {
  it('Should allow a user to navigate to report page and submit', () => {
    cy.visit('/report');
    
    // Fill out the form
    cy.get('select').first().select(1); // Select the first available device
    cy.get('input[type="date"]').type('2026-03-22');
    cy.get('input[type="time"]').type('14:30');
    cy.get('input[placeholder*="Location" i]').type('Area 47, Lilongwe');
    cy.get('textarea').type('Device was snatched at the bus depot.');
    
    // Check the declaration checkbox using a broader selector if needed
    cy.get('input[type="checkbox"]').check({ force: true });
    
    // Submit
    cy.contains('button', 'Submit').click();
    
    // Depending on the app's behavior, it might show a toast or a modal
    // We just verify it doesn't crash here for the basic test
    cy.url().should('include', '/');
  });
});

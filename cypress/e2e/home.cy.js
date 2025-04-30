describe('Home Page', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('http://localhost:3000');
  });

  it('should have the correct title', () => {
    cy.get('h1').should('contain.text', 'SmartDine');
  });

  it('should display the login buttons', () => {
    cy.get('button').contains('Login as Customer').should('exist'); // Customer login button exists
    cy.get('button').contains('Login as Staff').should('exist'); // Staff login button exists
  });

  // it('should navigate to the menu page when customer login button is clicked', () => {
  //   cy.get('button').contains('Login as Customer').click();
  //   cy.location('pathname', { timeout: 10000 }).should('include', '/menu'); // Waits up to 10s
  // });

  it('should navigate to staff login page when staff login button is clicked', () => {
    cy.get('button').contains('Login as Staff').click();
    cy.url().should('include', '/auth/staff-login'); // After clicking, the URL should include '/auth/staff-login'
  });
});

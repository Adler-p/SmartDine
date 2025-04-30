describe('Staff Login Flow', () => {
  // it('allows a staff user to log in and redirects to the staff page', () => {
  //   cy.visit('http://localhost:3000/auth/staff-login');

  //   // Fill in login credentials (use valid test credentials)
  //   cy.get('input[type="text"]').type('staff@example.com');
  //   cy.get('input[type="password"]').type('password123');

  //   // Click the login button
  //   cy.contains('button', 'Login as Staff').click();

  //   // Verify redirection to /staff
  //   cy.url().should('include', '/staff');

  //   // Confirm presence of a staff page element (adjust as needed)
  //   cy.contains('Incoming Orders'); // or any staff-specific header
  // });

  it('shows an error when the login fails with incorrect credentials', () => {
    cy.visit('http://localhost:3000/auth/staff-login');

    // Fill in incorrect login credentials
    cy.get('input[type="text"]').type('incorrect@example.com');
    cy.get('input[type="password"]').type('wrongpassword');

    // Click the login button
    cy.contains('button', 'Login as Staff').click();

    cy.wait(1000); // Adjust this if necessary based on how long the API takes to respond

    // Verify the error message is displayed
    cy.contains('Something went wrong. Try again.').should('be.visible');
  });
});

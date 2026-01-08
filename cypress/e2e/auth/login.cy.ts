describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should show login form', () => {
    cy.get('h1').should('contain', 'Войти в аккаунт');
    cy.get('input[placeholder="name@example.com"]').should('be.visible');
    cy.get('input[placeholder="••••••••"]').should('be.visible');
  });

  it('should show error on invalid credentials', () => {
    cy.get('input[placeholder="name@example.com"]').type('wrong@example.com');
    cy.get('input[placeholder="••••••••"]').type('wrongpass');
    cy.get('button').contains('Войти').click();
    cy.get('.error').should('contain', 'Неверный email или пароль');
  });

  it('should redirect to dashboard on success', () => {
    cy.intercept('POST', '/auth/token', {
      statusCode: 200,
      body: {
        access_token: 'fake-jwt',
        user: { id: 'user-1', email: 'test@example.com' },
      },
    }).as('loginRequest');

    cy.get('input[placeholder="name@example.com"]').type('test@example.com');
    cy.get('input[placeholder="••••••••"]').type('password123');
    cy.get('button').contains('Войти').click();

    cy.url().should('include', '/dashboard');
  });
});

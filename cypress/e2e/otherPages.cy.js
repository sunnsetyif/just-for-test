describe('Access unauthorized user to pages:', {tags: '@test'}, () => {
    const pages = [
        { name: 'Order', path: '/order-page/RTx9M48BRfYMw94T2FYv' },
        { name: 'Message', path: '/messages' },
        { name: 'Ribbon', path: '/ribbon' },
        { name: 'Scheduler Tab 2', path: '/scheduler?tab=2' },
        { name: 'Scheduler Tab 1', path: '/scheduler?tab=1&sd=DESC&status=&question=' },
        { name: 'Scheduler Tab 3', path: '/scheduler?tab=3' },
        { name: 'My Profile Posts', path: '/user-page/7a9ade7a-bd9b-492c-9314-b8571988794d?type=posts' },
        { name: 'My Profile Services', path: '/user-page/7a9ade7a-bd9b-492c-9314-b8571988794d?type=services' },
        { name: 'Service', path: '/service/VqzzDJABxBYKLkNZ2LtI' },
        { name: 'Post', path: '/post/aaBoo5AB7gGFpgLIYnAi' },
        { name: 'Saved Services', path: '/saved?type=services' },
        { name: 'Saved Posts', path: '/saved?type=posts' },
        { name: 'Settings', path: '/account-settings' },
    ];

    pages.forEach((page) => {
        it(`Redirects unauthorized user from ${page.name}`, () => {
            cy.visit(Cypress.config('baseUrl') + page.path);
            cy.url().should('eq', Cypress.config('baseUrl'));
        });
    });
});

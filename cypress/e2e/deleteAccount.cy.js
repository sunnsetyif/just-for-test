import AuthModals from '../support/modals/AuthModals';
import { authService } from '../api/services';
import { SettingsMenu, SettingsMenuBlocks } from '../support/enums';

const authModals = new AuthModals();

describe('success delete user account', { tags: '@smoke' }, () => {
    let userDataFirst;

    before(() => {
        authService.createUser().then((response) => {
            userDataFirst = response.userData;
        });
    });

    it('success delete user account', () => {
        authModals.login(userDataFirst.email, userDataFirst.password);
        authModals.choseMenuInSettings(SettingsMenu.SettingsAccount, SettingsMenuBlocks.DeleteAccount);
        cy.wait(3000);
        cy.iframe('#accSettingsPage').find('button').contains('Видалити акаунт').should('be.visible').click({ force: true });
        cy.get('[type="password"]').type(userDataFirst.password, { force: true });
        cy.get('button').contains('Видалити').click({ force: true });
        cy.wait(1000);
        authModals.assertNotification('Акаунт успішно видалено');
        authModals.assertUrl(Cypress.config('baseUrl'));
    });
});

import AuthModals from '../support/modals/AuthModals';
import { checkEmailContent, createInbox } from '../support/helper';
import { faker } from '@faker-js/faker';
import { SettingsMenu, SettingsMenuBlocks } from '../support/enums';

const authModals = new AuthModals();

describe('success register and activate user and check email', { tags: '@emails' }, () => {
    const password = Cypress.env('TEST_USER_PASSWORD');
    const name = faker.person.firstName();
    const surname = faker.person.lastName();
    const nickname = faker.internet.userName();

    let inboxId;
    let emailAddress;

    before(() => {
        createInbox().then(({ email, id }) => {
            inboxId = id;
            emailAddress = email;
        });
    });

    it('register user with real email and activate account via link in email', () => {
        authModals.visit();
        authModals.openLoginModal();
        authModals.clickOnCreateAcc();
        authModals.typeName(name);
        authModals.typeSurname(surname);
        authModals.typeNickname(nickname);
        authModals.typeEmail(emailAddress);
        authModals.typePassword(password);
        authModals.typeConfirmPassword(password);
        authModals.agreeRegisterCheckbox();
        authModals.clickOnRegisterButton();
        authModals.assertSuccessRegisterAccount();

        checkEmailContent(
            inboxId,
            'Посилання для активації',
            ['Щоб завершити реєстрацію облікового запису, підтвердіть свою адресу електронної пошти за посиланням нижче:'],
            (email) => {
                const activationLink = email.body.match(/href="(https:\/\/[^"]+?isActive=[^"]+)"/)[1];
                cy.log('Activation Link:', activationLink);
                cy.visit(activationLink);
                authModals.assertNotification('Акаунт успішно активовано', { timeout: 50000 });
                authModals.login(emailAddress, password);
                authModals.choseMenuInSettings(SettingsMenu.SettingsAccount, SettingsMenuBlocks.DeleteAccount);
                cy.wait(3000);
                cy.iframe('#accSettingsPage').find('button').contains('Видалити акаунт').should('be.visible').click({ force: true });
                cy.get('[type="password"]').type(password, { force: true });
                cy.get('button').contains('Видалити').click({ force: true });
                cy.wait(1000);
                authModals.assertNotification('Акаунт успішно видалено');
            }
        );
    });
});

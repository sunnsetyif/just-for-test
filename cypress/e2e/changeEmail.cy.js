import { faker } from '@faker-js/faker';
import AuthModals from '../support/modals/AuthModals';
import { ProfileActions, SettingsMenu, SettingsMenuBlocks } from '../support/enums';
import { checkEmailContent, createInbox } from '../support/helper';
import { authService } from '../api/services';

const authModals = new AuthModals();

describe('create and activate user, change password, change email', { tags: '@emails' }, () => {
    let userDataFirst;
    let userDataSecond;
    let firstToken;
    let secondToken;
    let inboxId;
    let emailAddress;
    let linkChangedEmail;
    const name = faker.person.firstName();
    const surname = faker.person.lastName();
    const nickname = faker.internet.userName();

    before(() => {
        authService.createUser().then((response) => {
            userDataFirst = response.userData;
            firstToken = response.access;
        });
        authService.createUser().then((response) => {
            userDataSecond = response.userData;
            secondToken = response.access;
        });
        createInbox().then(({ email, id }) => {
            inboxId = id;
            emailAddress = email;
        });
    });

    after(() => {
        authService.deleteUserByAdmin(firstToken);
        authService.deleteUserByAdmin(secondToken);
    });

    it('settings - change email - change to the same email, change to already registered account', () => {
        authModals.login(userDataFirst.email, userDataFirst.password);
        authModals.choseMenuInSettings(SettingsMenu.Security, SettingsMenuBlocks.ChangeEmail);
        cy.iframe('#accSettingsPage').find('[role="region"]').eq(1).find('input').type(userDataFirst.email);
        cy.iframe('#accSettingsPage').find('button').contains('Змінити').should('be.disabled');

        cy.iframe('#accSettingsPage').find('[role="region"]').eq(1).find('input').clear().type(userDataSecond.email);
        cy.iframe('#accSettingsPage').find('[style="margin-top: 40px;"]').eq(1).click({ force: true });
        cy.iframe('#accSettingsPage').contains('Користувач з такою поштою вже зареєстрований.', { timeout: 50000 });
    });

    it('settings - change email to new one and login', () => {
        authModals.login(userDataFirst.email, userDataFirst.password);
        authModals.assertTitle('Моя сторінка');
        authModals.choseMenuInSettings(SettingsMenu.Security, SettingsMenuBlocks.ChangeEmail);
        cy.iframe('#accSettingsPage').find('[role="region"]').eq(1).find('input').clear().type(emailAddress);
        cy.iframe('#accSettingsPage').find('[style="margin-top: 40px;"]').eq(1).click({ force: true });
        cy.contains('Зміна електронної пошти');
        cy.contains(
            'На вказану вами електронну пошту було надіслано листа про зміну електронної пошти. Будь ласка, перевірте вашу поштову скриньку.'
        );
        authModals.navigateToMenuItem(ProfileActions.LOGOUT);
        authModals.login(userDataFirst.email, userDataFirst.password); // still able to log in with old email
        authModals.assertTitle('Моя сторінка');
        authModals.navigateToMenuItem(ProfileActions.LOGOUT);

        checkEmailContent(
            inboxId,
            'Оновлення електронної пошти',
            ['Щоб завершити зміну електронної пошти, підтвердіть свою адресу електронної пошти за посиланням нижче:'],
            (email) => {
                linkChangedEmail = email.body.match(/href="(https:\/\/[^"]+?email=[^"]+)"/)[1];
                cy.visit(linkChangedEmail);
                authModals.clickClosModal();
                authModals.assertNotification('Електронну адресу успішно змінено', { timeout: 50000 });
                authModals.login(emailAddress, userDataFirst.password);
                authModals.assertTitle('Моя сторінка');
            }
        );
    });

    it('settings - unable to login with old email (emailAddress) after success changed to new email. Register again with old email (emailAddress), but not activate account', () => {
        authModals.login(userDataFirst.email, userDataFirst.password);
        authModals.assertNotification('Не вірний логін або пароль');
        authModals.clickOnCreateAcc();
        authModals.typeName(name);
        authModals.typeSurname(surname);
        authModals.typeNickname(nickname);
        authModals.typeEmail(userDataFirst.email);
        authModals.typePassword(userDataFirst.password);
        authModals.typeConfirmPassword(userDataFirst.password);
        authModals.agreeRegisterCheckbox();
        authModals.clickOnRegisterButton();
        cy.contains('Підтвердження електронної пошти');
        cy.contains(
            'На вказану Вами електронну пошту, було надіслано листа з підвердженням реєстрації. Будь ласка, перевірте Вашу поштову скриньку.'
        );
        authModals.login(userDataFirst.email, userDataFirst.password);
        authModals.assertNotification('Акаунт не активований! Перевірте електронну пошту.', { timeout: 50000 });
    });
});

import AuthModals from '../support/modals/AuthModals';
import { ProfileActions } from '../support/enums';
import { checkEmailContent, createInbox, deleteAllEmails } from '../support/helper';
import { authService } from '../api/services';

const authModals = new AuthModals();

describe('security 2fa', { tags: '@emails' }, () => {
    let inboxId;
    let emailAddress;
    let userData;
    let accessTokenFirstUser;

    before(() => {
        authService.createUser().then((response) => {
            userData = response.userData;
            accessTokenFirstUser = response.access;
        });
        createInbox().then(({ email, id }) => {
            inboxId = id;
            emailAddress = email;
        });
    });

    after(() => {
        authService.deleteUserByAdmin(accessTokenFirstUser);
    });

    it('settings - turn on 2FA', () => {
        authModals.login(userData.email, userData.password);
        authModals.navigateToMenuItem(ProfileActions.SETTINGS);
        cy.frameLoaded('#accSettingsPage');
        cy.iframe('#accSettingsPage').find('button').contains('Безпека').click({ force: true });
        cy.iframe('#accSettingsPage').find('span').contains('Двофакторна аутентифікація').should('be.visible').click({ force: true });
        cy.iframe('#accSettingsPage').find('input[placeholder="Введіть E-mail*"]').should('have.value', userData.email).clear().type(emailAddress);

        cy.iframe('#accSettingsPage').find('[role="region"]').eq(2).find('input').eq(0).should('not.be.checked');
        cy.iframe('#accSettingsPage').find('[role="region"]').eq(2).find('input').eq(0).click({ force: true });
        cy.iframe('#accSettingsPage').find('button').contains('Підтвердити').click();
        cy.contains('Ви вмикаєте двофакторну аутентифікацію');
        cy.contains('На вказану вами електронну пошту надіслано листа з кодом підтвердження, будь ласка введіть його нижче.');

        checkEmailContent(
            inboxId,
            'Таймкод',
            [
                'У вас увімкнена двухфакторна аутентифікація. Підтвердіть вашу особистість для входу в обліковий запис. Ваш код підтвердження:',
                'Якщо ви не здійснювали цього запиту, проігноруйте його або зверніться у службу підтримки.',
            ],
            (email) => {
                authModals.checkSupportLink(email.body);
                const timeCodeFirst = />(\d{6})</.exec(email.body)[1];
                authModals.typeCode(timeCodeFirst);
                authModals.clickOnAgreeButton();
                authModals.assertNotification('Двухфакторну аутентифікацію увімкнено', {timeout: 50000});
            }
        ).then(() => deleteAllEmails(inboxId));
    });
    it('settings - login with 2FA', () => {
        authModals.login(userData.email, userData.password);
        checkEmailContent(
            inboxId,
            'Таймкод',
            [
                'У вас увімкнена двухфакторна аутентифікація. Підтвердіть вашу особистість для входу в обліковий запис. Ваш код підтвердження:',
                'Якщо ви не здійснювали цього запиту, проігноруйте його або зверніться у службу підтримки.',
            ],
            (email) => {
                authModals.checkSupportLink(email.body);
                const timeCodeSecond = />(\d{6})</.exec(email.body)[1];
                authModals.typeCode(timeCodeSecond);
                cy.get('#loginBtn2FA').contains('Увійти').click({ force: true });
                authModals.assertTitle('Моя сторінка');

                authModals.navigateToMenuItem(ProfileActions.SETTINGS);
                cy.iframe('#accSettingsPage').find('button').contains('Безпека').click({ force: true });
                cy.iframe('#accSettingsPage').find('span').contains('Двофакторна аутентифікація').should('be.visible').click({ force: true });
                cy.iframe('#accSettingsPage').find('[role="region"]').eq(2).find('input').eq(0).should('be.checked');
                cy.iframe('#accSettingsPage').find('[role="region"]').eq(2).find('input').eq(0).click();
                cy.wait(3000);
                cy.iframe('#accSettingsPage').find('button').contains('Підтвердити').click();
                cy.wait(3000);
                authModals.openSearchPage();
            }
        );
    });
    it('settings - login after turned off 2FA', () => {
        authModals.login(userData.email, userData.password);
        authModals.assertTitle('Моя сторінка');
    });
});

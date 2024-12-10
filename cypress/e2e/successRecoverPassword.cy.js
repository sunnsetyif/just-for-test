import AuthModals from '../support/modals/AuthModals';
import { faker } from '@faker-js/faker';
import { checkEmailContent, createInbox, deleteAllEmails } from '../support/helper';
import { authService } from '../api/services';

const followUpText = 'Якщо ви не здійснювали цього запиту, проігноруйте його або зверніться у службу підтримки.';
const authModals = new AuthModals();

describe('recover password and login with new password', { tags: '@emails' }, () => {
    let inboxId;
    let emailAddress;
    let userDataFirst;
    let activationCode;
    let token;
    const newUserPassword = Cypress.env('TEST_USER_NEW_PASSWORD');

    before(() => {
        createInbox()
            .then(({ email, id }) => {
                inboxId = id;
                emailAddress = email;
                return authService.createUser('CypressRecoverPass', 'CypRecPass', faker.internet.userName(), emailAddress);
            })
            .then((response) => {
                userDataFirst = response.userData;
                token = response.access;
                authModals.login(userDataFirst.email, '12334567890aA');

                authModals.clickOnLoginBtn();
                authModals.clickOnLoginBtn();
                authModals.clickOnLoginBtn();

                authModals.assertNotification('Акаунт заблоковано!');
                cy.wait(9000);
                deleteAllEmails(inboxId);
            });
    });

    after(() => {
        authService.deleteUserByAdmin(token);
    });

    it('user temporary blocked and recover password and login with new password', () => {
        authModals.visit();
        authModals.openLoginModal();
        authModals.clickOnResetPass();
        authModals.typeEmail(emailAddress);
        authModals.clickOnContinueButton();
        cy.wait(9000);
        checkEmailContent(
            inboxId,
            'Код активації',
            ['Ми отримали запит на зміну паролю для вашого облікового запису. Ваш код підтвердження:', followUpText],
            (email) => {
                authModals.checkSupportLink(email.body);
                activationCode = />(\d{6})</.exec(email.body)[1];
                authModals.typeCode(activationCode);
                authModals.clickOnAgreeButton();
                authModals.typePassword(newUserPassword);
                authModals.typeConfirmPassword(newUserPassword);
                authModals.clickOnAgreeButton();
                cy.wait(3000);
                authModals.assertNotification('Пароль успішно змінено!', { timeout: 50000 });
                authModals.typeEmail(emailAddress);
                authModals.typePassword(newUserPassword);
                authModals.clickOnLoginBtn();
                authModals.assertTitle('Моя сторінка');
            }
        );
    });

    it('try to recover password passing previously activation code', () => {
        authModals.visit();
        authModals.openLoginModal();
        authModals.clickOnResetPass();
        authModals.typeEmail(emailAddress);
        authModals.clickOnContinueButton();
        authModals.typeCode(activationCode);
        authModals.clickOnAgreeButton();
        authModals.assertNotification('Некоректний тимчасовий ключ', { timeout: 50000 });
    });

    it('unable to login with old password', () => {
        cy.wait(9000);
        authModals.login(userDataFirst.email, userDataFirst.password);
        authModals.assertNotification('Не вірний логін або пароль', { timeout: 50000 });
    });
});

import AuthModals from '../support/modals/AuthModals';
import { checkEmailContent, createInbox, updateUserInDb } from '../support/helper';
import { authService } from '../api/services';
import { faker } from '@faker-js/faker';

const authModals = new AuthModals();

describe('account blocked by admin', { tags: '@emails' }, () => {
    let userDataFirst;
    let adminToken;
    let userToken;
    let idUser;
    let inboxId;
    let emailAddress;

    before(() => {
        createInbox()
            .then(({ email, id }) => {
                inboxId = id;
                emailAddress = email;
                return authService.createUser('CypressAccount', 'CypBlockAdmin', faker.internet.userName(), emailAddress);
            })
            .then((response) => {
                userDataFirst = response.userData;
                userToken = response.access;
                authService.getUser(userToken).then((response) => {
                    idUser = response.result.id;
                    authService.loginUser(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD')).then((data) => {
                        adminToken = data.access;
                        authService.blockUserAdmin(adminToken, idUser, true);
                    });
                });
            });
    });

    after(() => {
        updateUserInDb('is_blocked', 'false', userDataFirst.email);
        authService.deleteUserByAdmin(userToken);
    });

    it('unable to login if account was blocked', () => {
        authModals.login(userDataFirst.email, userDataFirst.password);
        authModals.assertNotification('Акаунт заблоковано!');
        cy.get('p').contains('Акаунт заблоковано');
        cy.get('p').contains(
            'Ваш акаунт заблоковано через виявлені порушення політики користування. Для отримання інформації та можливих дій щодо відновлення акаунта, зверніться до служби підтримки.'
        );
        cy.get('button').contains('До підтримки');
    });

    it('email about block - delivered to user', () => {
        checkEmailContent(inboxId, 'Аккаунт заблоковано', [
            'Ми хочемо повідомити, що ваш акаунт на BonFair був тимчасово заблокований.',
            'Причина блокування:',
            'Порушення правил користування платформою',
            "Ми розуміємо, що це може викликати незручності, тому якщо ви вважаєте, що це сталося помилково, будь ласка, зв'яжіться з службою підтримки на нашому сайті або за електронною поштою: info@bandbsolution.com.ua протягом 10 робочих днів з моменту отримання цього повідомлення. Ми будемо раді допомогти вам вирішити це питання.",
            'Ми також рекомендуємо ознайомитися з нашими правилами використання , щоб уникнути подібних ситуацій у майбутньому.',
        ]);
    });

    it('unable to use API endpoints if account blocked', () => {
        authService.getUser(userToken, { failOnStatusCode: false }).then((response) => {
            expect(response.status).to.eq('error');
        });
    });
});

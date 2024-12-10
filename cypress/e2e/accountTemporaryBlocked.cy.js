import AuthModals from '../support/modals/AuthModals';
import { checkEmailContent, createInbox, deleteAllEmails, updateUserInDb } from '../support/helper';
import { authService } from '../api/services';
import { faker } from '@faker-js/faker';
import { ProfileActions } from '../support/enums';

const authModals = new AuthModals();
const emailBlockedText = 'Якщо ви забули пароль:';
const emailBlockedText2 =
    'Скористайтеся опцією “Забули пароль” на сторінці входу. Дотримуйтесь інструкцій для створення нового пароля і відновлення доступу до облікового запису.';
const emailBlockedText3 = 'Якщо це були не ви:';
const emailBlockedText4 = "Якщо ви не намагалися увійти в свій обліковий запис, будь ласка, негайно зв'яжіться з нашою службою підтримки.";
const emailBlockedText5 =
    'Це може свідчити про спробу несанкціонованого доступу до вашого облікового запису. Для додаткової безпеки ми рекомендуємо змінити ваш пароль.';
const emailBlockedText6 = 'Ми дбаємо про безпеку ваших даних і працюємо над тим, щоб ваш обліковий запис був захищений.';

describe('user input 3 times incorrect password', { tags: '@emails' }, () => {
    let userDataFirst;
    let inboxId;
    let emailAddress;
    let userToken;

    before(() => {
        createInbox()
            .then(({ email, id }) => {
                inboxId = id;
                emailAddress = email;
                return authService.createUser('CypressBlockedAccount', 'CypBlAcc', faker.internet.userName(), emailAddress);
            })
            .then((response) => {
                userDataFirst = response.userData;
                userToken = response.access;
            });
    });

    after(() => {
        authService.deleteUserByAdmin(userToken);
    });

    it("user input 3 times incorrect password and blocked for 15 min and don't have access to site until recover password", () => {
        authModals.login(userDataFirst.email, '12334567890aA');

        authModals.passwordField.clear().type(userDataFirst.password);
        authModals.clickOnLoginBtn();
        authModals.navigateToMenuItem(ProfileActions.LOGOUT);

        authModals.login(userDataFirst.email, '12334567890aA');

        authModals.clickOnLoginBtn();
        authModals.clickOnLoginBtn();
        authModals.clickOnLoginBtn();

        authModals.assertNotification('Акаунт заблоковано!');
        cy.get('p').contains('Доступ до акаунта заблоковано');
        cy.get('p').contains(
            'Ваш акаунт тимчасово заблоковано через виявлені порушення політики користування. Для отримання інформації та можливих дій щодо відновлення акаунта, зверніться до служби підтримки.'
        );
        cy.get('button').contains('До підтримки');

        checkEmailContent(
            inboxId,
            'Аккаунт заблоковано',
            [
                'Ми хочемо повідомити вас, що доступ до вашого акаунту було тимчасово заблоковано на 15 хвилин через кілька невірних спроб введення паролю.',
                emailBlockedText,
                emailBlockedText2,
                emailBlockedText3,
                emailBlockedText4,
                emailBlockedText5,
                emailBlockedText6,
            ],
            (email) => {
                const supportLink = email.body.match('https://dev.bonfairplace.com/ua/support');
                cy.log('Support Link:', supportLink);
            }
        ).then(() => deleteAllEmails(inboxId));
    });

    it('after 15min user input incorrect password and blocked for 30 min', () => {
        updateUserInDb('blocking_time', '2020-01-01 10:00:00+00', userDataFirst.email);

        authModals.login(userDataFirst.email, '12334567890aAC');
        cy.wait(9000);
        checkEmailContent(
            inboxId,
            'Аккаунт заблоковано',
            [
                'Ми хочемо повідомити вас, що доступ до вашого акаунту було тимчасово заблоковано на 30 хвилин через кілька невірних спроб введення паролю.',
                emailBlockedText,
                emailBlockedText2,
                emailBlockedText3,
                emailBlockedText4,
                emailBlockedText5,
                emailBlockedText6,
            ],
            (email) => {
                const supportLink = email.body.match('https://dev.bonfairplace.com/ua/support');
                cy.log('Support Link:', supportLink);
            }
        ).then(() => deleteAllEmails(inboxId));
    });

    it('after 30min user input incorrect password and blocked for 60 min', () => {
        updateUserInDb('blocking_time', '2020-01-01 10:00:00+00', userDataFirst.email);

        authModals.login(userDataFirst.email, '12334567890aAB');
        cy.wait(9000);
        checkEmailContent(
            inboxId,
            'Аккаунт заблоковано',
            [
                'Ми хочемо повідомити вас, що доступ до вашого акаунту було тимчасово заблоковано на 60 хвилин через кілька невірних спроб введення паролю.',
                emailBlockedText,
                emailBlockedText2,
                emailBlockedText3,
                emailBlockedText4,
                emailBlockedText5,
                emailBlockedText6,
            ],
            (email) => {
                const supportLink = email.body.match('https://dev.bonfairplace.com/ua/support');
                cy.log('Support Link:', supportLink);
            }
        ).then(() => deleteAllEmails(inboxId));
    });

    it('after 60 min user input incorrect password and blocking account until recover password', () => {
        updateUserInDb('blocking_time', '2020-01-01 10:00:00+00', userDataFirst.email);

        authModals.login(userDataFirst.email, '12334567890aAA');
        cy.wait(9000);
        checkEmailContent(inboxId, 'Аккаунт заблоковано', [
            'Ми хочемо повідомити, що доступ до вашого акаунту було заблоковано.',
            'Причина блокування:',
            'Кілька невдалих спроб входу',
            'Для ввідновлення доступу:',
            'Будь ласка, скористайтеся опцією «Забули пароль» на сторінці входу. Це допоможе створити новий пароль та успішно увійти в акаунт. Якщо вам потрібна допомога, зверніться до нашої служби підтримки.',
            emailBlockedText6,
        ]);
        updateUserInDb('blocking_time', '2020-01-01 10:00:00+00', userDataFirst.email);
        authModals.login(userDataFirst.email, userDataFirst.password);
        authModals.assertNotification('Акаунт заблоковано!');
    });
});

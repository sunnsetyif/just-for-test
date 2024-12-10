import { faker } from '@faker-js/faker';
import { authService, postsService } from '../api/services';
import AuthModals from '../support/modals/AuthModals';

const authModal = new AuthModals();

describe('complain functional', { tags: '@smoke' }, () => {
    let userDataFirst;
    let accessTokenFirstUser;

    let userDataSecond;
    let accessTokenSecondUser;
    let idSecondUser;

    let postData;
    let serviceData;
    let messageText = faker.lorem.words(10);
    let newMessageText = faker.lorem.words(10);
    let additionalTextForMessage = faker.lorem.words(10);

    before(() => {
        authService.createUser().then((response) => {
            userDataFirst = response.userData;
            accessTokenFirstUser = response.access;
        });
        authService
            .createUser()
            .then((response) => {
                userDataSecond = response.userData;
                accessTokenSecondUser = response.access;
                authService.getUser(accessTokenSecondUser).then((response) => {
                    idSecondUser = response.result.id;
                    authService.subscribe(accessTokenFirstUser, idSecondUser);
                });
            })
            .then(() => {
                postsService.createPost(accessTokenSecondUser, faker.lorem.paragraph({ min: 8, max: 10 }));
                cy.fixture('serviceCreateData').then((data) => {
                    postsService.createService(accessTokenSecondUser, data);
                });
            });
    });

    beforeEach(() => {
        authModal.login(userDataFirst.email, userDataSecond.password);
        cy.get('[aria-label="Листування"]').click();
    });

    after(() => {
        authService.deleteUserByAdmin(accessTokenFirstUser);
        authService.deleteUserByAdmin(accessTokenSecondUser);
    });

    it('create chat and send: text, post, service, user in message', () => {
        cy.contains('h6', 'У вас поки що немає повідомлень. Знайдіть кому написати та почніть спілкування.').should('be.visible');
        cy.contains('p', 'Ваші повідомлення').should('be.visible');
        cy.contains('p', 'Ваші листування').should('be.visible');
        cy.contains('h6', 'Тут будуть відображатися ваші листування з користувачами.').should('be.visible');

        cy.get('button').contains('Агов люди!').click();
        cy.get('[aria-label="Написати"]').click();
        cy.get('#messageField').click();
        cy.wait(2000);
        cy.get('#messageField').type(messageText);
        cy.get('button').contains('Відправити').click();

        cy.get('[data-testid="DoneIcon"]')
            .should('have.length', 2)
            .each((el) => {
                cy.wrap(el).should('be.visible');
            });
        cy.contains('span', 'щойно').should('be.visible');
        cy.contains('span', 'Сьогодні').should('be.visible');

        cy.visit(`${Cypress.config('baseUrl')}/user-page/${idSecondUser}?type=posts`);
        cy.wait(3000);
        cy.get('[data-testid="SendOutlinedIcon"]').click();
        cy.get('[data-indeterminate="false"]').click();
        cy.get('[placeholder="Ваше повідомлення"]').click();
        cy.wait(2000);
        cy.get('[placeholder="Ваше повідомлення"]').type(additionalTextForMessage);
        cy.get('button').contains('Відправити').click();
        cy.get('img')
            .should('have.attr', 'src')
            .and('match', /\/static\/media\/defaultPostImg\.\w+\.jpg$/);
    });

    // it('create chat and communicate with text', () => {
    //     cy.get('p').contains('Редагувати').click();
    //     cy.contains('div', messageText).should('be.visible');
    //     cy.get('[data-testid="CloseOutlinedIcon]').click();
    //     cy.contains('div', messageText).should('not.be.visible');
    //     cy.get('[data-testid="MoreVertIcon"]').click();
    //     cy.get('p').contains('Редагувати').click();
    //     cy.get('#messageField').click().clear().type(newMessageText);
    //     cy.get('button').contains('Редагувати').click();
    //
    //     cy.get('p').contains('Відправити').click();
    //     cy.get('p').contains('Відмінити відправку').click();
    //     cy.get('p').contains('Відповісти').click();
    // });
});

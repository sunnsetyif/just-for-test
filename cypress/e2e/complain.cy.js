import { faker } from '@faker-js/faker';
import { authService, postsService } from '../api/services';
import AuthModals from '../support/modals/AuthModals';

const authModal = new AuthModals();

const complaintTexts = [
    'Неприйнятний контент',
    'Дискримінація',
    'Дезінформація',
    'Шахрайство та обман',
    'Порушення конфіденційності',
    'Спам',
    'Кібербулінг',
    'Авторське право',
    'Незаконний контент',
    'Пропаганда насильства',
];
const randomIndex = Math.floor(Math.random() * complaintTexts.length);
const randomText = complaintTexts[randomIndex];
// let messageText = faker.lorem.words(10);

describe('complain functional', () => {
    let userDataFirst;
    let idPost;
    let accessTokenFirstUser;
    let accessTokenSecondUser;
    let userDataSecond;
    let postData;
    let serviceData;
    let commentData;
    let idFirstUser;
    let idSecondUser;

    before(() => {
        authService.createUser().then((response) => {
            userDataFirst = response.userData;
            accessTokenFirstUser = response.access;
            authService.getUser(accessTokenFirstUser).then((response) => {
                idFirstUser = response.result.id;
            });
        });
        authService.createUser().then((response) => {
            userDataSecond = response.userData;
            accessTokenSecondUser = response.access;
            authService.getUser(accessTokenSecondUser).then((response) => {
                idSecondUser = response.result.id;
            });
        });
    });

    beforeEach(() => {
        authModal.login(userDataSecond.email, userDataSecond.password);
        cy.wait(3000);
    });

    after(() => {
        authService.deleteUserByAdmin(accessTokenFirstUser);
        authService.deleteUserByAdmin(accessTokenSecondUser);
    });

    it('success complain on POST', () => {
        postsService.createPost(accessTokenFirstUser, faker.lorem.paragraph({ min: 8, max: 10 })).then((response) => {
            idPost = response.result;
            cy.log('Post id:', response.result);
            cy.visit(`${Cypress.config('baseUrl')}/user-page/${idFirstUser}?type=posts`);
            cy.get('[data-testid="MoreVertIcon"]').eq(1).click();
            cy.get('p').contains('Поскаржитись').click();
            cy.get('p').contains(randomText).click();
            cy.get('button').contains('Відправити').click();
            authModal.assertNotification('Скаргу надіслано.');
        });
    });

    it('success complain on USER', () => {
        cy.visit(`${Cypress.config('baseUrl')}/user-page/${idFirstUser}?type=posts`);
        cy.wait(2000);
        cy.get('[data-testid="MoreVertIcon"]').eq(0).click();
        cy.get('p').contains('Поскаржитись').click();
        cy.get('p').contains(randomText).click();
        cy.get('button').contains('Відправити').click();
        authModal.assertNotification('Скаргу надіслано.');
    });

    it('success complain on SERVICE', () => {
        cy.fixture('serviceCreateData').then((data) => {
            postsService.createService(accessTokenFirstUser, data).then((response) => {
                cy.log('Response body created SERVICE:', JSON.stringify(response));
                serviceData = response;
                cy.log('Service id:', response.result);
                cy.visit(`${Cypress.config('baseUrl')}/service/${response.result}`);
                cy.get('[data-testid="MoreVertIcon"]').click();
                cy.get('p').contains('Поскаржитись').click();
                cy.get('p').contains(randomText).click();
                cy.get('button').contains('Відправити').click();
                authModal.assertNotification('Скаргу надіслано.');
            });
        });
    });

    it('success complain on COMMENT', () => {
        postsService.createComment(accessTokenFirstUser, 'Comment for post test notifications', idPost).then((response) => {
            commentData = response;
            cy.visit(`${Cypress.config('baseUrl')}/post/${idPost}`);
            cy.get('[data-testid="MoreVertIcon"]').eq(1).click();
            cy.get('p').contains('Поскаржитись').click();
            cy.get('p').contains(randomText).click();
            cy.get('button').contains('Відправити').click();
            authModal.assertNotification('Скаргу надіслано.');
        });
    });

    // it('success complain on CHAT', () => {
    //     notificationService.createChat(accessTokenSecondUser, idSecondUser, idFirstUser).then((response) => {
    //         cy.get('[aria-label="Листування"]').click();
    //         cy.get('#messageField').click();
    //         cy.wait(2000);
    //         cy.get('#messageField').type(messageText);
    //         cy.get('button').contains('Відправити').click();
    //         authModal.navigateToMenuItem(ProfileActions.LOGOUT);
    //
    //         authModal.login(userDataFirst.email, userDataFirst.password);
    //         cy.get('[aria-label="Листування"]').click();
    //         cy.get('[data-testid="MoreVertIcon"]').click();
    //         cy.get('p').contains('Поскаржитись').click();
    //     });
    // });
});

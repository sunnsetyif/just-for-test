import MyProfile from '../support/pages/MyProfile';
import AuthModals from '../support/modals/AuthModals';
import { authService, postsService } from '../api/services';
import { faker } from '@faker-js/faker';

const myProfile = new MyProfile();
const authModal = new AuthModals();

describe('feedback for service', () => {
    let userDataFirst;
    let userDataSecond;
    let accessTokenFirstUser;
    let accessTokenSecondUser;
    let firstUserServiceDataId;

    before(() => {
        authService.createUser().then((response) => {
            userDataFirst = response.userData;
            console.log(response);
            accessTokenFirstUser = response.access;
            cy.fixture('serviceCreateData').then((data) => {
                postsService.createService(accessTokenFirstUser, data).then((response) => {
                    cy.log('Response body created SERVICE:', JSON.stringify(response));
                    firstUserServiceDataId = response.result;
                    cy.log('Service id:', firstUserServiceDataId);
                });
            });
        });
        authService.createUser().then((response) => {
            userDataSecond = response.userData;
            accessTokenSecondUser = response.access;
        });
    });
    after(() => {
        authService.deleteUserByAdmin(accessTokenFirstUser);
        authService.deleteUserByAdmin(accessTokenSecondUser);
    });

    it('service without feedback', () => {
        authModal.login(userDataSecond.email, userDataSecond.password);
        cy.wait(3000);
        const serviceUrl = `${Cypress.config('baseUrl')}/service/${firstUserServiceDataId}`;
        cy.visit(serviceUrl);
        myProfile.waitFoDataLoad();
        cy.get('p').contains('У цього товару поки що немає відгуків. Напиши перший відгук!').should('be.visible');

        cy.get('button').contains('Залишити відгук').click();
        cy.get('button').contains('Опублікувати відгук').click();
        cy.get('p').contains('Мінімальна довжина відгука: 1 символ').should('be.visible');

        cy.get('[placeholder="Опиши більш детально свої враження. Нам дійсно важлива твоя думка!"]').type(faker.lorem.words(10));
    });
});

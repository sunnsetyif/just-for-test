import ComposeRequest from '../composeRequest';
import { faker } from '@faker-js/faker';

const serviceUrl = 'auth';

class Auth {
    readonly apiRequest: ComposeRequest;

    constructor() {
        this.apiRequest = new ComposeRequest();
    }

    getUser(token: string, options = {}): Cypress.Chainable {
        return cy
            .wrap(null)
            .then(() => {
                return this.apiRequest.composeRequest({
                    token,
                    url: `${serviceUrl}/user`,
                    method: 'GET',
                    options: options,
                });
            })
            .then((response) => {
                return cy.wrap(response);
            });
    }

    subscribe(token: string, subscriptionId: string): Cypress.Chainable {
        return cy
            .wrap(null)
            .then(() => {
                return this.apiRequest.composeRequest({
                    token,
                    url: `${serviceUrl}/subscribe?subscriptionId=${subscriptionId}`,
                    method: 'PUT',
                });
            })
            .then((response) => {
                return cy.wrap(response);
            });
    }

    updateUser(token: string, data: {}): Cypress.Chainable {
        return cy
            .wrap(null)
            .then(() => {
                return this.apiRequest.composeRequest({
                    token,
                    url: `${serviceUrl}/user/update`,
                    method: 'PUT',
                    data: data,
                });
            })
            .then((response) => {
                return cy.wrap(response);
            });
    }

    createUser(
        name = faker.person.firstName(),
        surname = faker.person.lastName(),
        nickname = faker.internet.userName(),
        email = faker.internet.email(),
        password = Cypress.env('TEST_USER_PASSWORD'),
        confirmPassword = Cypress.env('TEST_USER_PASSWORD')
    ): Cypress.Chainable {
        const userData = { name, surname, nickname, email, password, confirmPassword };
        return cy
            .wrap(null)
            .then(() => {
                return this.apiRequest.composeRequest({
                    url: `${serviceUrl}/req/qa?qaPassword=${Cypress.env('QA_PASSWORD')}&name=${name}&surname=${surname}&nickname=${nickname}&email=${email}&password=${password}&confirmPassword=${confirmPassword}`,
                    method: 'POST',
                    skipContentType: true,
                });
            })
            .then((response) => {
                return cy.wrap({ ...response, userData });
            });
    }

    loginUser(email: string, password: string): Cypress.Chainable {
        return cy
            .wrap(null)
            .then(() => {
                return this.apiRequest.composeRequest({
                    url: `${serviceUrl}/auth/qa?qaPassword=${Cypress.env('QA_PASSWORD')}&email=${email}&password=${password}`,
                    method: 'POST',
                    skipContentType: true,
                });
            })
            .then((response) => {
                return cy.wrap({ ...response });
            });
    }

    blockUserAdmin(token: string, userId: string, isBlocked: boolean): Cypress.Chainable {
        return cy
            .wrap(null)
            .then(() => {
                return this.apiRequest.composeRequest({
                    token,
                    url: `${serviceUrl}/admin/switch-blocked-status-user?userId=${userId}&isBlockedUser=${isBlocked}`,
                    method: 'PUT',
                });
            })
            .then((response) => {
                return cy.wrap(response);
            });
    }

    deleteUser(token: string, userId: string): Cypress.Chainable {
        return cy
            .wrap(null)
            .then(() => {
                return this.apiRequest.composeRequest({
                    token,
                    url: `${serviceUrl}/admin/delete-user?userId=${userId}`,
                    method: 'DELETE',
                });
            })
            .then((response) => {
                return cy.wrap(response);
            });
    }

    deleteUserByAdmin(userToken: string): Cypress.Chainable {
        let idUser: string;
        let adminToken: string;

        return cy
            .wrap(null)
            .then(() => {
                return this.getUser(userToken);
            })
            .then((response) => {
                idUser = response.result.id;
                return this.loginUser(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
            })
            .then((adminData) => {
                adminToken = adminData.access;
                return this.deleteUser(adminToken, idUser);
            })
            .then((response) => {
                return cy.wrap(response);
            });
    }
}

export default Auth;

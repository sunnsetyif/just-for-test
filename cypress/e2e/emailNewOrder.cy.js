import { checkEmailContent, createInbox } from '../support/helper';
import { authService, postsService } from '../api/services';
import { faker } from '@faker-js/faker';

describe('new order email', { tags: '@emails' }, () => {
    let inboxId;
    let emailAddress;
    let userDataFirst;
    let serviceData;
    let accessTokenFirstUser;
    let accessTokenSecondUser;
    let userDataSecond;
    let idServiceWithKeyForFixture;
    let firstUserServiceDataId;
    let orderId;

    before(() => {
        createInbox()
            .then(({ email, id }) => {
                inboxId = id;
                emailAddress = email;
                return authService.createUser('CypressNewOrder', 'CypMewOrd', faker.internet.userName(), emailAddress);
            })
            .then((response) => {
                userDataFirst = response.userData;
                accessTokenFirstUser = response.access;
            });
        authService.createUser().then((response) => {
            userDataSecond = response.userData;
            accessTokenSecondUser = response.access;
        });
    });

    after(() => {
        postsService.changeStatusOrder(accessTokenFirstUser, orderId, 'DONE');
        authService.deleteUserByAdmin(accessTokenFirstUser);
        authService.deleteUserByAdmin(accessTokenSecondUser);
    });

    it('Prepare Test data API: First user create service. Second user order the service', () => {
        cy.fixture('serviceCreateData').then((data) => {
            serviceData = data;
            postsService.createService(accessTokenFirstUser, data).then((response) => {
                firstUserServiceDataId = response.result;
                idServiceWithKeyForFixture = {
                    serviceId: response.result,
                };
                cy.fixture('orderCreateData').then((fixtureData) => {
                    const orderCreateData = {
                        ...idServiceWithKeyForFixture,
                        ...fixtureData,
                    };
                    postsService.createOrder(accessTokenSecondUser, orderCreateData).then((response) => {
                        orderId = response.result.id;
                    });
                });
            });
        });
    });

    it('Email: new order (first user gets email about new order)', () => {
        checkEmailContent(inboxId, 'Нове замовлення', [`Надійшло нове замовлення від @${userDataSecond.nickname}`, serviceData.nameService]);
    });
});

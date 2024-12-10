import { Statuses } from '../support/enums';
import { checkEmailContent, createInbox, deleteAllEmails } from '../support/helper';
import { authService, postsService } from '../api/services';
import { faker } from '@faker-js/faker';

describe('new order email', { tags: '@emails' }, () => {
    let accessTokenFirstUser;
    let accessTokenSecondUser;
    let userDataFirst;
    let userDataSecond;

    let inboxId;
    let emailAddress;

    let idServiceWithKeyForFixture;
    let firstUserServiceDataId;
    let orderId;

    before(() => {
        createInbox()
            .then(({ email, id }) => {
                inboxId = id;
                emailAddress = email;
                return authService.createUser('CypressChangStatOrder', 'CypChSo', faker.internet.userName(), emailAddress);
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
        authService.deleteUserByAdmin(accessTokenFirstUser);
        authService.deleteUserByAdmin(accessTokenSecondUser);
    });

    it('Prepare Test data API: Second user create service. First user order the service', () => {
        cy.fixture('serviceCreateData').then((data) => {
            postsService.createService(accessTokenSecondUser, data).then((response) => {
                firstUserServiceDataId = response.result;
                idServiceWithKeyForFixture = {
                    serviceId: response.result,
                };
                cy.fixture('orderCreateData').then((fixtureData) => {
                    const orderCreateData = {
                        ...idServiceWithKeyForFixture,
                        ...fixtureData,
                    };
                    postsService.createOrder(accessTokenFirstUser, orderCreateData).then((response) => {
                        orderId = response.result.id;
                    });
                });
            });
        });
    });

    it('order change status on PROCESSING (Second user change status. First user get email)', () => {
        postsService.changeStatusOrder(accessTokenSecondUser, orderId, 'PROCESSING').then(() => {
            checkEmailContent(inboxId, 'Зміна статусу замовлення', [
                `Статус вашого замовлення був змінений:`,
                'Замовлення:',
                `Статус: ${Statuses.NEW} ${Statuses.IN_PROGRESS}`,
            ]).then(() => deleteAllEmails(inboxId));
        });
    });

    it('order change status on SENT (Second user change status. First user get email', () => {
        postsService.changeStatusOrder(accessTokenSecondUser, orderId, 'SENT').then(() => {
            checkEmailContent(inboxId, 'Зміна статусу замовлення', [
                `Статус вашого замовлення був змінений:`,
                'Замовлення:',
                `Статус: ${Statuses.IN_PROGRESS} ${Statuses.SENT}`,
            ]).then(() => deleteAllEmails(inboxId));
        });
    });

    it('order change status on DONE (Second user change status. First user get email', () => {
        postsService.changeStatusOrder(accessTokenSecondUser, orderId, 'DONE').then(() => {
            checkEmailContent(inboxId, 'Зміна статусу замовлення', [
                `Статус вашого замовлення був змінений:`,
                'Замовлення:',
                `Статус: ${Statuses.SENT} ${Statuses.DELIVERED}`,
            ]);
        });
    });
});

import { checkEmailContent, createInbox } from '../support/helper';
import { authService, postsService } from '../api/services';
import { faker } from '@faker-js/faker';

describe('user leave feedback email', { tags: '@emails' }, () => {
    let serviceData;
    let accessTokenFirstUser;
    let accessTokenSecondUser;
    let userDataFirst;
    let userDataSecond;
    let inboxId;
    let emailAddress;
    let firstUserServiceDataId;

    before(() => {
        createInbox()
            .then(({ email, id }) => {
                inboxId = id;
                emailAddress = email;
                return authService.createUser('CypressLeave', 'FeedbackMail', faker.internet.userName(), emailAddress);
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

    it('Prepare Test data API: Second user leave feedback about service and First user gets email', () => {
        cy.fixture('serviceCreateData').then((data) => {
            serviceData = data;
            postsService.createService(accessTokenFirstUser, data).then((response) => {
                firstUserServiceDataId = response.result;
                postsService.createFeedback(accessTokenSecondUser, 'good autotest', firstUserServiceDataId, 1);
            });
        });
    });

    it('Email: user leave feedback (first user gets email about feedback on service)', () => {
        checkEmailContent(inboxId, 'Новий відгук', [`У вас новий відгук:`, `Від: ${userDataSecond.nickname}`, `До: ${serviceData.nameService}`]);
    });
});

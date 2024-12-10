import MyProfile from '../support/pages/MyProfile';
import { ProfileActions, SettingsMenu, SettingsMenuBlocks } from '../support/enums';
import { authService, postsService } from '../api/services';
import AuthModals from '../support/modals/AuthModals';

const myProfile = new MyProfile();
const authModal = new AuthModals();

function disableAllNotifications() {
    cy.iframe('#accSettingsPage')
        .find('[role="region"]')
        .eq(0)
        .then(($region) => {
            const inputs = $region.find('input');

            inputs.each((index, input) => {
                cy.wrap(input).click();
                cy.wait(1000);
            });

            inputs.each((index, input) => {
                cy.wrap(input).should('not.be.checked');
            });
        });
}

describe('Disable all notifications and check', () => {
    let userDataFirst;
    let userDataSecond;
    let accessTokenFirstUser;
    let accessTokenSecondUser;
    let firstUserPostDataId;
    let firstUserCommentDataId;
    let firstUserServiceDataId;
    let idFirstUser;
    let orderId;
    let idServiceWithKeyForFixture;

    before(() => {
        authService.createUser().then((response) => {
            userDataFirst = response.userData;
            accessTokenFirstUser = response.access;
            authModal.login(userDataFirst.email, userDataFirst.password);
            myProfile.choseMenuInSettings(SettingsMenu.Notifications, SettingsMenuBlocks.AccountNotifications);
            disableAllNotifications();
            myProfile.navigateToMenuItem(ProfileActions.LOGOUT);
        });
        authService.createUser().then((response) => {
            userDataSecond = response.userData;
            accessTokenSecondUser = response.access;
            authModal.login(userDataSecond.email, userDataSecond.password);
            myProfile.choseMenuInSettings(SettingsMenu.Notifications, SettingsMenuBlocks.AccountNotifications);
            disableAllNotifications();
            myProfile.navigateToMenuItem(ProfileActions.LOGOUT);
        });
    });

    after(() => {
        authService.deleteUserByAdmin(accessTokenFirstUser);
        authService.deleteUserByAdmin(accessTokenSecondUser);
    });

    it('Prepare test data API: follow from Second user to First user', () => {
        authService.getUser(accessTokenFirstUser).then((response) => {
            idFirstUser = response.result.id;
            authService.subscribe(accessTokenSecondUser, idFirstUser);
        });
    });

    it('Prepare test data API: create on First user: service, post, add comment to post', () => {
        postsService.createPost(accessTokenFirstUser, 'Description for post test notifications').then((response) => {
            firstUserPostDataId = response.result;

            postsService.createComment(accessTokenFirstUser, 'Comment for post test notifications', firstUserPostDataId).then((response) => {
                firstUserCommentDataId = response.result;
            });
        });
        cy.fixture('serviceCreateData').then((data) => {
            postsService.createService(accessTokenFirstUser, data).then((response) => {
                firstUserServiceDataId = response.result;
                idServiceWithKeyForFixture = {
                    serviceId: response.result,
                };
            });
        });
    });

    it('Prepare test data API: Second user: like post, order, comment post, leave feedback - first users', () => {
        postsService.likePost(accessTokenSecondUser, firstUserPostDataId, true);
        postsService.likeComment(accessTokenSecondUser, firstUserCommentDataId, true);
        postsService.createComment(accessTokenSecondUser, 'Hello bro from autotest', firstUserPostDataId);
        postsService.createResponse(accessTokenSecondUser, 'Hello bro from autotest', firstUserCommentDataId);
        postsService.createFeedback(accessTokenSecondUser, 'good autotest', firstUserServiceDataId, 1);
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

    it('Prepare test data API: First user change status of order', () => {
        postsService.changeStatusOrder(accessTokenFirstUser, orderId, 'PROCESSING');
        postsService.changeStatusOrder(accessTokenFirstUser, orderId, 'SENT');
        postsService.changeStatusOrder(accessTokenFirstUser, orderId, 'DONE');
    });

    it('after turned off all notifications First user has 0 notifications', () => {
        authModal.login(userDataFirst.email, userDataFirst.password);
        myProfile.openNotification();
        cy.get('h6').contains('Сповіщення');
        cy.get('p').contains('Немає нових сповіщень');
        myProfile.navigateToMenuItem(ProfileActions.LOGOUT);
    });

    it('after turned off all notifications Second user has 0 notifications', () => {
        authModal.login(userDataSecond.email, userDataSecond.password);
        myProfile.openNotification();
        cy.get('h6').contains('Сповіщення');
        cy.get('p').contains('Немає нових сповіщень');
    });
});

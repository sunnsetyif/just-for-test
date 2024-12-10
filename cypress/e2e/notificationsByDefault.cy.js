import MyProfile from '../support/pages/MyProfile';
import { SettingsMenu, SettingsMenuBlocks } from '../support/enums';
import { authService } from '../api/services';
import AuthModals from '../support/modals/AuthModals';
import { checkCheckBoxesByDefault } from '../support/helper';

const myProfile = new MyProfile();
const authModal = new AuthModals();

describe('default values for notifications on new created user', () => {
    let userDataFirst;
    let accessTokenFirstUser;

    before(() => {
        authService.createUser().then((response) => {
            userDataFirst = response.userData;
            accessTokenFirstUser = response.access;
        });
    });

    after(() => {
        authService.deleteUserByAdmin(accessTokenFirstUser);
    });

    it('all notifications turned on by default and new created user has 0 notifications', () => {
        authModal.login(userDataFirst.email, userDataFirst.password);
        myProfile.openNotification();
        cy.get('h6').contains('Сповіщення');
        cy.get('p').contains('Немає нових сповіщень');
        myProfile.choseMenuInSettings(SettingsMenu.Notifications, SettingsMenuBlocks.AccountNotifications);
        checkCheckBoxesByDefault(0);
    });
});

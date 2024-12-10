import MyProfile from '../support/pages/MyProfile';
import { SettingsMenu, SettingsMenuBlocks } from '../support/enums';
import { authService } from '../api/services';
import { checkCheckBoxesByDefault } from '../support/helper';
import AuthModals from '../support/modals/AuthModals';

const myProfile = new MyProfile();
const authModal = new AuthModals();

describe('default values for email subscribes on new created user', { tags: '@emails' }, () => {
    let userDataFirst;
    let firstToken;

    before(() => {
        authService.createUser().then((response) => {
            userDataFirst = response.userData;
            firstToken = response.access;
        });
    });

    after(() => {
        authService.deleteUserByAdmin(firstToken);
    });

    it('all email subscribes turned on by default', () => {
        authModal.login(userDataFirst.email, userDataFirst.password);
        myProfile.choseMenuInSettings(SettingsMenu.Notifications, SettingsMenuBlocks.EmailSubscription);
        checkCheckBoxesByDefault(1);
    });
});

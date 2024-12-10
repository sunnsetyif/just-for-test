import MyProfile from '../support/pages/MyProfile';
import { ProfileActions } from '../support/enums';
import AuthModals from '../support/modals/AuthModals';
import { authService } from '../api/services';

const myProfile = new MyProfile();
const authModal = new AuthModals();

describe('test all notifications', { tags: '@test' }, () => {
    let userDataFirst;
    let userDataSecond;
    let accessTokenFirstUser;
    let accessTokenSecondUser;

    before(() => {
        authService.createUser().then((response) => {
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

    it('follow from Second user to First user', () => {
        authModal.login(userDataSecond.email, userDataSecond.password);
        cy.get('button').contains('Контакти').click({ force: true });
        cy.get('button').contains('Перейти до пошуку').click({ force: true });
        myProfile.inputInSearchFiled(`${userDataFirst.name} ${userDataFirst.surname}`);
        myProfile.waitFoDataLoad();
        cy.get('button').contains('Контакти').click({ force: true });
        cy.get('[data-testid="PersonOffOutlinedIcon"]').should('be.visible');
        myProfile.navigateToMenuItem(ProfileActions.LOGOUT);
    });
});

import MyProfile from '../support/pages/MyProfile';
import { ProfileActions, SettingsMenu, SettingsMenuBlocks, Switcher } from '../support/enums';
import { authService } from '../api/services';
import AuthModals from '../support/modals/AuthModals';

const myProfile = new MyProfile();
const authModals = new AuthModals();

describe('settings - privacy', () => {
    let userData;
    let token;
    let fixtureData;
    let userDataForFixture;

    before(() => {
        cy.fixture('userUpdateData').then((data) => {
            fixtureData = data;
        });
        authService.createUser().then((response) => {
            userData = response.userData;
            userDataForFixture = {
                name: userData.name,
                surname: userData.surname,
                nickname: userData.nickname,
            };
            token = response.access;
        });
        cy.fixture('userUpdateData').then((fixtureData) => {
            const updatedUserData = {
                ...userDataForFixture,
                ...fixtureData,
            };
            authService.updateUser(token, updatedUserData);
        });
    });

    after(() => {
        authService.deleteUserByAdmin(token);
    });

    it('not hidden user data in search', () => {
        authModals.visit();
        myProfile.openSearchPage();
        myProfile.chooseInSwitcher(Switcher.PEOPLE);
        myProfile.inputInSearchFiled(`${userData.name} ${userData.surname}`);
        myProfile.waitFoDataLoad();
        cy.get('p').contains(`${userData.name} ${userData.surname}`).should('be.visible');
        cy.get('p').contains(`@${userData.nickname}`).should('be.visible');
        cy.get('p').contains(`${fixtureData.city}, ${fixtureData.region} обл., ${fixtureData.country}`).should('be.visible');
        cy.get('p').contains(`${fixtureData.number}`).should('be.visible');
    });

    it('hidde user data throw settings - search page', () => {
        authModals.login(userData.email, userData.password);
        myProfile.choseMenuInSettings(SettingsMenu.SettingsAccount, SettingsMenuBlocks.Privacy);

        cy.iframe('#accSettingsPage').find('[role="region"]').eq(0).find('input').eq(0).should('not.be.checked').click({ force: true });
        cy.iframe('#accSettingsPage').find('[role="region"]').eq(0).find('input').eq(1).should('not.be.checked').click({ force: true });
        cy.iframe('#accSettingsPage').find('[role="region"]').eq(0).find('input').eq(2).should('not.be.checked').click({ force: true });

        cy.iframe('#accSettingsPage').find('[role="region"]').eq(0).find('input').eq(0).should('be.checked');
        cy.iframe('#accSettingsPage').find('[role="region"]').eq(0).find('input').eq(1).should('be.checked');
        cy.iframe('#accSettingsPage').find('[role="region"]').eq(0).find('input').eq(2).should('be.checked');

        myProfile.navigateToMenuItem(ProfileActions.LOGOUT);
        myProfile.openSearchPage();
        myProfile.chooseInSwitcher(Switcher.PEOPLE);
        myProfile.inputInSearchFiled(`${userData.name} ${userData.surname}`);
        myProfile.waitFoDataLoad();
        cy.get('p').contains(`${userData.name} ${userData.surname}`).should('not.exist');
        cy.get('p').contains(`@${userData.nickname}`).should('not.exist');
        cy.get('p').contains(`${fixtureData.city}, ${fixtureData.region} обл., ${fixtureData.country}`).should('not.exist');
        cy.get('p').contains(`${fixtureData.number}`).should('not.exist');
    });
});

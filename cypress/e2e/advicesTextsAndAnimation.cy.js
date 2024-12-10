import MainPage from '../support/pages/MainPage';
import AuthModals from '../support/modals/AuthModals';

const mainPage = new MainPage();
const authModals = new AuthModals();

describe('advices on main page', () => {
    it('advices animation and their text', () => {
        mainPage.visit();
        mainPage.assertUrl(Cypress.config('baseUrl'));
        mainPage.assertTitle('BONFAIR');

        mainPage.validateAdvice1();
        mainPage.validateAdvice2();
        mainPage.validateAdvice3();
        mainPage.clickOnLetsSeeBtn();
        mainPage.assertModalWindow();
        authModals.clickClosModal();
    });
});

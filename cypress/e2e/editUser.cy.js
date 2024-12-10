import { faker } from '@faker-js/faker';
import MyProfile from '../support/pages/MyProfile';
import { checkRequiredFields } from '../support/helper';
import { authService } from '../api/services';
import AuthModals from '../support/modals/AuthModals';

const myProfile = new MyProfile();
const authModal = new AuthModals();

describe('edit user functional', { tags: '@smoke' }, () => {
    const newName = faker.person.firstName();
    const newSurname = faker.person.lastName();
    const newNickname = faker.internet.userName();
    const description = faker.lorem.sentence(20);

    let userData;
    let userDataSecond;
    let firstToken;
    let secondToken;

    before(() => {
        authService.createUser().then((response) => {
            userData = response.userData;
            firstToken = response.access;
        });
        authService.createUser().then((response) => {
            userDataSecond = response.userData;
            secondToken = response.access;
        });
    });

    beforeEach(() => {
        authModal.login(userData.email, userData.password);
    });

    after(() => {
        authService.deleteUserByAdmin(firstToken);
        authService.deleteUserByAdmin(secondToken);
    });

    it('assert default values', () => {
        cy.get('[data-testid="EditOutlinedIcon"]').click();
        cy.get('[name="name"]').should('have.value', userData.name);
        cy.get('[name="surname"]').should('have.value', userData.surname);
        cy.get('[name="nickname"]').should('have.value', userData.nickname);
        cy.get('input[role="combobox"]').eq(0).should('have.value', 'Україна');
        cy.get('label').contains('Область');
        cy.get('label').contains('Населений пункт');
        cy.get('[name="number"]').should('have.value', '+380');
        cy.get('[name="description"]')
            .eq(1)
            .should(
                'have.attr',
                'placeholder',
                'Тут можна описати красним слівцем всі свої переваги. В розумних рамках, звичайно, до 300 символів. '
            );
    });

    it('success edit user', () => {
        cy.get('[data-testid="EditOutlinedIcon"]').click();
        cy.get('[name="name"]').clear().type(newName);
        cy.get('[name="surname"]').clear().type(newSurname);
        cy.get('[name="nickname"]').clear().type(newNickname);
        cy.get('[role="combobox"]').eq(1).type('Київська', { force: true });
        cy.contains('Київська').click();
        cy.get('[role="combobox"]').eq(2).type('Андріївка', { force: true });
        cy.contains('Андріївка').click();
        cy.get('[name="number"]').type('999999999');
        cy.get('[name="description"]').eq(1).type(description);
        myProfile.saveChanges();
        cy.wait(1000);

        cy.get('p').contains(`${newName} ${newSurname}`);
        cy.get('p').contains(`@${newNickname}`);
        cy.get('p').contains(`Андріївка, Київська обл., Україна`);
        cy.get('p').contains(`+380999999999`);
        cy.get('p').contains('Читати більше').click();
        cy.get('p').contains(description);
        cy.get('p').contains('Сховати').click();
    });

    it('use already registered nickname', () => {
        cy.get('[data-testid="EditOutlinedIcon"]').click();
        cy.get('[name="nickname"]').clear().type(userDataSecond.nickname);
        myProfile.saveChanges();
        myProfile.assertNotification('Користувач з таким нікнеймом, вже зареєстрований');
    });

    it('max length for fields and required fields', () => {
        cy.get('[data-testid="EditOutlinedIcon"]').click();

        cy.get('[name="nickname"]').clear().type('a'.repeat(31));
        cy.get('body').click();
        cy.contains('Максимально 30 символів').should('be.visible');
        cy.get('[name="nickname"]').clear();

        cy.get('[name="description"]').eq(1).clear().type('a'.repeat(301));
        cy.get('body').click();
        cy.contains('Максимально 300 символів').should('be.visible');

        cy.get('[name="name"]').clear().type('a'.repeat(101));
        cy.get('body').click();
        cy.contains('Максимально 100 символів').should('be.visible');
        cy.get('[name="name"]').clear();

        cy.get('[name="surname"]').clear().type('a'.repeat(101));
        cy.get('body').click();
        cy.contains('Максимально 100 символів').should('be.visible');
        cy.get('[name="surname"]').clear();
        cy.get('body').click();

        checkRequiredFields(3);
    });

    it('click on TO SETTINGS link in edit modal', () => {
        cy.get('[data-testid="EditOutlinedIcon"]').click();
        cy.get('a').contains('До налаштувань приватності').click();
        authModal.assertUrl('account-settings');
    });
});

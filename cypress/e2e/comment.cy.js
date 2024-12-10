import PostModal from '../support/modals/PostModal';
import { CommentActions } from '../support/enums';
import { faker } from '@faker-js/faker';
import { authService, postsService } from '../api/services';
import AuthModals from '../support/modals/AuthModals';

const postModal = new PostModal();
const authModal = new AuthModals();
const randomComment = faker.lorem.lines(1);
const editedComment = faker.lorem.lines(1);
const randomReplyOnComment = faker.lorem.lines(1);
const editedReply = faker.lorem.lines(1);

describe('smoke comments', { tags: '@smoke' }, () => {
    let userDataFirst;
    let accessTokenFirstUser;

    before(() => {
        authService.createUser().then((response) => {
            userDataFirst = response.userData;
            console.log(response);
            accessTokenFirstUser = response.access;
            postsService.createPost(accessTokenFirstUser, faker.lorem.paragraph({ min: 8, max: 10 }));
        });
    });

    beforeEach(() => {
        authModal.login(userDataFirst.email, userDataFirst.password);
        cy.get('span').contains('Читати більше').click({ force: true });
    });

    after(() => {
        authService.deleteUserByAdmin(accessTokenFirstUser);
    });

    it('add comment', () => {
        cy.get('textarea[placeholder="Прокоментуй тут"]').focus().should('not.be.disabled').and('be.visible').type(randomComment);
        cy.get('button').contains('Додати').click();
        cy.wait(3000);
        cy.contains('span', '0 хв тому').should('be.visible');
        cy.get('h6').contains(`${userDataFirst.nickname}`).should('be.visible');
    });

    it('edit comment', () => {
        postModal.actionsWithComment(CommentActions.Edit);
        cy.wait(3000);
        cy.get('textarea').eq(2).clear().type(editedComment);
        cy.get('button').contains('Зберегти зміни').click({ force: true });
        cy.wait(3000);
        const regex = new RegExp(editedComment.replace(/\n/g, '\\s*'), 'g');
        cy.contains(regex).should('be.visible');
    });

    it('like comment', () => {
        cy.get('[data-testid="FavoriteBorderIcon"]').eq(1).click();
        cy.get('[data-testid="FavoriteIcon"]', { timeout: 5000 }).should('be.visible');
    });

    it('reply on comment', () => {
        cy.wait(3000);
        cy.get('[data-testid="ReplyIcon"]', { timeout: 5000 }).click();
        cy.get('[placeholder="Відповісти"]').type(randomReplyOnComment);
        cy.get('button').eq(10).click();
        cy.get('span').contains('Показати відповіді').click();
        cy.wait(3000);
        cy.get('span').contains(`@${userDataFirst.nickname}`).should('be.visible');
        const regex = new RegExp(randomReplyOnComment.replace(/\n/g, '\\s*'), 'g');
        cy.contains(regex).should('be.visible');
        cy.contains('span', '0 хв тому').should('be.visible');
    });

    it('edit reply on comment', () => {
        cy.get('span').contains('Показати відповіді').click();
        cy.wait(3000);
        postModal.actionsWithComment(CommentActions.Edit);
        cy.get('textarea').eq(2).clear().type(editedReply);
        cy.get('button').contains('Зберегти зміни').click({ force: true });
        cy.get('span').contains('Приховати відповіді').click();
        cy.get('span').contains('Показати відповіді').click();
        cy.wait(3000);
        const regex = new RegExp(editedReply.replace(/\n/g, '\\s*'), 'g');
        cy.contains(regex).should('be.visible');
    });

    it('like reply on comment', () => {
        cy.wait(3000);
        cy.get('[data-testid="FavoriteIcon"]').eq(0).click();
        cy.wait(3000);
        cy.get('span').contains('Показати відповіді').click();
        cy.wait(3000);
        cy.get('[data-testid="FavoriteBorderIcon"]').eq(2).click();
        cy.get('[data-testid="FavoriteIcon"]', { timeout: 5000 }).should('be.visible');
    });

    it('delete reply on comment', () => {
        cy.get('span').contains('Показати відповіді').click();
        cy.wait(3000);
        postModal.actionsWithComment(CommentActions.DeleteReply);
        cy.get('button').contains('Видалити').click();
        // postModal.assertNotification('Відповідь успішно видалена');
    });

    it('delete comment', () => {
        postModal.actionsWithComment(CommentActions.Delete);
        cy.get('button').contains('Видалити').click();
        //  postModal.assertNotification('Коментар успішно видалено');
    });
});

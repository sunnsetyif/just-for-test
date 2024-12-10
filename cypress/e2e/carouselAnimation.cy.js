import MainPage from '../support/pages/MainPage';

const mainPage = new MainPage();
const expectedTexts = [
    'Підтримуй та плекай українське – воно душу й серце гріє.',
    'Знайом зі своїм продуктом, бо він того вартий.',
    'Створюй зв’язки та прозорі стосунки, адже це основа довіри.',
    'Розвивай свій бізнес та отримуй прибуток.',
    'Отримуй миттєві сповіщення, щоб бути завжди в курсі подій.',
    'Ділись своїми новинами – нам це дійсно цікаво.',
];

describe('Carousel animation and text on slides Main page', () => {
    it('Carousel animation and text on slides', () => {
        mainPage.visit();
        for (let i = 0; i <= 5; i++) {
            cy.get(`.slick-slide[data-index="${i}"]`).should('have.class', 'slick-active').and('have.class', 'slick-current');

            cy.get(`.slick-slide[data-index="${i}"] span`).should('exist').and('have.text', expectedTexts[i]);

            cy.wait(5000);
        }
    });
});

import 'cypress-iframe';
const { MailSlurp } = require('mailslurp-client');

const mailslurp = new MailSlurp({ apiKey: Cypress.env('MAILSLURP_API_KEY') });

export function checkRequiredFields(expectedCount) {
    cy.get('form').within(() => {
        cy.get('div')
            .filter((index, el) => el.innerText.trim() === "Це поле обов'язкове")
            .should('have.length', expectedCount)
            .each(($el) => {
                cy.wrap($el).should('be.visible');
            });
    });
}

export function checkCheckBoxesByDefault(regionIndex) {
    cy.iframe('#accSettingsPage')
        .find('[role="region"]')
        .eq(regionIndex)
        .then(($region) => {
            const inputs = $region.find('input');
            inputs.each((index, input) => {
                cy.wrap(input).should('be.checked');
            });
        });
}

export function createInbox() {
    return cy.wrap(mailslurp.createInbox()).then((inbox) => {
        assert.isDefined(inbox, 'Inbox was not created');
        return { id: inbox.id, email: inbox.emailAddress };
    });
}

export function checkEmailContent(inboxId, expectedSubject, expectedTexts = [], customCheck = () => {}) {
    return waitForLatestEmail(inboxId).then((email) => {
        assert.isDefined(email, 'Email is defined');
        const emailContent = {
            subject: email.subject,
            body: email.body,
            timestamp: email.createdAt,
            sender: email.from,
        };
        const fileName = `email_${email.id}.json`;
        const filePath = `cypress/emailsResult/${fileName}`;
        cy.writeFile(filePath, JSON.stringify(emailContent, null, 2));
        cy.log(`Email saved to ${filePath}`);

        assert.strictEqual(email.subject, expectedSubject, `Email subject is correct: ${expectedSubject}`);

        const plainTextBody = email.body
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s\s+/g, ' ')
            .trim();

        expectedTexts.forEach((text) => {
            assert.include(plainTextBody, text, `Email contains the expected text: ${text}`);
        });
        customCheck(email);
    });
}

export function waitForLatestEmail(inboxId, unreadOnly = true) {
    const timeoutMillis = 90_000;
    return cy.wrap(mailslurp.waitForLatestEmail(inboxId, timeoutMillis, unreadOnly), { timeout: timeoutMillis });
}

export function deleteAllEmails(inboxId) {
    return cy.wrap(mailslurp.inboxController.getEmails({ inboxId, minCount: 1, retryTimeout: 90000 })).then((emails) => {
        assert.isNotEmpty(emails, 'Emails have been received');
        return cy.wrap(mailslurp.emailController.deleteAllEmails(inboxId)).then(() => {
            cy.wait(9000);
            return cy.wrap(mailslurp.inboxController.getEmails({ inboxId, minCount: 0, retryTimeout: 90000 })).then((remainingEmails) => {
                assert.isEmpty(remainingEmails, 'All emails have been deleted');
            });
        });
    });
}

export function selectDropdownOption(dropdownName, optionText) {
    cy.get(`input[placeholder="${dropdownName}"]`).click();
    cy.get('.MuiAutocomplete-listbox li').contains(optionText).click();
}

export function logIntoGoogle() {
    const username = Cypress.env('GOOGLE_USERNAME');
    const password = Cypress.env('GOOGLE_PASSWORD');

    Cypress.on('uncaught:exception', (err) => !err.message.includes('ResizeObserver loop') && !err.message.includes('Error in protected function'));

    cy.session(
        [username, password],
        () => {
            cy.visit(Cypress.config('baseUrl'));
            cy.location('href', { timeout: 10000 }).then((currentUrl) => {
                if (currentUrl.includes('accounts.google.com')) {
                    cy.get('input[type="email"]').type(username, { log: false });
                    cy.contains('Next').click();
                    cy.get('input[type="password"]').type(password, { log: false });
                    cy.contains('Next').click().wait(4000);
                    cy.visit('/');

                    cy.getCookie('GCP_IAP_UID').then((cookie) => {
                        if (cookie) {
                            Cypress.env('GCP_IAP_UID', cookie.value);
                        }
                    });

                    cy.getCookie('__Host-GCP_IAP_AUTH_TOKEN_A610B7646B59DE87').then((cookie) => {
                        if (cookie) {
                            Cypress.env('__Host-GCP_IAP_AUTH_TOKEN_A610B7646B59DE87', cookie.value);
                        }
                    });
                }
            });
        },
        {
            cacheAcrossSpecs: true,
            validate: () => {
                cy.getCookie('__Host-GCP_IAP_AUTH_TOKEN_A610B7646B59DE87').should('exist');
            },
        }
    );
}

export function updateUserInDb(columnName, newValue, userEmail) {
    const updateQuery = `
        UPDATE public.users 
        SET ${columnName} = '${newValue}'
        WHERE email = '${userEmail}'
    `;
    cy.task('queryDb', updateQuery).then((updateResult) => {
        cy.log('UPDATE result:', JSON.stringify(updateResult));
    });
}

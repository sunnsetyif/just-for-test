import ComposeRequest from '../composeRequest';

const serviceUrl = 'notification';

class Notification {
    readonly apiRequest: ComposeRequest;

    constructor() {
        this.apiRequest = new ComposeRequest();
    }

    createChat(token: string, userId: string, recipientId: string): Cypress.Chainable {
        return cy
            .wrap(null)
            .then(() => {
                return this.apiRequest.composeRequest({
                    token,
                    url: `${serviceUrl}/chats?userId=${userId}&recipientId=${recipientId}`,
                    method: 'POST',
                });
            })
            .then((response) => {
                return cy.wrap(response);
            });
    }
}

export default Notification;

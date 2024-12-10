// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// support/index.js
import '@cypress/code-coverage/support';
import registerCypressGrep from '@bahmutov/cy-grep/src/support'
registerCypressGrep()
//import { logIntoGoogle } from './helper';

// beforeEach(() => {
//     logIntoGoogle();
// });

// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commonCommands.js using ES2015 syntax:
import './commands/serviceCommands';
import './commands/postCommands';

// Alternatively you can use CommonJS syntax:
// require('./commands')
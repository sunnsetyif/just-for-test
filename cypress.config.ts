import { defineConfig } from 'cypress';
import { Client } from 'pg';
require('dotenv').config();

export default defineConfig({
    watchForFileChanges: false,
    defaultCommandTimeout: 6000,
    experimentalMemoryManagement: true,
    experimentalModifyObstructiveThirdPartyCode: true,
    chromeWebSecurity: false,
    numTestsKeptInMemory: 50,
    reporter: 'mochawesome',
    reporterOptions: {
        reportDir: 'results',
        overwrite: false,
        html: true,
        json: true,
    },
    e2e: {
        experimentalOriginDependencies: true,
        baseUrl: process.env.NODE_ENV === 'prod' ? 'http://localhost:8080' : 'https://dev.bonfairplace.com/ua',
        setupNodeEvents(on, config) {
            require('@cypress/code-coverage/task')(on, config);
            require('@bahmutov/cy-grep/src/plugin')(config);
            const viewportWidth = config.env.VIEWPORT_WIDTH || 1920;
            const viewportHeight = config.env.VIEWPORT_HEIGHT || 1080;
            on('task', {
                async queryDb(queryString) {
                    const client = new Client({
                        user: config.env.user,
                        host: config.env.host,
                        database: config.env.database,
                        password: config.env.password,
                        port: 5433,
                        ssl: false,
                    });
                    await client.connect();
                    const res = await client.query(queryString);
                    await client.end();
                    return res.rows;
                },
            });
            return {
                ...config,
                viewportWidth: parseInt(viewportWidth as string, 10),
                viewportHeight: parseInt(viewportHeight as string, 10),
            };
        },
        env: {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PASSWORD,
            QA_PASSWORD: process.env.QA_PASSWORD,
            ADMIN_EMAIL: process.env.ADMIN_EMAIL,
            ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
            MAILSLURP_API_KEY: process.env.MAILSLURP_API_KEY,
            baseApiUrl: process.env.NODE_ENV === 'prod' ? 'http://localhost:8080' : 'https://dev.bonfairplace.com/v1/',
            GOOGLE_USERNAME: process.env.GOOGLE_USERNAME,
            GOOGLE_PASSWORD: process.env.GOOGLE_PASSWORD,
            TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
            TEST_USER_NEW_PASSWORD: process.env.TEST_USER_NEW_PASSWORD,
            grepFilterSpecs: true,
            grepOmitFiltered: true,
            "coverage" : false,
        },
        supportFile: 'cypress/support/e2e.js',
        experimentalRunAllSpecs: true,
    },
});

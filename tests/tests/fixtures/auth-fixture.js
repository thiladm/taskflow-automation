const base = require('@playwright/test').test;

exports.test = base.extend({
    testUser: [
        async ({ }, use) => {
            const email = `testuser+${Date.now()}@mail.com`;
            const password = 'Test123!';
            await use({ email, password });
        },
        { scope: 'test' }, // Generate a fresh user for each test
    ],
});

const { test } = require('./fixtures/auth-fixture');
const { expect } = require('@playwright/test');
const { createTestUser } = require('../utils/authUtils');
const LoginPage = require('../pageobjests/LoginPage');

test('Positive_Login with valid credentials', async ({ page, testUser }) => {

    const { email, password } = testUser;
    await createTestUser(page, email, password);
    const btnLogout = page.locator("[data-testid=logout-btn]");

    const loginPage = new LoginPage(page);
    await loginPage.landingPage();
    await loginPage.validLogin(email, password);
    //asserting successful login
    await expect(btnLogout).toBeVisible();    

});

test('Negative_Login with invalid credentials', async ({ page, testUser }) => {

    const { email, password } = testUser;
    await createTestUser(page, email, password);
    const tstUnsuccess = page.locator("text=Invalid credentials");

    const loginPage = new LoginPage(page);
    await loginPage.landingPage();
    await loginPage.invalidLogin(email, 'password');
    //asserting unsuccessful login
    await expect(tstUnsuccess).toBeVisible();
});
const { expect } = require('@playwright/test');
// creating test user for the test session

async function createTestUser(page, email, password) {

    await page.goto("https://taskflow-frontend-r624.onrender.com/register");
    await page.locator("#username").fill(email);
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.locator("#confirmPassword").fill(password);
    await page.locator("[data-testid=register-submit-btn]").click();

    // asserting navigating to dashboard upon creating a new user account 
    await expect(page.locator("[data-testid=logout-btn]")).toBeVisible();
    await page.locator("[data-testid=logout-btn]").click();
}

module.exports = { createTestUser };
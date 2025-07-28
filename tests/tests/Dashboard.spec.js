const { test } = require('./fixtures/auth-fixture');
const { expect } = require('@playwright/test');
const { createTestUser } = require('../utils/authUtils');
const LoginPage = require('../pageobjests/LoginPage');
const DashboardPage = require('../pageobjests/DashboardPage');

test('Positive_Creating a new item', async ({ page, testUser }) => {

    const { email, password } = testUser;
    await createTestUser(page, email, password);
    const title = `title+${Date.now()}`;
    const description = "description for automation test";
    
    const loginPage = new LoginPage(page);
    await loginPage.landingPage();
    await loginPage.validLogin(email, password);
    const dashboardPage = new DashboardPage(page);
    // creating a new card
    await dashboardPage.createNewItem(title, description);

    //asserting created card
    const matchingCard = page.locator('.list-card', { hasText: title });
    await expect(matchingCard).toHaveCount(1);
    await expect(matchingCard).toBeVisible();
});

test('Positive_Editing an existing item.', async ({ page, testUser }) => {

    const { email, password } = testUser;
    await createTestUser(page, email, password);
    const title = `title+${Date.now()}`;
    const description = "description for automation test";    
    const updatedTitle = 'Updated Card';

    const loginPage = new LoginPage(page);
    await loginPage.landingPage();
    await loginPage.validLogin(email, password);
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createNewItem(title, description);   
    //edit the card
    await dashboardPage.editExistingItem(title, updatedTitle);
    // assert the card is updated
    await expect(page.locator(".list-card").filter({ hasText:  updatedTitle })).toBeVisible();
});

test('Positive_Delete an existing item.', async ({ page, testUser }) => {

    const { email, password } = testUser;
    await createTestUser(page, email, password);
    const title = `title+${Date.now()}`;
    const description = "description for automation test";    
    

    const loginPage = new LoginPage(page);
    await loginPage.landingPage();
    await loginPage.validLogin(email, password);
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createNewItem(title, description);   
    //assert it's visible before deleting
    const card = page.locator('.list-card').filter({ hasText: title });
    await expect(card).toBeVisible();

    //register dialog handler BEFORE clicking delete
    page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');   
    await dialog.accept(); 
    });

    //delete the card using Page Object method
    await  dashboardPage.deleteExistingItem(title);
     //assert it's no longer visible
     await expect(card).toHaveCount(0);
});
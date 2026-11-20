const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const HomePage = require('../../pages/HomePage');
const loginData = require('../../fixtures/UIData/LoginTestData.json');

test.describe('Automation Exercise - Logout', () => {

    let loginPage
    let homePage

    // Runs before every test
    test.beforeEach(async ({ page }) => {

        loginPage = new LoginPage(page)
        homePage = new HomePage(page)

        await loginPage.navigation('/login')

    });

    test('Verify user can logout successfully', async ({ page }) => {

        await loginPage.login(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD)

        await expect(page.getByText('Logged in as')).toBeVisible()

        await homePage.clickLogout()

        await expect(page).toHaveURL(/\/login$/)
        await expect(page.getByText('Logged in as')).toBeHidden()

    })

})

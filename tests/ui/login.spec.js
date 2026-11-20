const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const loginData = require('../../fixtures/UIData/LoginTestData.json');

test.describe('Automation Exercise - Login', () => {

    let loginPage

    // Runs before every test
    test.beforeEach(async ({ page }) => {

        loginPage = new LoginPage(page)

        await loginPage.navigation('/login')

    })

    test('Verify login with invalid credentials', async () => {

        await loginPage.login(loginData.invalidUser.email, loginData.invalidUser.password)

        await expect(loginPage.loginError).toHaveText(loginData.invalidUser.expectedMessage)

    })

    test('Verify login with valid credentials', async ({ page }) => {

        await loginPage.login(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD)

        await expect(page.getByText('Logged in as')).toBeVisible();

    })

})

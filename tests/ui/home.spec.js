const { test, expect } = require('@playwright/test');
const HomePage = require('../../pages/HomePage');

test.describe('Automation Exercise - Home Page', () => {

    let homePage;

    // Runs before every test
    test.beforeEach(async ({ page }) => {

        homePage = new HomePage(page);

        await homePage.openHomePage();

    });

    test('Verify homepage elements and navigation', async ({ page }) => {

        await expect(page).toHaveURL('/');

        await expect(homePage.logo).toBeVisible();
        await expect(homePage.loginSignupLink).toBeVisible();
        await expect(homePage.productsLink).toBeVisible();
        await expect(homePage.cartLink).toBeVisible();

    });

    test('Verify navigation to login page', async ({ page }) => {

        await homePage.clickLoginSignup();

        await expect(page).toHaveURL(/\/login$/);

    });

    test('Verify navigation to products page', async ({ page }) => {

        await homePage.clickProducts();

        await expect(page).toHaveURL(/\/products$/);

    });

});

const { test, expect } = require('@playwright/test');
const ProductsPage = require('../../pages/ProductsPage');
const CartPage = require('../../pages/CartPage');
const productData = require('../../fixtures/UIData/ProductTestData.json');

test.describe('Automation Exercise - Products', () => {

    let productsPage
    let cartPage

    // Runs before every test
    test.beforeEach(async ({ page }) => {

        productsPage = new ProductsPage(page)
        cartPage = new CartPage(page)

        await productsPage.openProductsPage()

    })

    test('Verify products page is displayed', async ({ page }) => {

        await expect(productsPage.allProductsHeading).toBeVisible()
        await expect(page).toHaveURL(/\/products$/)

    })

    test('Verify product listing is displayed', async () => {

        await expect(productsPage.productCards.first()).toBeVisible()

        const productCount = await productsPage.getProductCount()

        await expect(productsPage.productNames.first()).toBeVisible()
        await expect(productsPage.productPrices.first()).toBeVisible()

    })

    test('Verify product search functionality', async ({ page }) => {

        await productsPage.searchProduct(productData.searchProduct.name)

        await expect(page.getByText('Searched Products')).toBeVisible()
        await expect(productsPage.getSearchedProduct(productData.expectedProduct.name)).toBeVisible()
        await expect(productsPage.getProductPrice(productData.expectedProduct.name)).toHaveText(productData.expectedProduct.price)

    })

    test('Verify user can open product details', async ({ page }) => {

        await productsPage.searchProduct(productData.searchProduct.name)

        await productsPage.openProductDetails(productData.expectedProduct.name)

        await expect(page).toHaveURL(/\/product_details\/1$/)

    })

    test('Verify product can be added to cart', async ({ page }) => {

        await productsPage.addProductToCart(productData.expectedProduct.name)

        await expect(productsPage.addedConfirmation).toBeVisible()
        await expect(productsPage.cartConfirmationMessage).toBeVisible()

        await productsPage.clickViewCart()

        await expect(page).toHaveURL(/\/view_cart$/)

    })

    test('Verify product details in cart', async () => {

        await productsPage.addProductToCart(productData.expectedProduct.name)

        await productsPage.clickViewCart()

        await expect(cartPage.productName).toHaveText(productData.expectedProduct.name)
        await expect(cartPage.productPrice).toHaveText(productData.expectedProduct.price)
        await expect(cartPage.productQuantity).toHaveText(String(productData.singleProductCart.quantity))
        await expect(cartPage.productTotal).toHaveText(productData.singleProductCart.total)

    })

    test('Verify cart total price calculation', async () => {

        await productsPage.addProductToCart(productData.expectedProduct.name)

        await productsPage.clickViewCart()

        const calculatedTotal = await cartPage.getCartTotal()
        const displayedTotal = await cartPage.productTotal.textContent()

        expect(displayedTotal).toBe(`Rs. ${calculatedTotal}`)

    })

})

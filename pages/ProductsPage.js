const BasePage = require('./BasePage')

class ProductsPage extends BasePage {

    constructor(page) {
        super(page)

        this.allProductsHeading = this.page.getByRole('heading', { name: 'All Products', exact: true })
        this.productCards = this.page.locator('.productinfo')
        this.productNames = this.productCards.locator('p')
        this.productPrices = this.productCards.locator('h2')
        this.searchInput = this.page.getByPlaceholder('Search Product')
        this.searchButton = this.page.locator('#submit_search')
        this.addedConfirmation = this.page.getByRole('heading', { name: 'Added!', exact: true })
        this.cartConfirmationMessage = this.page.getByText('Your product has been added to cart.', { exact: true })
        this.viewCartLink = this.page.getByRole('link', { name: 'View Cart' })
        this.continueShoppingButton = this.page.getByRole('button', { name: 'Continue Shopping' })
    }

    async openProductsPage() {
        await this.navigation('/products')
    }

    async getProductCount() {
        return await this.productCards.count();
    }

    async searchProduct(productName) {
        await this.searchInput.fill(productName);
        await this.searchButton.click();
    }

    getSearchedProduct(productName) {
        return this.page.locator('.productinfo').getByText(productName, { exact: true })
    }

    getProductPrice(productName) {
        const product = this.page.locator('.productinfo').filter({ hasText: productName })

        return product.locator('h2')
    }

    async openProductDetails(productName) {

        const product = this.page.locator('.product-image-wrapper').filter({ hasText: productName })

        await product.getByRole('link', { name: 'View Product' }).click()

    }


    async addProductToCart(productName) {

        const product = this.page.locator('.product-image-wrapper')
            .filter({
                has: this.page.locator('.productinfo').getByText(productName, { exact: true })
            })

        await product.waitFor({ state: 'visible' })
        await product.hover()

        const addToCartButton = product.locator('a.add-to-cart').last()

        await addToCartButton.click()

    }


    async verifyProductAdded() {
        await this.addedConfirmation.waitFor({
            state: 'visible'
        })
    }

    async clickViewCart() {
        await this.viewCartLink.click()
    }

    async clickContinueShopping() {
        await this.continueShoppingButton.click()
    }
}

module.exports = ProductsPage

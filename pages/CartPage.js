const BasePage = require('./BasePage')

class CartPage extends BasePage {

    constructor(page) {
        super(page)

        this.cartRow = this.page.locator('#product-1')
        this.productName = this.cartRow.locator('.cart_description h4 a')
        this.productPrice = this.cartRow.locator('.cart_price p')
        this.productQuantity = this.cartRow.locator('.cart_quantity button')
        this.productTotal = this.cartRow.locator('.cart_total_price')
    }

    async getProductName() {
        return await this.productName.textContent();
    }

    async getProductPrice() {
        return await this.productPrice.textContent();
    }

    async getProductQuantity() {
        return await this.productQuantity.textContent();
    }

    async getProductTotal() {
        return await this.productTotal.textContent();
    }

    async getCartTotal() {
        const price = await this.productPrice.textContent();
        const quantity = await this.productQuantity.textContent();

        return Number(price.replace('Rs. ', '')) * Number(quantity);
    }

}

module.exports = CartPage;

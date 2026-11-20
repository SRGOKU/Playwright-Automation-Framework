const BasePage = require('./BasePage');

class HomePage extends BasePage {

    constructor(page) {
        super(page);

        this.logo = this.page.locator('.logo');

        this.loginSignupLink = this.page.getByRole('link', {name: 'Signup / Login'})
        this.productsLink = this.page.getByRole('link', {name: 'Products'});
        this.cartLink = this.page.getByRole('link', {name: 'Cart'});
        this.logoutLink = this.page.getByRole('link', {name: 'Logout'});
    }

    async openHomePage() {
        await this.navigation('/');
    }

    async clickLoginSignup() {
        await this.loginSignupLink.click();
    }

    async clickProducts() {
        await this.productsLink.click();
    }

    async clickCart() {
        await this.cartLink.click();
    }

    async clickLogout() {
        await this.logoutLink.click();
    }
}

module.exports = HomePage;
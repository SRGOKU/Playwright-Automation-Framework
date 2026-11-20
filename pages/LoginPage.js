
const BasePage = require('./BasePage');

class LoginPage extends BasePage {

    constructor(page) {
        super(page);

        this.loginEmail = this.page.getByTestId('login-email');
        this.loginPassword = this.page.getByTestId('login-password');
        this.loginButton = this.page.getByTestId('login-button');

        this.loginError = this.page.locator('p[style*="color: red"]');
    }

    async enterEmail(email) {
        await this.loginEmail.fill(email);
    }

    async enterPassword(password) {
        await this.loginPassword.fill(password);
    }

    async clickLogin() {
        await this.loginButton.click();
    }

    async login(email, password) {
        await this.enterEmail(email);
        await this.enterPassword(password);
        await this.clickLogin();
    }

}

module.exports = LoginPage;

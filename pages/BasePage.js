class BasePage {

    constructor(page) {
        this.page = page
    }

    async navigation(path = '/', options = {}) {
        await this.page.goto(path, options);
    }

    async getPageTitle() {
        return await this.page.title()
    }

    async getCurrentUrl() {
        return this.page.url()
    }
}

module.exports = BasePage
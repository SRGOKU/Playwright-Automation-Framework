class AccountService {

    constructor(apiClient, endpoints) {
        this.apiClient = apiClient;
        this.endpoints = endpoints;
    }

    async createAccount(accountData) {
        return await this.apiClient.post(this.endpoints.createAccount, {
            form: accountData
        });
    }

    async updateAccount(accountData) {
        return await this.apiClient.put(this.endpoints.updateAccount, {
            form: accountData
        });
    }

    async getAccountDetails(email) {
        return await this.apiClient.get(this.endpoints.getUserDetail, {
            params: { email }
        });
    }

    async deleteAccount(email, password) {
        return await this.apiClient.delete(this.endpoints.deleteAccount, {
            form: { email, password }
        });
    }
}

module.exports = AccountService
class AuthenticationService {
    constructor(apiClient, endpoints) {
        this.apiClient = apiClient;
        this.endpoints = endpoints;
    }

    async verifyLogin(credentials) {
        return await this.apiClient.post(this.endpoints.verifyLogin, {
            form: credentials
        });
    }
}

module.exports = AuthenticationService
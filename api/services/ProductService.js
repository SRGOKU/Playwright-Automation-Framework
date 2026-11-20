class ProductService {
    constructor(apiClient, endpoints) {
        this.apiClient = apiClient;
        this.endpoints = endpoints;
    }

    async getAllProducts() {
        return await this.apiClient.get(this.endpoints.products);
    }
}

module.exports = ProductService
class BrandService {
    constructor(apiClient, endpoints) {
        this.apiClient = apiClient;
        this.endpoints = endpoints;
    }

    async getAllBrands() {
        return await this.apiClient.get(this.endpoints.brands);
    }
}

module.exports = BrandService
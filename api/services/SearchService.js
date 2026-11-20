class SearchService {
    constructor(apiClient, endpoints) {
        this.apiClient = apiClient
        this.endpoints = endpoints
    }

    async searchProducts(searchTerm) {
        const options = searchTerm === undefined
            ? {}
            : { form: { search_product: searchTerm } }

        return await this.apiClient.post(
            this.endpoints.searchProduct,
            options
        )
    }
}

module.exports = SearchService
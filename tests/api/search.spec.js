const { test, expect } = require('@playwright/test')

const APIClient = require('../../api/ApiClient.js')
const APIEndpoints = require('../../api/endpoints.js')
const SearchService = require('../../api/services/SearchService.js')
const APIResponseMessages = require('../../fixtures/APIData/APIResponseMessages.json')

test.describe('Automation Exercise - Search API', () => {

    test('POST - Verify product search', async ({ request }) => {

        const apiClient = new APIClient(request)
        const searchService = new SearchService(apiClient, APIEndpoints)

        const response = await searchService.searchProducts('top')
        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(200)
        expect(Array.isArray(responseBody.products)).toBeTruthy()
        expect(responseBody.products.length).toBeGreaterThan(0)

    })

    test('POST - Verify search without search parameter', async ({ request }) => {

        const apiClient = new APIClient(request)
        const searchService = new SearchService(apiClient, APIEndpoints)

        const response = await searchService.searchProducts()
        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(400)
        expect(responseBody.message).toBe(APIResponseMessages.search.missingParameter)

    })

})
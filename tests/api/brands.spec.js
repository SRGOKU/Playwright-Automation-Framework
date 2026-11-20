const { test, expect } = require('@playwright/test')

const APIClient = require('../../api/ApiClient.js')
const APIEndpoints = require('../../api/endpoints.js')
const BrandService = require('../../api/services/BrandService.js')

test.describe('Automation Exercise - Brands API', () => {

    test('GET - Verify all brands list', async ({ request }) => {

        const apiClient = new APIClient(request)
        const brandService = new BrandService(apiClient, APIEndpoints)

        const response = await brandService.getAllBrands()
        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(200)
        expect(Array.isArray(responseBody.brands)).toBeTruthy()
        expect(responseBody.brands.length).toBeGreaterThan(0)

    })

})
const { test, expect } = require('@playwright/test')

const APIClient = require('../../api/ApiClient.js')
const APIEndpoints = require('../../api/endpoints.js')
const ProductService = require('../../api/services/ProductService.js')

test.describe('Automation Exercise - Product API', () => {

    test('GET - Verify all products list', async ({ request }) => {

        const apiClient = new APIClient(request)
        const productService = new ProductService(apiClient, APIEndpoints)

        const response = await productService.getAllProducts()

        const responseText = await response.text()
        const responseBody = JSON.parse(responseText)

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(200)
        expect(Array.isArray(responseBody.products)).toBeTruthy()
        expect(responseBody.products.length).toBeGreaterThan(0)

    })

})

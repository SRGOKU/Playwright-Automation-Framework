const { test, expect } = require('@playwright/test')

const APIClient = require('../../api/ApiClient.js')
const APIEndpoints = require('../../api/endpoints.js')
const AuthenticationService = require('../../api/services/AuthenticationService.js')
const APIResponseMessages = require('../../fixtures/APIData/APIResponseMessages.json')

test.describe('Automation Exercise - Authentication API', () => {

    test('POST - Verify login with valid credentials', async ({ request }) => {

        const apiClient = new APIClient(request);
        const authenticationService = new AuthenticationService(apiClient, APIEndpoints)

        const response = await authenticationService.verifyLogin({
            email: process.env.TEST_USER_EMAIL,
            password: process.env.TEST_USER_PASSWORD
        })

        const responseText = await response.text()
        const responseBody = JSON.parse(responseText)

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(200)
        expect(responseBody.message).toBe(APIResponseMessages.authentication.loginSuccess)

    })

    test('POST - Verify login without email parameter', async ({ request }) => {

        const apiClient = new APIClient(request)
        const authenticationService = new AuthenticationService(apiClient, APIEndpoints)

        const response = await authenticationService.verifyLogin({
            password: process.env.TEST_USER_PASSWORD
        })

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(400)
        expect(responseBody.message).toBe(APIResponseMessages.authentication.missingParameters)
    })

    test('POST - Verify login with invalid credentials', async ({ request }) => {

        const apiClient = new APIClient(request)
        const authenticationService = new AuthenticationService(apiClient, APIEndpoints)

        const response = await authenticationService.verifyLogin({
            email: 'invaliduser123@example.com',
            password: 'WrongPassword123'
        })
        
        const responseText = await response.text()
        const responseBody = JSON.parse(responseText)

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(404)
        expect(responseBody.message).toBe(APIResponseMessages.authentication.invalidCredentials)

    })

})
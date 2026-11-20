const { test, expect, request: apiRequest } = require('@playwright/test')
const APIClient = require('../../api/ApiClient.js')
const APIEndpoints = require('../../api/endpoints.js')
const AccountTestData = require('../../fixtures/APIData/AccountTestData.json')
const APIResponseMessages = require('../../fixtures/APIData/APIResponseMessages.json')
const AccountService = require('../../api/services/AccountService.js')

test.describe.serial('Automation Exercise - Account CRUD API', () => {

    const uniqueEmail = `qa_${Date.now()}@example.com`
    const accountPassword = 'Test@12345'

    let accountCreated = false

    const accountData = {
        ...AccountTestData.account,
        email: uniqueEmail
    }

    const updatedAccountData = {
        ...accountData,
        ...AccountTestData.updatedAccount
    }

    // TEST 1: CREATE ACCOUNT
    test('POST - Create user account', async ({ request }) => {

        const apiClient = new APIClient(request)
        const accountService = new AccountService(apiClient, APIEndpoints)

        const response = await accountService.createAccount(accountData)

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(201)
        expect(responseBody.message).toBe(APIResponseMessages.account.createSuccess)

        accountCreated = true

        // console.log(JSON.stringify(responseBody, null, 4))

    })

    // TEST 2: UPDATE ACCOUNT
    test('PUT - Update user account', async ({ request }) => {

        const apiClient = new APIClient(request)
        const accountService = new AccountService(apiClient, APIEndpoints)

        const response = await accountService.updateAccount(updatedAccountData)

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(200)
        expect(responseBody.message).toBe(APIResponseMessages.account.updateSuccess)

    })

    // TEST 3: READ ACCOUNT
    test('GET - Read user account details', async ({ request }) => {

        const apiClient = new APIClient(request)
        const accountService = new AccountService(apiClient, APIEndpoints)

        const response = await accountService.getAccountDetails(uniqueEmail)

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(200)

        expect(responseBody.user.email).toBe(uniqueEmail)
        expect(responseBody.user.name).toBe(updatedAccountData.name)
        expect(responseBody.user.first_name).toBe(updatedAccountData.firstname)
        expect(responseBody.user.last_name).toBe(updatedAccountData.lastname)
        expect(responseBody.user.company).toBe(updatedAccountData.company)
        expect(responseBody.user.city).toBe(updatedAccountData.city)

    })

    // TEST 4: DELETE ACCOUNT
    test('DELETE - Delete user account', async ({ request }) => {

        const apiClient = new APIClient(request)
        const accountService = new AccountService(apiClient, APIEndpoints)

        const response = await accountService.deleteAccount(uniqueEmail, accountPassword)

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(200)
        expect(responseBody.message).toBe(APIResponseMessages.account.deleteSuccess)

        accountCreated = false

    })

    test('GET - Verify user details without email parameter', async ({ request }) => {

        const apiClient = new APIClient(request)

        const response = await apiClient.get(APIEndpoints.getUserDetail)

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(400)
        expect(responseBody.message).toBe(APIResponseMessages.account.missingEmail)

    })

    test('POST - Verify account creation without email', async ({ request }) => {

        const apiClient = new APIClient(request)

        const response = await apiClient.post(APIEndpoints.createAccount, {
            form: {
                name: 'QA Negative Test',
                password: 'Test@12345'
            }
        })

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(400)

    })

    test('POST - Verify account creation without password', async ({ request }) => {

        const apiClient = new APIClient(request)

        const response = await apiClient.post(APIEndpoints.createAccount, {
            form: {
                name: 'QA Negative Test',
                email: `qa_negative_${Date.now()}@example.com`
            }
        })

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(400)

    })

    test('PUT - Verify account update without email', async ({ request }) => {

        const apiClient = new APIClient(request);

        const response = await apiClient.put(APIEndpoints.updateAccount, {
            form: {
                password: 'Test@12345',
                name: 'Updated QA User',
                firstname: 'Updated',
                lastname: 'Tester'
            }
        })

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(400)

    })

    test('PUT - Verify account update without password', async ({ request }) => {

        const apiClient = new APIClient(request)

        const response = await apiClient.put(APIEndpoints.updateAccount, {
            form: {
                email: `qa_negative_${Date.now()}@example.com`,
                name: 'Updated QA User',
                firstname: 'Updated',
                lastname: 'Tester'
            }
        })

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(400)

    })

    test('DELETE - Verify account deletion without email', async ({ request }) => {

        const apiClient = new APIClient(request)

        const response = await apiClient.delete(APIEndpoints.deleteAccount, {
            form: {
                password: 'Test@12345'
            }
        })

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(400)

    })

    test('DELETE - Verify account deletion without password', async ({ request }) => {

        const apiClient = new APIClient(request)

        const response = await apiClient.delete(APIEndpoints.deleteAccount, {
            form: {
                email: `qa_negative_${Date.now()}@example.com`
            }
        })

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(400)

    })

    test('GET - Verify user details with non-existing email', async ({ request }) => {

        const apiClient = new APIClient(request)

        const response = await apiClient.get(APIEndpoints.getUserDetail, {
            params: {
                email: `non_existing_${Date.now()}@example.com`
            }
        })

        const responseText = await response.text()
        const responseBody = JSON.parse(responseText)
        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(404)

    })

    test('POST - Verify account creation with duplicate email', async ({ request }) => {

        const apiClient = new APIClient(request)

        const uniqueEmail = `qa_duplicate_${Date.now()}@example.com`

        const accountData = {
            ...AccountTestData.account,
            email: uniqueEmail
        }

        let accountCreated = false;

        try {

            // First registration
            const firstResponse = await apiClient.post(APIEndpoints.createAccount, {
                form: accountData
            })

            const firstResponseBody = await firstResponse.json()

            expect(firstResponseBody.responseCode).toBe(201)

            accountCreated = true

            // Attempt registration with the same email
            const duplicateResponse = await apiClient.post(APIEndpoints.createAccount, {
                form: accountData
            })

            const duplicateResponseBody = await duplicateResponse.json()

            expect(duplicateResponse.status()).toBe(200)
            expect(duplicateResponseBody.responseCode).toBe(400)
            expect(duplicateResponseBody.message).toBe(APIResponseMessages.account.duplicateEmail)

        } finally {

            // Clean up the first account
            if (accountCreated) {
                const deleteResponse = await apiClient.delete(APIEndpoints.deleteAccount, {
                    form: {
                        email: uniqueEmail,
                        password: accountData.password
                    }
                })

                const deleteResponseBody = await deleteResponse.json()

                expect(deleteResponseBody.responseCode).toBe(200)
            }
        }

    })

    test('DELETE - Verify deletion of non-existing account', async ({ request }) => {

        const apiClient = new APIClient(request)

        const response = await apiClient.delete(APIEndpoints.deleteAccount, {
            form: {
                email: `non_existing_${Date.now()}@example.com`,
                password: 'Test@12345'
            }
        })

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(404)

    })

    test('PUT - Verify update of non-existing account', async ({ request }) => {

        const apiClient = new APIClient(request)

        const response = await apiClient.put(APIEndpoints.updateAccount, {
            form: {
                name: 'Updated QA User',
                email: `non_existing_${Date.now()}@example.com`,
                password: 'Test@12345',
                firstname: 'Updated',
                lastname: 'Tester',
                company: 'Updated QA Company',
                address1: 'Test Street',
                country: 'India',
                zipcode: '395003',
                state: 'Gujarat',
                city: 'Ahmedabad',
                mobile_number: '9876543210'
            }
        })

        const responseBody = await response.json()

        expect(response.status()).toBe(200)
        expect(responseBody.responseCode).toBe(404)

    })

    // BACKUP CLEANUP
    test.afterAll(async () => {

        if (accountCreated) {

            const apiContext = await apiRequest.newContext({
                baseURL: process.env.BASE_URL
            })

            try {

                const apiClient = new APIClient(apiContext)

                const response = await apiClient.delete(APIEndpoints.deleteAccount, {
                    form: {
                        email: uniqueEmail,
                        password: accountPassword
                    }
                })

                const responseBody = await response.json()

                if (responseBody.responseCode === 200) {
                    accountCreated = false
                }

            } finally {
                await apiContext.dispose()
            }
        }

    })

})
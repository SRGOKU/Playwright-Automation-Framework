require('dotenv').config();
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({

    // 1. Location of test files
    testDir: './tests',

    // 2. Run independent tests in parallel
    fullyParallel: false,

    // 3. Prevent test.only from accidentally running alone in CI
    forbidOnly: !!process.env.CI,

    // 4. Retry failed tests in CI
    retries: process.env.CI ? 2 : 0,

    // 5. Worker configuration
    // workers: process.env.CI ? 1 : undefined,
    workers: 1,
    // 6. Test reporting
    reporter: 'html',

    // 7. Browser and test settings
    use: {
        baseURL: process.env.BASE_URL,
        channel: 'chrome',
        headless: process.env.CI ? true : false,
        launchOptions: { args: ['--start-maximized'] },
        viewport: null,
        testIdAttribute: 'data-qa',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry'
    },

    // 8. Browser projects

    projects: [
        {
            name: 'chrome',
            testMatch: /tests\/ui\/.*\.spec\.js/
        },
        {
            name: 'api',
            testMatch: /tests\/api\/.*\.spec\.js/
        }
    ]

})

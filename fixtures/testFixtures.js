
const { test: base, expect } = require('@playwright/test');

const test = base.extend({

    sharedContext: [
        async ({ browser }, use) => {

            const context = await browser.newContext();

            await use(context);

            await context.close();

        },
        { scope: 'worker' }
    ],

    sharedPage: [
        async ({ sharedContext }, use) => {

            const page = await sharedContext.newPage();

            await use(page);

            // Page is closed when the worker finishes
            // Context cleanup closes the page automatically

        },
        { scope: 'worker' }
    ],

    page: async ({ sharedPage }, use) => {

        await use(sharedPage);

    }

});

module.exports = { test, expect };

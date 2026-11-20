
const providerConfig = {
    activeProvider: process.env.AI_PROVIDER || 'mock',

    // Keep paid providers disabled unless free credits are confirmed.
    allowPaidProviders: false,

    gemini: {
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash'
    },

    claude: {
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5'
    },

    openai: {
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini'
    }
};

module.exports = providerConfig;

"use strict";

function assertTradingCredentials() {
    const required = ["API_KEY", "API_SECRET", "API_PASSPHRASE"];
    const missing = required.filter(
        (k) => !process.env[k] || !String(process.env[k]).trim()
    );
    if (missing.length > 0) {
        const err = new Error(
            `Missing required environment variables: ${missing.join(
                ", "
            )}. Copy .env.example to .env and add your API credentials.`
        );
        err.code = "ERR_MISSING_CREDENTIALS";
        throw err;
    }
}

module.exports = { assertTradingCredentials };

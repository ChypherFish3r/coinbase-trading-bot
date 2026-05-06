"use strict";

require("dotenv").config();

const logger = require("./lib/logger");
const { strategies, resolveStrategy } = require("./lib/strategies");
const { assertTradingCredentials } = require("./lib/validateEnv");

const strategyKey = process.env.STRATEGY || "momentum";
const entry = resolveStrategy(strategyKey);

if (!entry) {
    logger.error(
        {
            STRATEGY: strategyKey,
            valid: Object.keys(strategies).join(", "),
        },
        "Unknown STRATEGY — use one of the keys listed in valid"
    );
    process.exit(1);
}

logger.info(
    {
        strategy: strategyKey,
        description: entry.description,
        tradingEnv: process.env.TRADING_ENV || "sandbox",
    },
    "Coinbase trading bot starting"
);

try {
    if (entry.requiresAuth) {
        assertTradingCredentials();
    }
} catch (err) {
    logger.error(err.message || err);
    process.exit(1);
}

function shutdown(signal) {
    logger.info({ signal }, "Shutdown requested — exiting");
    process.exit(0);
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

entry.run().catch((err) => {
    logger.error(err, "Fatal error");
    process.exit(1);
});

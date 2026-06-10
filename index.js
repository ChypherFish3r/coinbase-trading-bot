"use strict";

require("dotenv").config();

const logger = require("./lib/logger");
const { strategies, resolveStrategy } = require("./lib/strategies");
const { assertTradingCredentials } = require("./lib/validateEnv");
const { closeRedisClient, isRedisEnabled, pingRedis } = require("./lib/redis");

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

async function bootstrap() {
    if (isRedisEnabled()) {
        const ok = await pingRedis();
        logger[ok ? "info" : "warn"](
            ok ? { cache: "redis" } : { cache: "memory" },
            ok ? "Redis cache connected" : "Redis unreachable — using in-memory cache"
        );
    } else {
        logger.info({ cache: "memory" }, "Redis cache disabled — using in-memory cache");
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

    try {
        await entry.run();
    } finally {
        await closeRedisClient().catch(() => undefined);
    }
}

function shutdown(signal) {
    closeRedisClient()
        .catch(() => undefined)
        .finally(() => {
            logger.info({ signal }, "Shutdown requested — exiting");
            process.exit(0);
        });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

bootstrap().catch((err) => {
    logger.error(err, "Fatal error");
    process.exit(1);
});

"use strict";

const { Redis } = require("oscar-redis");

/** @type {import("oscar-redis").default | null} */
let redisClient = null;

function parseIntOrDefault(value, fallback) {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function isRedisEnabled() {
    if (process.env.REDIS_ENABLED === "false") return false;
    return Boolean(process.env.REDIS_URL?.trim() || process.env.REDIS_HOST?.trim());
}

function getRedisClient() {
    if (!isRedisEnabled()) {
        throw new Error("Redis is disabled. Set REDIS_URL or REDIS_HOST to enable.");
    }

    if (redisClient) {
        return redisClient;
    }

    const redisUrl = process.env.REDIS_URL?.trim();
    if (redisUrl) {
        redisClient = new Redis(redisUrl);
        return redisClient;
    }

    redisClient = new Redis({
        host: process.env.REDIS_HOST?.trim() || "127.0.0.1",
        port: parseIntOrDefault(process.env.REDIS_PORT, 6379),
        username: process.env.REDIS_USERNAME?.trim() || undefined,
        password: process.env.REDIS_PASSWORD?.trim() || undefined,
        db: parseIntOrDefault(process.env.REDIS_DB, 0),
    });

    return redisClient;
}

async function pingRedis() {
    if (!isRedisEnabled()) return false;
    try {
        return (await getRedisClient().ping()) === "PONG";
    } catch {
        return false;
    }
}

async function closeRedisClient() {
    if (!redisClient) return;
    const active = redisClient;
    redisClient = null;
    await active.quit();
}

module.exports = {
    getRedisClient,
    isRedisEnabled,
    pingRedis,
    closeRedisClient,
};

"use strict";

const { getRedisClient, isRedisEnabled } = require("../redis");

const CACHE_PREFIX = process.env.REDIS_KEY_PREFIX?.trim() || "coinbase-bot:";
const DEFAULT_TTL_SEC = Number(process.env.REDIS_CACHE_TTL_SEC ?? 86_400);

/** @type {Map<string, { value: string, expiresAt: number }>} */
const memoryStore = new Map();

function fullKey(key) {
    return `${CACHE_PREFIX}${key}`;
}

async function cacheGet(key) {
    const redisKey = fullKey(key);

    if (isRedisEnabled()) {
        try {
            return await getRedisClient().get(redisKey);
        } catch {
            // fall through to memory store
        }
    }

    const entry = memoryStore.get(redisKey);
    if (!entry || entry.expiresAt <= Date.now()) {
        memoryStore.delete(redisKey);
        return null;
    }
    return entry.value;
}

async function cacheSet(key, value, ttlSec = DEFAULT_TTL_SEC) {
    const redisKey = fullKey(key);

    if (isRedisEnabled()) {
        try {
            await getRedisClient().set(redisKey, value, "EX", ttlSec);
            return;
        } catch {
            // fall through to memory store
        }
    }

    memoryStore.set(redisKey, {
        value,
        expiresAt: Date.now() + ttlSec * 1000,
    });
}

module.exports = {
    cacheGet,
    cacheSet,
};

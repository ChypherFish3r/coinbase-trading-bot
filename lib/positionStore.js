"use strict";

const fs = require("fs");
const { cacheGet, cacheSet } = require("./cache/store");
const { isRedisEnabled } = require("./redis");
const { positionDataPath } = require("./paths");

const CACHE_KEY = "position-data";

/**
 * @returns {Promise<{ source: "redis" | "memory" | "file" | "none", position: object }>}
 */
async function loadPosition() {
    const cached = await cacheGet(CACHE_KEY);
    if (cached) {
        return {
            source: isRedisEnabled() ? "redis" : "memory",
            position: JSON.parse(cached),
        };
    }

    try {
        const raw = fs.readFileSync(positionDataPath(), "utf8");
        return { source: "file", position: JSON.parse(raw) };
    } catch (err) {
        if (err && err.code === "ENOENT") {
            return { source: "none", position: { positionExists: false } };
        }
        throw err;
    }
}

/**
 * @param {object} positionInfo
 * @returns {Promise<void>}
 */
async function savePosition(positionInfo) {
    const raw = JSON.stringify(positionInfo);
    await cacheSet(CACHE_KEY, raw);
    fs.writeFileSync(positionDataPath(), raw);
}

module.exports = {
    loadPosition,
    savePosition,
};

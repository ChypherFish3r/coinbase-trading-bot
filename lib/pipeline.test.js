"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.join(__dirname, "..");

function runIndex(extraEnv = {}) {
    const env = {
        ...process.env,
        REDIS_ENABLED: "false",
        LOG_LEVEL: "info",
        ...extraEnv,
    };
    delete env.REDIS_URL;
    delete env.REDIS_HOST;

    return spawnSync(process.execPath, ["index.js"], {
        cwd: projectRoot,
        env,
        encoding: "utf8",
    });
}

describe("coinbase trading bot pipeline", () => {
    it("rejects unknown strategies", () => {
        const result = runIndex({ STRATEGY: "not-a-strategy" });
        assert.equal(result.status, 1);
        assert.match(result.stderr + result.stdout, /Unknown STRATEGY/);
    });

    it("requires API credentials for live momentum strategy", () => {
        const result = runIndex({
            STRATEGY: "momentum",
            API_KEY: "",
            API_SECRET: "",
            API_PASSPHRASE: "",
        });
        assert.equal(result.status, 1);
        assert.match(result.stderr + result.stdout, /Missing required environment variables/);
    });

    it("runs momentum analyzer end-to-end on fixture CSV", () => {
        const result = runIndex({
            STRATEGY: "momentum_analyze",
            CSV_DATA_FILE: "fixtures/sample-ohlc.csv",
        });
        assert.equal(
            result.status,
            0,
            `analyzer failed:\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
        );
        assert.match(result.stdout + result.stderr, /numberOfBuys|amountOfProfitGenerated/);
    });

    it("runs reverse analyzer end-to-end on fixture CSV", () => {
        const result = runIndex({
            STRATEGY: "reverse_analyze",
            CSV_DATA_FILE: "fixtures/sample-ohlc.csv",
        });
        assert.equal(
            result.status,
            0,
            `reverse analyzer failed:\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
        );
        assert.match(result.stdout + result.stderr, /numberOfBuys|amountOfProfitGenerated/);
    });
});

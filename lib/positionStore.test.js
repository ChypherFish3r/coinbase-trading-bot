"use strict";

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { loadPosition, savePosition } = require("./positionStore");

const fixturePath = path.join(process.cwd(), "positionData.test.json");

describe("positionStore", () => {
    beforeEach(() => {
        delete process.env.REDIS_URL;
        delete process.env.REDIS_HOST;
        process.env.REDIS_ENABLED = "false";
        process.env.POSITION_DATA_FILE = "positionData.test.json";
        if (fs.existsSync(fixturePath)) fs.unlinkSync(fixturePath);
    });

    afterEach(() => {
        if (fs.existsSync(fixturePath)) fs.unlinkSync(fixturePath);
    });

    it("returns empty position when no cache or file exists", async () => {
        const loaded = await loadPosition();
        assert.equal(loaded.source, "none");
        assert.equal(loaded.position.positionExists, false);
    });

    it("persists position to file and reloads it", async () => {
        const position = {
            positionExists: true,
            positionAcquiredPrice: 1.25,
            positionAcquiredCost: 100,
        };

        await savePosition(position);
        const loaded = await loadPosition();

        assert.equal(loaded.source, "memory");
        assert.deepEqual(loaded.position, position);
    });
});

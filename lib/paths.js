"use strict";

const path = require("path");

/**
 * Resolved path for persisted position state (restart / resume).
 * Override with POSITION_DATA_FILE (relative to cwd or absolute).
 */
function positionDataPath() {
    const rel = process.env.POSITION_DATA_FILE || "positionData.json";
    return path.isAbsolute(rel) ? rel : path.resolve(process.cwd(), rel);
}

module.exports = { positionDataPath };

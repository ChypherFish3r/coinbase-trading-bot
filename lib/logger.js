"use strict";

const pino = require("pino");

module.exports = pino({
    level: process.env.LOG_LEVEL || "info",
});

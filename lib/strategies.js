"use strict";

/** @typedef {{ requiresAuth: boolean, description: string, run: () => Promise<void> }} StrategyEntry */

/** @type {Record<string, StrategyEntry>} */
const strategies = {
    momentum: {
        requiresAuth: true,
        description: "Peak/valley momentum — buy strength, sell into mean reversion",
        run() {
            return require("../strategies/momentumTrading/momentumTrading")();
        },
    },
    reverse: {
        requiresAuth: true,
        description: "Reverse momentum — fade rallies, scale into dips",
        run() {
            return require("../strategies/reverseMomentumTrading/reverseMomentumTrading")();
        },
    },
    momentum_stoploss: {
        requiresAuth: true,
        description: "Momentum with configurable stop-loss",
        run() {
            return require("../strategies/momentumTradingWithStopLoss/momentumTradingWithStopLoss")();
        },
    },
    momentum_analyze: {
        requiresAuth: false,
        description: "Backtest momentum strategy on OHLC CSV data",
        run() {
            return require("../strategies/momentumTrading/momentumTradingAnalyzer")();
        },
    },
    reverse_analyze: {
        requiresAuth: false,
        description: "Backtest reverse momentum on OHLC CSV data",
        run() {
            return require("../strategies/reverseMomentumTrading/reverseMomentumTradingAnalyzer")();
        },
    },
};

/**
 * @param {string} [name]
 * @returns {StrategyEntry | undefined}
 */
function resolveStrategy(name) {
    const key = String(name || "momentum")
        .trim()
        .toLowerCase()
        .replace(/-/g, "_");
    return strategies[key];
}

module.exports = { strategies, resolveStrategy };

"use strict";
/**
 * Base Bridge Interface
 *
 * This file defines the base interface for all bridges between Aetherion and other blockchain networks.
 * Each specific blockchain bridge will extend this interface.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseBridge = void 0;
const events_1 = require("events");
class BaseBridge extends events_1.EventEmitter {
    constructor(bridgeId, config) {
        super();
        this.bridgeId = bridgeId;
        this.config = config;
    }
    // Helper methods
    getConfig() {
        return this.config;
    }
    getBridgeId() {
        return this.bridgeId;
    }
    setConfig(updatedConfig) {
        this.config = { ...this.config, ...updatedConfig };
    }
}
exports.BaseBridge = BaseBridge;

"use strict";
/**
 * AetherCoin BioZoeCurrency Types
 *
 * Contains all the type definitions for the AetherCoin BioZoeCurrency ecosystem.
 * Defines the token lifecycle states, transaction types, and quantum entanglement types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BioZoeTransactionType = exports.QuantumEntanglementType = exports.BioZoeLifecycleState = void 0;
/**
 * BioZoe Token Lifecycle States
 *
 * Tokens progress through four stages following natural biological patterns:
 * - SEED: Initial token creation state (like a seed in nature)
 * - GROWTH: Developing token with increasing potential (growing plant)
 * - FLOWERING: Peak value and energy state (flowering plant)
 * - LEGACY: Transformed state that enables new generation (fruit/seed bearing)
 */
var BioZoeLifecycleState;
(function (BioZoeLifecycleState) {
    BioZoeLifecycleState["SEED"] = "seed";
    BioZoeLifecycleState["GROWTH"] = "growth";
    BioZoeLifecycleState["FLOWERING"] = "flowering";
    BioZoeLifecycleState["LEGACY"] = "legacy";
})(BioZoeLifecycleState || (exports.BioZoeLifecycleState = BioZoeLifecycleState = {}));
/**
 * Quantum Entanglement Types
 *
 * Defines how tokens can be quantum entangled with each other:
 * - SYMBIOTIC: Both tokens grow together
 * - COMPETITIVE: One token's growth can diminish the other
 * - CATALYTIC: One token accelerates another's growth
 * - REGENERATIVE: Tokens help each other recover
 */
var QuantumEntanglementType;
(function (QuantumEntanglementType) {
    QuantumEntanglementType["SYMBIOTIC"] = "symbiotic";
    QuantumEntanglementType["COMPETITIVE"] = "competitive";
    QuantumEntanglementType["CATALYTIC"] = "catalytic";
    QuantumEntanglementType["REGENERATIVE"] = "regenerative";
})(QuantumEntanglementType || (exports.QuantumEntanglementType = QuantumEntanglementType = {}));
/**
 * BioZoe Transaction Types
 *
 * Defines the various operations that can occur in the ecosystem:
 * - GENESIS: Creation of a new token
 * - NURTURE: Transferring energy to accelerate growth
 * - POLLINATE: Connecting tokens for entanglement
 * - HARVEST: Transforming a flowering token to legacy
 * - TRANSFER: Moving token between wallets
 * - LEGACY_CONTRIBUTION: Energy contribution from legacy token
 */
var BioZoeTransactionType;
(function (BioZoeTransactionType) {
    BioZoeTransactionType["GENESIS"] = "genesis";
    BioZoeTransactionType["NURTURE"] = "nurture";
    BioZoeTransactionType["POLLINATE"] = "pollinate";
    BioZoeTransactionType["HARVEST"] = "harvest";
    BioZoeTransactionType["TRANSFER"] = "transfer";
    BioZoeTransactionType["LEGACY_CONTRIBUTION"] = "legacy_contribution";
})(BioZoeTransactionType || (exports.BioZoeTransactionType = BioZoeTransactionType = {}));

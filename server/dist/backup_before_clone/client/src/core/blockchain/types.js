"use strict";
/**
 * Blockchain Types
 *
 * Defines types for the blockchain integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsensusType = exports.MiningAlgorithm = exports.BlockchainNetworkType = exports.WalletConnectionStatus = void 0;
/**
 * Wallet connection status
 */
var WalletConnectionStatus;
(function (WalletConnectionStatus) {
    WalletConnectionStatus["DISCONNECTED"] = "disconnected";
    WalletConnectionStatus["CONNECTING"] = "connecting";
    WalletConnectionStatus["CONNECTED"] = "connected";
    WalletConnectionStatus["ERROR"] = "error";
})(WalletConnectionStatus || (exports.WalletConnectionStatus = WalletConnectionStatus = {}));
/**
 * Blockchain network type
 */
var BlockchainNetworkType;
(function (BlockchainNetworkType) {
    BlockchainNetworkType["MAINNET"] = "mainnet";
    BlockchainNetworkType["TESTNET"] = "testnet";
    BlockchainNetworkType["GOLDEN"] = "golden";
    BlockchainNetworkType["CUSTOM"] = "custom";
})(BlockchainNetworkType || (exports.BlockchainNetworkType = BlockchainNetworkType = {}));
/**
 * Mining algorithm types for Aetherion blockchain
 */
var MiningAlgorithm;
(function (MiningAlgorithm) {
    MiningAlgorithm["MANDELBROT_FIBONACCI"] = "mandelbrot-fibonacci";
    MiningAlgorithm["QUANTUM_RESISTANT_PROOF_OF_WORK"] = "quantum-resistant-pow";
    MiningAlgorithm["RECURVE_FRACTAL"] = "recurve-fractal";
    MiningAlgorithm["TOROIDAL_WAVE"] = "toroidal-wave";
    MiningAlgorithm["BIOZOE_CONSENSUS"] = "biozoe-consensus";
})(MiningAlgorithm || (exports.MiningAlgorithm = MiningAlgorithm = {}));
/**
 * Consensus types for Aetherion blockchain
 */
var ConsensusType;
(function (ConsensusType) {
    ConsensusType["PROOF_OF_WORK"] = "proof-of-work";
    ConsensusType["PROOF_OF_STAKE"] = "proof-of-stake";
    ConsensusType["PROOF_OF_AUTHORITY"] = "proof-of-authority";
    ConsensusType["QUANTUM_PROOF_OF_SIGNATURE"] = "quantum-proof-of-signature";
    ConsensusType["RECURSIVE_CONSENSUS"] = "recursive-consensus";
    ConsensusType["MANDELBROT_CONSENSUS"] = "mandelbrot-consensus";
    ConsensusType["BIOZOE_CONSENSUS"] = "biozoe-consensus";
})(ConsensusType || (exports.ConsensusType = ConsensusType = {}));

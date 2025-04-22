"use strict";
/**
 * AetherCore Types
 * Type definitions for the AetherCore components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotingWeightStrategy = exports.RecoveryMechanism = exports.TokenBridgeStatus = exports.BridgeDirection = exports.BlockchainNetworkType = void 0;
var BlockchainNetworkType;
(function (BlockchainNetworkType) {
    BlockchainNetworkType["AETHERCOIN"] = "aethercoin";
    BlockchainNetworkType["FRACTALCOIN"] = "fractalcoin";
    BlockchainNetworkType["FILECOIN"] = "filecoin";
    BlockchainNetworkType["ETHEREUM"] = "ethereum";
    BlockchainNetworkType["OTHER"] = "other";
})(BlockchainNetworkType || (exports.BlockchainNetworkType = BlockchainNetworkType = {}));
var BridgeDirection;
(function (BridgeDirection) {
    BridgeDirection["ATC_TO_FRACTALCOIN"] = "atc_to_fractalcoin";
    BridgeDirection["FRACTALCOIN_TO_ATC"] = "fractalcoin_to_atc";
    BridgeDirection["ATC_TO_FILECOIN"] = "atc_to_filecoin";
    BridgeDirection["FILECOIN_TO_ATC"] = "filecoin_to_atc";
    BridgeDirection["FRACTALCOIN_TO_FILECOIN"] = "fractalcoin_to_filecoin";
    BridgeDirection["FILECOIN_TO_FRACTALCOIN"] = "filecoin_to_fractalcoin";
})(BridgeDirection || (exports.BridgeDirection = BridgeDirection = {}));
var TokenBridgeStatus;
(function (TokenBridgeStatus) {
    TokenBridgeStatus["INITIATED"] = "initiated";
    TokenBridgeStatus["PENDING"] = "pending";
    TokenBridgeStatus["CONFIRMED_SOURCE"] = "confirmed_source";
    TokenBridgeStatus["MINTING"] = "minting";
    TokenBridgeStatus["COMPLETED"] = "completed";
    TokenBridgeStatus["FAILED"] = "failed";
    TokenBridgeStatus["REVERTING"] = "reverting";
    TokenBridgeStatus["REVERTED"] = "reverted";
})(TokenBridgeStatus || (exports.TokenBridgeStatus = TokenBridgeStatus = {}));
var RecoveryMechanism;
(function (RecoveryMechanism) {
    RecoveryMechanism["SOCIAL_RECOVERY"] = "social_recovery";
    RecoveryMechanism["MULTISIG"] = "multisig";
    RecoveryMechanism["THRESHOLD"] = "threshold";
    RecoveryMechanism["FRACTAL_BACKUP"] = "fractal_backup";
})(RecoveryMechanism || (exports.RecoveryMechanism = RecoveryMechanism = {}));
var VotingWeightStrategy;
(function (VotingWeightStrategy) {
    VotingWeightStrategy["EQUAL_WEIGHT"] = "equal_weight";
    VotingWeightStrategy["TOKEN_WEIGHTED"] = "token_weighted";
    VotingWeightStrategy["QUADRATIC"] = "quadratic";
    VotingWeightStrategy["CONVICTION"] = "conviction";
    VotingWeightStrategy["FRACTAL_WEIGHTED"] = "fractal_weighted";
})(VotingWeightStrategy || (exports.VotingWeightStrategy = VotingWeightStrategy = {}));

"use strict";
// AI Assistant Types
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityCategory = void 0;
// Security Scan Types
var SecurityCategory;
(function (SecurityCategory) {
    SecurityCategory["PHISHING"] = "phishing";
    SecurityCategory["CONTRACT_SECURITY"] = "contract_security";
    SecurityCategory["UNUSUAL_ACTIVITY"] = "unusual_activity";
    SecurityCategory["GAS_OPTIMIZATION"] = "gas_optimization";
    SecurityCategory["SYSTEM"] = "system";
    SecurityCategory["PERMISSIONS"] = "permissions";
})(SecurityCategory || (exports.SecurityCategory = SecurityCategory = {}));

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMobileWallet = useMobileWallet;
const react_1 = require("react");
const mobileWalletDetector_1 = require("@/utils/mobileWalletDetector");
/**
 * Hook for handling mobile wallet detection and connection
 * Use this to implement wallet connections on mobile devices
 */
function useMobileWallet() {
    const [isMobile, setIsMobile] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [installedWallets, setInstalledWallets] = (0, react_1.useState)([]);
    const [preferredMethod, setPreferredMethod] = (0, react_1.useState)('walletconnect');
    const [showWalletSelector, setShowWalletSelector] = (0, react_1.useState)(false);
    const [selectedWallet, setSelectedWallet] = (0, react_1.useState)(null);
    // Detect mobile device and wallets on mount
    (0, react_1.useEffect)(() => {
        const detectDevice = async () => {
            const mobile = (0, mobileWalletDetector_1.isMobileDevice)();
            setIsMobile(mobile);
            if (mobile) {
                await refreshWallets();
            }
            else {
                setIsLoading(false);
            }
        };
        detectDevice();
    }, []);
    // Function to refresh the list of wallets
    const refreshWallets = (0, react_1.useCallback)(async () => {
        setIsLoading(true);
        try {
            // Get available wallets
            const wallets = await (0, mobileWalletDetector_1.detectMobileWallets)();
            setInstalledWallets(wallets);
            // Get preferred connection method
            const method = await (0, mobileWalletDetector_1.getPreferredConnectionMethod)();
            setPreferredMethod(method);
        }
        catch (error) {
            console.error('Error detecting wallets:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Handle wallet selection
    const handleWalletSelect = (0, react_1.useCallback)((wallet) => {
        setSelectedWallet(wallet);
        setShowWalletSelector(false);
    }, []);
    return {
        isMobile,
        isLoading,
        installedWallets,
        preferredMethod,
        showWalletSelector,
        setShowWalletSelector,
        selectedWallet,
        handleWalletSelect,
        refreshWallets
    };
}

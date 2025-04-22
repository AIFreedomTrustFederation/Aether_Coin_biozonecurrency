"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQuantumDomainService = useQuantumDomainService;
const react_1 = require("react");
const quantumDomainApi_1 = __importDefault(require("../services/api/quantumDomainApi"));
function useQuantumDomainService() {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    // Get user domains
    const getUserDomains = (0, react_1.useCallback)(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const domains = await quantumDomainApi_1.default.getUserDomains();
            return domains;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching your domains';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Check domain availability
    const checkDomainAvailability = (0, react_1.useCallback)(async (domainName) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await quantumDomainApi_1.default.checkDomainAvailability(domainName);
            return result;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while checking domain availability';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Register a domain
    const registerDomain = (0, react_1.useCallback)(async (domainName, options) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await quantumDomainApi_1.default.registerDomain(domainName, options);
            return result;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while registering the domain';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Renew a domain
    const renewDomain = (0, react_1.useCallback)(async (domainName, years) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await quantumDomainApi_1.default.renewDomain(domainName, years);
            return result;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while renewing the domain';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Configure a domain
    const configureDomain = (0, react_1.useCallback)(async (domainName, configuration) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await quantumDomainApi_1.default.configureDomain(domainName, configuration);
            return result;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while configuring the domain';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Transfer a domain
    const transferDomain = (0, react_1.useCallback)(async (domainName, newOwner) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await quantumDomainApi_1.default.transferDomain(domainName, newOwner);
            return result;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while transferring the domain';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Get quantum security status
    const getQuantumSecurityStatus = (0, react_1.useCallback)(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const status = await quantumDomainApi_1.default.getQuantumSecurityStatus();
            return status;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching security status';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Configure hosting for a domain
    const configureHosting = (0, react_1.useCallback)(async (domainName, config) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await quantumDomainApi_1.default.configureHosting(domainName, config);
            return result;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while configuring hosting';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Get hosting status for a domain
    const getHostingStatus = (0, react_1.useCallback)(async (domainName) => {
        setIsLoading(true);
        setError(null);
        try {
            const status = await quantumDomainApi_1.default.getHostingStatus(domainName);
            return status;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching hosting status';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    return {
        isLoading,
        error,
        getUserDomains,
        checkDomainAvailability,
        registerDomain,
        renewDomain,
        configureDomain,
        transferDomain,
        getQuantumSecurityStatus,
        configureHosting,
        getHostingStatus
    };
}

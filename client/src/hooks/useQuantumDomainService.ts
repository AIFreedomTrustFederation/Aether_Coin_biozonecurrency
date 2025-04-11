import { useState, useCallback } from 'react';
import quantumDomainApi, { DomainHostingConfiguration } from '../services/api/quantumDomainApi';
import type { QuantumDomainRecord, DomainAvailabilityResult } from '../contexts/QuantumDomainContext';

export function useQuantumDomainService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user domains
  const getUserDomains = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const domains = await quantumDomainApi.getUserDomains();
      return domains;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching your domains';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check domain availability
  const checkDomainAvailability = useCallback(async (domainName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await quantumDomainApi.checkDomainAvailability(domainName);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while checking domain availability';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register a domain
  const registerDomain = useCallback(async (domainName: string, options: {
    encryptionAlgorithm: 'kyber' | 'falcon' | 'sphincs' | 'hybrid';
    quantumSecurityLevel: 'standard' | 'enhanced' | 'maximum';
    years: number;
    fractionalOwnership?: boolean;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await quantumDomainApi.registerDomain(domainName, options);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while registering the domain';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Renew a domain
  const renewDomain = useCallback(async (domainName: string, years: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await quantumDomainApi.renewDomain(domainName, years);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while renewing the domain';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Configure a domain
  const configureDomain = useCallback(async (domainName: string, configuration: Partial<QuantumDomainRecord>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await quantumDomainApi.configureDomain(domainName, configuration);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while configuring the domain';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Transfer a domain
  const transferDomain = useCallback(async (domainName: string, newOwner: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await quantumDomainApi.transferDomain(domainName, newOwner);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while transferring the domain';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get quantum security status
  const getQuantumSecurityStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await quantumDomainApi.getQuantumSecurityStatus();
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching security status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Configure hosting for a domain
  const configureHosting = useCallback(async (domainName: string, config: DomainHostingConfiguration) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await quantumDomainApi.configureHosting(domainName, config);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while configuring hosting';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get hosting status for a domain
  const getHostingStatus = useCallback(async (domainName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await quantumDomainApi.getHostingStatus(domainName);
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching hosting status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
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
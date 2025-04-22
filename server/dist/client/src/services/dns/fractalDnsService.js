"use strict";
/**
 * FractalDNS Client Service
 * Provides client-side interface to the FractalDNS system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fractalDnsService = exports.FractalDnsService = exports.RecordType = void 0;
const apiClient_1 = require("../api/apiClient");
// DNS record types
var RecordType;
(function (RecordType) {
    RecordType["A"] = "A";
    RecordType["AAAA"] = "AAAA";
    RecordType["CNAME"] = "CNAME";
    RecordType["MX"] = "MX";
    RecordType["TXT"] = "TXT";
    RecordType["NS"] = "NS";
})(RecordType || (exports.RecordType = RecordType = {}));
/**
 * FractalDNS client service class
 */
class FractalDnsService {
    /**
     * Create a new FractalDNS client
     * @param baseUrl Base URL of the FractalDNS API (default: /api/dns)
     */
    constructor(baseUrl = '/api/dns') {
        this.baseUrl = baseUrl;
    }
    /**
     * Get server status
     * @returns Promise with server status
     */
    async getStatus() {
        try {
            const response = await (0, apiClient_1.apiRequest)({
                url: `${this.baseUrl}/status`,
                method: 'GET'
            });
            return response;
        }
        catch (error) {
            console.error('Failed to get DNS server status:', error);
            throw error;
        }
    }
    /**
     * Get all TLD zones
     * @returns Promise with array of zones
     */
    async getZones() {
        try {
            const response = await (0, apiClient_1.apiRequest)({
                url: `${this.baseUrl}/zones`,
                method: 'GET'
            });
            return response.zones;
        }
        catch (error) {
            console.error('Failed to get DNS zones:', error);
            throw error;
        }
    }
    /**
     * Get a specific zone
     * @param tld TLD name
     * @returns Promise with zone data
     */
    async getZone(tld) {
        try {
            const response = await (0, apiClient_1.apiRequest)({
                url: `${this.baseUrl}/zones/${tld}`,
                method: 'GET'
            });
            return response;
        }
        catch (error) {
            console.error(`Failed to get DNS zone: ${tld}`, error);
            throw error;
        }
    }
    /**
     * Create a new zone
     * @param tld TLD name
     * @returns Promise with created zone
     */
    async createZone(tld) {
        try {
            const response = await (0, apiClient_1.apiRequest)({
                url: `${this.baseUrl}/zones`,
                method: 'POST',
                data: { tld }
            });
            return response;
        }
        catch (error) {
            console.error(`Failed to create DNS zone: ${tld}`, error);
            throw error;
        }
    }
    /**
     * Delete a zone
     * @param tld TLD name
     * @returns Promise with success message
     */
    async deleteZone(tld) {
        try {
            const response = await (0, apiClient_1.apiRequest)({
                url: `${this.baseUrl}/zones/${tld}`,
                method: 'DELETE'
            });
            return response;
        }
        catch (error) {
            console.error(`Failed to delete DNS zone: ${tld}`, error);
            throw error;
        }
    }
    /**
     * Add/update a record in a zone
     * @param tld TLD name
     * @param record Record to add
     * @returns Promise with created/updated record
     */
    async addRecord(tld, record) {
        try {
            const response = await (0, apiClient_1.apiRequest)({
                url: `${this.baseUrl}/zones/${tld}/records`,
                method: 'POST',
                data: record
            });
            return response;
        }
        catch (error) {
            console.error(`Failed to add DNS record to zone: ${tld}`, error);
            throw error;
        }
    }
    /**
     * Delete a record from a zone
     * @param tld TLD name
     * @param domain Record domain
     * @param type Record type
     * @returns Promise with success message
     */
    async deleteRecord(tld, domain, type) {
        try {
            const response = await (0, apiClient_1.apiRequest)({
                url: `${this.baseUrl}/zones/${tld}/records`,
                method: 'DELETE',
                data: { domain, type }
            });
            return response;
        }
        catch (error) {
            console.error(`Failed to delete DNS record from zone: ${tld}`, error);
            throw error;
        }
    }
    /**
     * Lookup a DNS record
     * @param domain Domain name
     * @param type Record type
     * @returns Promise with lookup results
     */
    async lookupRecord(domain, type) {
        try {
            const response = await (0, apiClient_1.apiRequest)({
                url: `${this.baseUrl}/lookup`,
                method: 'GET',
                params: { domain, type }
            });
            return response;
        }
        catch (error) {
            console.error(`Failed to lookup DNS record: ${domain} (${type})`, error);
            throw error;
        }
    }
    /**
     * Test if a domain resolves through FractalDNS
     * @param domain Domain to test
     * @returns Promise with test results
     */
    async testDomainResolution(domain) {
        try {
            const response = await (0, apiClient_1.apiRequest)({
                url: `${this.baseUrl}/test`,
                method: 'GET',
                params: { domain }
            });
            return response;
        }
        catch (error) {
            console.error(`Failed to test domain resolution: ${domain}`, error);
            throw error;
        }
    }
    /**
     * Export a zone to BIND format
     * @param tld TLD name
     * @returns Promise with zone file content
     */
    async exportZone(tld) {
        try {
            const response = await (0, apiClient_1.apiRequest)({
                url: `${this.baseUrl}/zones/${tld}/export`,
                method: 'GET'
            });
            return response;
        }
        catch (error) {
            console.error(`Failed to export DNS zone: ${tld}`, error);
            throw error;
        }
    }
}
exports.FractalDnsService = FractalDnsService;
// Create singleton instance
exports.fractalDnsService = new FractalDnsService();

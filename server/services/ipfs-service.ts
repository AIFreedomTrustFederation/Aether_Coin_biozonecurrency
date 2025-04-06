/**
 * IPFS Service
 * 
 * Handles uploading files to IPFS via Web3.Storage or similar providers
 */

import { Web3Storage } from 'web3.storage';
import { v4 as uuidv4 } from 'uuid';

// Interface for IPFS service operations
export interface IpfsService {
  /**
   * Upload a single file to IPFS
   * @param fileBuffer Buffer containing the file data
   * @param fileName Original filename
   * @param fileType MIME type of the file
   * @returns CID of the uploaded file
   */
  uploadFile(fileBuffer: Buffer, fileName: string, fileType: string): Promise<string>;
  
  /**
   * Get URL for retrieving a file from IPFS
   * @param cid Content ID of the file on IPFS
   * @returns URL that can be used to access the file
   */
  getFileUrl(cid: string): string;
}

/**
 * Implementation of IPFS Service using Web3.Storage
 */
class Web3StorageService implements IpfsService {
  private client: Web3Storage | null = null;
  private isConfigured = false;
  
  constructor() {
    // Try to initialize with token
    this.configure();
  }
  
  /**
   * Configure the service with API token from environment
   */
  private configure(): void {
    const token = process.env.WEB3_STORAGE_TOKEN;
    
    if (token) {
      try {
        this.client = new Web3Storage({ token });
        this.isConfigured = true;
        console.log('Web3Storage service configured successfully');
      } catch (error) {
        console.error('Error configuring Web3Storage service:', error);
        this.isConfigured = false;
      }
    } else {
      console.warn('WEB3_STORAGE_TOKEN not found in environment, IPFS uploads will be mocked');
      this.isConfigured = false;
    }
  }
  
  /**
   * Upload a file to Web3.Storage
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, fileType: string): Promise<string> {
    if (!this.isConfigured || !this.client) {
      console.warn('Web3Storage not configured, returning mock CID');
      // For development without token, return a mock CID
      return `mock-cid-${uuidv4()}`;
    }
    
    try {
      // Create a File object
      const file = new File([fileBuffer], fileName, { type: fileType });
      
      // Upload to Web3.Storage
      const cid = await this.client.put([file], {
        name: fileName,
        maxRetries: 3,
      });
      
      console.log(`File uploaded to IPFS with CID: ${cid}`);
      return cid;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }
  
  /**
   * Get URL for an IPFS resource by CID
   */
  getFileUrl(cid: string): string {
    // For mock CIDs during development
    if (cid.startsWith('mock-cid-')) {
      return `/api/ipfs/mock/${cid}`;
    }
    
    // Standard IPFS gateway URL format
    return `https://${cid}.ipfs.w3s.link`;
  }
}

/**
 * Singleton instance of IPFS service
 */
export const ipfsService = new Web3StorageService();
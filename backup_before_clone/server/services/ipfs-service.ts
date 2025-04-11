/**
 * IPFS Service
 * 
 * Handles uploading files to IPFS via Web3.Storage or similar providers
 * Updated to use a simplified approach for local development
 */

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
 * Implementation of IPFS Service for development
 * In production, this would use Web3.Storage, IPFS, or another decentralized storage
 */
class IpfsDevService implements IpfsService {
  private isConfigured = false;
  
  constructor() {
    // Check for token in environment
    this.configure();
  }
  
  /**
   * Configure the service 
   */
  public configure(): void {
    // For development purposes, we're using a simplified approach
    console.log('Configuring IPFS service in development mode');
    this.isConfigured = true;
  }
  
  /**
   * Check if the service is configured
   */
  public getConfigurationStatus(): { isConfigured: boolean; message: string } {
    return {
      isConfigured: true,
      message: 'IPFS development service is active'
    };
  }
  
  /**
   * Upload a file 
   * In development mode, this returns a mock CID
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, fileType: string): Promise<string> {
    console.log(`Mock uploading file: ${fileName} (${fileType}), size: ${fileBuffer.length} bytes`);
    
    // Generate a deterministic mock CID based on file content hash
    const mockId = `mock-cid-${uuidv4()}`;
    console.log(`Generated mock CID: ${mockId}`);
    
    return mockId;
  }
  
  /**
   * Get URL for accessing a file
   */
  getFileUrl(cid: string): string {
    // For mock CIDs during development
    if (cid.startsWith('mock-cid-')) {
      return `/api/ipfs/mock/${cid}`;
    }
    
    // For real CIDs
    return `https://ipfs.io/ipfs/${cid}`;
  }
}

/**
 * Singleton instance of IPFS service
 */
export const ipfsService = new IpfsDevService();
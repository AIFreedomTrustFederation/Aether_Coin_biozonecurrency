/**
 * QrCodeGenerator.ts
 * Implements QR code generation functionality for various use cases
 */

import mobileFeatures from './MobileFeatures';

export type QrCodeFormat = 'svg' | 'canvas' | 'url';
export type QrCodeErrorCorrection = 'L' | 'M' | 'Q' | 'H'; // L: 7%, M: 15%, Q: 25%, H: 30% error correction

export interface QrCodeOptions {
  size?: number; // Size in pixels
  margin?: number; // Margin in pixels
  color?: string; // Foreground color
  backgroundColor?: string; // Background color
  errorCorrection?: QrCodeErrorCorrection;
  includeImage?: boolean; // Whether to include a logo image
  imageUrl?: string; // URL of the logo image
  imageSize?: number; // Size of the logo image in pixels
  format?: QrCodeFormat; // Output format
}

export interface WalletQrOptions extends QrCodeOptions {
  label?: string; // Wallet label
  amount?: number; // Preset amount
  memo?: string; // Transaction memo
  includePaymentRequest?: boolean; // Whether to include payment request data
}

/**
 * Class for handling QR code generation for blockchain transactions and wallet addresses
 */
export class QrCodeGenerator {
  private static instance: QrCodeGenerator;
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): QrCodeGenerator {
    if (!QrCodeGenerator.instance) {
      QrCodeGenerator.instance = new QrCodeGenerator();
    }
    return QrCodeGenerator.instance;
  }
  
  /**
   * Generate a QR code for a wallet address
   * @param address Wallet address
   * @param options QR code generation options
   * @returns Promise resolving to the QR code as specified in the options
   */
  public async generateAddressQr(
    address: string,
    options: WalletQrOptions = {}
  ): Promise<string | HTMLCanvasElement> {
    // Validate address
    if (!address || address.trim() === '') {
      throw new Error('Invalid wallet address');
    }
    
    // Combine address with optional parameters
    let qrData = `aetherion:${address}`;
    const params = new URLSearchParams();
    
    if (options.label) {
      params.append('label', options.label);
    }
    
    if (options.amount && options.amount > 0) {
      params.append('amount', options.amount.toString());
    }
    
    if (options.memo) {
      params.append('memo', options.memo);
    }
    
    // Add parameters if any
    if (Array.from(params).length > 0) {
      qrData += `?${params.toString()}`;
    }
    
    // Generate QR code
    return this.generateQrCode(qrData, options);
  }
  
  /**
   * Generate a QR code for a transaction
   * @param transaction Transaction data
   * @param options QR code generation options
   * @returns Promise resolving to the QR code as specified in the options
   */
  public async generateTransactionQr(
    transaction: {
      from?: string;
      to: string;
      amount: number;
      memo?: string;
      data?: string;
    },
    options: QrCodeOptions = {}
  ): Promise<string | HTMLCanvasElement> {
    // Validate transaction
    if (!transaction.to || transaction.amount <= 0) {
      throw new Error('Invalid transaction data');
    }
    
    // Create transaction URI
    let qrData = `aetherion:${transaction.to}`;
    const params = new URLSearchParams();
    
    params.append('amount', transaction.amount.toString());
    
    if (transaction.memo) {
      params.append('memo', transaction.memo);
    }
    
    if (transaction.data) {
      params.append('data', transaction.data);
    }
    
    // Add parameters
    qrData += `?${params.toString()}`;
    
    // Generate QR code
    return this.generateQrCode(qrData, options);
  }
  
  /**
   * Generate a QR code for wallet connection
   * @param connectionUri Connection URI (e.g., from WalletConnect)
   * @param options QR code generation options
   * @returns Promise resolving to the QR code as specified in the options
   */
  public async generateConnectionQr(
    connectionUri: string,
    options: QrCodeOptions = {}
  ): Promise<string | HTMLCanvasElement> {
    // Validate URI
    if (!connectionUri || connectionUri.trim() === '') {
      throw new Error('Invalid connection URI');
    }
    
    // Use higher error correction for connection QRs
    const connectionOptions: QrCodeOptions = {
      errorCorrection: 'H', // Highest error correction
      ...options
    };
    
    // Generate QR code
    return this.generateQrCode(connectionUri, connectionOptions);
  }
  
  /**
   * Generate a QR code for authentication
   * @param authData Authentication data
   * @param expiry Expiry time in seconds
   * @param options QR code generation options
   * @returns Promise resolving to the QR code as specified in the options
   */
  public async generateAuthQr(
    authData: {
      appId: string;
      challenge: string;
      permissions?: string[];
    },
    expiry: number = 300, // 5 minutes default
    options: QrCodeOptions = {}
  ): Promise<string | HTMLCanvasElement> {
    // Validate auth data
    if (!authData.appId || !authData.challenge) {
      throw new Error('Invalid authentication data');
    }
    
    // Create authentication URI
    const qrData = {
      type: 'auth',
      app: authData.appId,
      challenge: authData.challenge,
      permissions: authData.permissions || ['basic'],
      exp: Math.floor(Date.now() / 1000) + expiry
    };
    
    // Generate QR code with the JSON data
    return this.generateQrCode(`aetherion://auth?data=${encodeURIComponent(JSON.stringify(qrData))}`, options);
  }
  
  /**
   * Core method to generate QR codes with various options
   * @param data Data to encode in the QR code
   * @param options QR code generation options
   * @returns Promise resolving to the QR code in the specified format
   */
  private async generateQrCode(
    data: string,
    options: QrCodeOptions = {}
  ): Promise<string | HTMLCanvasElement> {
    // In a real implementation, this would use a QR code library
    // For our simulation, we'll return placeholders
    
    const defaultOptions: QrCodeOptions = {
      size: 256,
      margin: 4,
      color: '#000000',
      backgroundColor: '#FFFFFF',
      errorCorrection: 'M',
      includeImage: false,
      format: 'svg'
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    // Simulated generation process
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return a placeholder based on the requested format
    if (finalOptions.format === 'url') {
      // Return a data URL placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMjAsMjBoNjB2NjBoLTYweiIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNMzAsMzBoNDB2NDBIMzB6IiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik00MCw0MGgyMHYyMEg0MHoiIGZpbGw9ImJsYWNrIi8+PC9zdmc+';
    } else if (finalOptions.format === 'canvas') {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = finalOptions.size || 256;
      canvas.height = finalOptions.size || 256;
      
      // In a real implementation, we would draw the QR code on the canvas
      
      return canvas;
    } else {
      // Return SVG markup placeholder
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${finalOptions.size}" height="${finalOptions.size}">
        <rect width="100" height="100" fill="${finalOptions.backgroundColor}"/>
        <path d="M20,20h60v60h-60z" fill="${finalOptions.color}"/>
        <path d="M30,30h40v40H30z" fill="${finalOptions.backgroundColor}"/>
        <path d="M40,40h20v20H40z" fill="${finalOptions.color}"/>
      </svg>`;
    }
  }
  
  /**
   * Scan a QR code using the device camera
   * @returns Promise resolving to the scanned data
   */
  public async scanQrCode(): Promise<string> {
    if (!mobileFeatures.isAvailable) {
      throw new Error('QR code scanning is only available on mobile devices');
    }
    
    // In a real implementation, this would access the camera and scan a QR code
    // For our simulation, we'll throw an error
    throw new Error('QR code scanning requires camera access and is not implemented in this simulation');
  }
  
  /**
   * Validate a QR code image from a data URL
   * @param dataUrl QR code image as data URL
   * @returns Promise resolving to the decoded data or null if invalid
   */
  public async validateQrImage(dataUrl: string): Promise<string | null> {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return null;
    }
    
    // In a real implementation, this would decode the QR code from the image
    // For our simulation, we'll return a standard format
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a placeholder wallet address
    return 'aetherion:0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  }
  
  /**
   * Get a QR code scanner component (this would be implemented in the UI layer)
   * @returns Information about how to access the QR code scanner
   */
  public getQrScannerInfo(): { available: boolean; info: string } {
    if (!mobileFeatures.isAvailable) {
      return {
        available: false,
        info: 'QR code scanning is only available on mobile devices.'
      };
    }
    
    return {
      available: true,
      info: 'Use the QR code scanner in the camera tab of the wallet to scan QR codes.'
    };
  }
}

export default QrCodeGenerator.getInstance();
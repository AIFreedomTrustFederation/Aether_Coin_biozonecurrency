/**
 * DevicePairing.ts
 * Implements secure device pairing between mobile and desktop
 */

import { SHA256 } from 'crypto-js';
import mobileFeatures from './MobileFeatures';
import qrCodeGenerator from './QrCodeGenerator';

export type PairingStatus = 'idle' | 'generating' | 'pairing' | 'paired' | 'error';
export type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'unknown';
export type PairingRole = 'initiator' | 'receiver';

export interface PairedDevice {
  id: string;
  name: string;
  type: DeviceType;
  lastConnected: number;
  trustedUntil: number | null; // Timestamp or null for permanent trust
  publicKey: string; // Public key for secure communication
}

export interface PairingOptions {
  deviceName?: string;
  trustDuration?: number; // Duration in seconds (0 for permanent)
  requireBiometrics?: boolean;
  allowDataSync?: boolean;
  allowRemoteControl?: boolean;
  allowNotifications?: boolean;
}

export interface PairingRequest {
  id: string;
  initiatorId: string;
  initiatorName: string;
  initiatorType: DeviceType;
  timestamp: number;
  expires: number;
  publicKey: string;
  permissions: string[];
}

export interface PairingResult {
  success: boolean;
  device?: PairedDevice;
  error?: string;
}

/**
 * Class for handling secure device pairing between mobile and desktop
 * Enables synchronized wallet management across devices
 */
export class DevicePairing {
  private static instance: DevicePairing;
  private deviceId: string;
  private deviceName: string;
  private deviceType: DeviceType;
  private pairedDevices: PairedDevice[] = [];
  private status: PairingStatus = 'idle';
  private lastError: string | null = null;
  private currentPairingRequest: PairingRequest | null = null;
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Generate a unique device ID if not already stored
    let storedId = localStorage.getItem('aetherion_device_id');
    if (!storedId) {
      storedId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('aetherion_device_id', storedId);
    }
    this.deviceId = storedId;
    
    // Set device name (use stored or generate default)
    this.deviceName = localStorage.getItem('aetherion_device_name') || this.generateDeviceName();
    
    // Determine device type
    this.deviceType = this.determineDeviceType();
    
    // Load paired devices from storage
    this.loadPairedDevices();
    
    // Clean up expired pairings
    this.cleanExpiredPairings();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): DevicePairing {
    if (!DevicePairing.instance) {
      DevicePairing.instance = new DevicePairing();
    }
    return DevicePairing.instance;
  }
  
  /**
   * Determine the device type based on user agent and screen size
   */
  private determineDeviceType(): DeviceType {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      return 'unknown';
    }
    
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipod|android|blackberry|opera mini|opera mobi|iemobile/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || 
                    (window.innerWidth > 640 && window.innerWidth <= 1024 && window.innerHeight > 480);
    
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    return 'desktop';
  }
  
  /**
   * Generate a default device name based on device type and browser
   */
  private generateDeviceName(): string {
    if (typeof navigator === 'undefined') {
      return 'Unknown Device';
    }
    
    const deviceType = this.determineDeviceType();
    const browserName = this.getBrowserName();
    
    let deviceName = `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}`;
    
    if (browserName) {
      deviceName += ` (${browserName})`;
    }
    
    return deviceName;
  }
  
  /**
   * Get the browser name from user agent
   */
  private getBrowserName(): string {
    if (typeof navigator === 'undefined') {
      return '';
    }
    
    const userAgent = navigator.userAgent;
    
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) return 'IE';
    
    return '';
  }
  
  /**
   * Load paired devices from local storage
   */
  private loadPairedDevices(): void {
    try {
      const storedDevices = localStorage.getItem('aetherion_paired_devices');
      if (storedDevices) {
        this.pairedDevices = JSON.parse(storedDevices);
      }
    } catch (error) {
      console.error('Failed to load paired devices:', error);
      this.pairedDevices = [];
    }
  }
  
  /**
   * Save paired devices to local storage
   */
  private savePairedDevices(): void {
    try {
      localStorage.setItem('aetherion_paired_devices', JSON.stringify(this.pairedDevices));
    } catch (error) {
      console.error('Failed to save paired devices:', error);
    }
  }
  
  /**
   * Clean up expired device pairings
   */
  private cleanExpiredPairings(): void {
    const now = Date.now();
    const initialCount = this.pairedDevices.length;
    
    this.pairedDevices = this.pairedDevices.filter(device => {
      return device.trustedUntil === null || device.trustedUntil > now;
    });
    
    if (this.pairedDevices.length < initialCount) {
      this.savePairedDevices();
    }
  }
  
  /**
   * Set the device name
   * @param name New device name
   */
  public setDeviceName(name: string): void {
    if (!name || name.trim() === '') {
      throw new Error('Device name cannot be empty');
    }
    
    this.deviceName = name.trim();
    localStorage.setItem('aetherion_device_name', this.deviceName);
  }
  
  /**
   * Initiate a new device pairing
   * @param options Pairing options
   * @returns Promise resolving to a QR code or pairing URI
   */
  public async initiatePairing(options: PairingOptions = {}): Promise<string> {
    if (this.status === 'pairing') {
      throw new Error('Already in pairing process');
    }
    
    this.status = 'generating';
    this.lastError = null;
    
    try {
      // Generate a pairing request
      const pairingId = `pair_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const timestamp = Date.now();
      const expires = timestamp + (10 * 60 * 1000); // 10 minutes expiration
      
      // Generate a simulated public key
      // In a real implementation, this would use proper cryptography
      const publicKey = new SHA256(this.deviceId + timestamp).toString();
      
      // Determine permissions based on options
      const permissions = ['basic'];
      if (options.allowDataSync) permissions.push('data_sync');
      if (options.allowRemoteControl) permissions.push('remote_control');
      if (options.allowNotifications) permissions.push('notifications');
      
      // Create the pairing request
      this.currentPairingRequest = {
        id: pairingId,
        initiatorId: this.deviceId,
        initiatorName: options.deviceName || this.deviceName,
        initiatorType: this.deviceType,
        timestamp,
        expires,
        publicKey,
        permissions
      };
      
      // Generate a pairing URI
      const pairingUri = `aetherion://pair?data=${encodeURIComponent(JSON.stringify(this.currentPairingRequest))}`;
      
      // Generate a QR code for the pairing URI
      if (this.deviceType === 'desktop' || this.deviceType === 'tablet') {
        // Generate QR code for desktop or tablet
        const qrCode = await qrCodeGenerator.generateQrCode(pairingUri, {
          size: 300,
          errorCorrection: 'H',
          format: 'url'
        });
        
        this.status = 'pairing';
        return qrCode as string;
      } else {
        // Return the URI for mobile devices
        this.status = 'pairing';
        return pairingUri;
      }
    } catch (error) {
      this.status = 'error';
      this.lastError = error instanceof Error ? error.message : 'Unknown error generating pairing';
      throw error;
    }
  }
  
  /**
   * Complete a pairing process by accepting a pairing request
   * @param pairingData Pairing request data (from QR code or URI)
   * @param options Pairing options
   * @returns Promise resolving to the pairing result
   */
  public async completePairing(
    pairingData: string | PairingRequest,
    options: PairingOptions = {}
  ): Promise<PairingResult> {
    try {
      // Parse the pairing data if it's a string
      let pairingRequest: PairingRequest;
      
      if (typeof pairingData === 'string') {
        // Extract JSON data from URI
        if (pairingData.startsWith('aetherion://pair?data=')) {
          const dataParam = pairingData.split('?data=')[1];
          pairingRequest = JSON.parse(decodeURIComponent(dataParam));
        } else {
          // Try to parse as direct JSON
          pairingRequest = JSON.parse(pairingData);
        }
      } else {
        pairingRequest = pairingData;
      }
      
      // Validate the pairing request
      if (!pairingRequest.id || !pairingRequest.initiatorId || !pairingRequest.publicKey) {
        throw new Error('Invalid pairing request');
      }
      
      // Check if the request has expired
      if (pairingRequest.expires < Date.now()) {
        throw new Error('Pairing request has expired');
      }
      
      // Check if device is already paired
      const existingDevice = this.pairedDevices.find(d => d.id === pairingRequest.initiatorId);
      if (existingDevice) {
        // Update the existing pairing
        const trustDuration = options.trustDuration || 0;
        const trustedUntil = trustDuration > 0 ? Date.now() + (trustDuration * 1000) : null;
        
        existingDevice.name = pairingRequest.initiatorName;
        existingDevice.lastConnected = Date.now();
        existingDevice.trustedUntil = trustedUntil;
        existingDevice.publicKey = pairingRequest.publicKey;
        
        this.savePairedDevices();
        
        return {
          success: true,
          device: { ...existingDevice }
        };
      }
      
      // Create a new paired device
      const trustDuration = options.trustDuration || 0;
      const trustedUntil = trustDuration > 0 ? Date.now() + (trustDuration * 1000) : null;
      
      const newDevice: PairedDevice = {
        id: pairingRequest.initiatorId,
        name: pairingRequest.initiatorName,
        type: pairingRequest.initiatorType,
        lastConnected: Date.now(),
        trustedUntil,
        publicKey: pairingRequest.publicKey
      };
      
      // Add to paired devices
      this.pairedDevices.push(newDevice);
      this.savePairedDevices();
      
      // Update status
      this.status = 'paired';
      
      return {
        success: true,
        device: { ...newDevice }
      };
    } catch (error) {
      this.status = 'error';
      this.lastError = error instanceof Error ? error.message : 'Unknown error completing pairing';
      
      return {
        success: false,
        error: this.lastError
      };
    }
  }
  
  /**
   * Remove a paired device
   * @param deviceId ID of the device to remove
   * @returns Boolean indicating if removal was successful
   */
  public removePairedDevice(deviceId: string): boolean {
    const initialCount = this.pairedDevices.length;
    this.pairedDevices = this.pairedDevices.filter(device => device.id !== deviceId);
    
    if (this.pairedDevices.length < initialCount) {
      this.savePairedDevices();
      return true;
    }
    
    return false;
  }
  
  /**
   * Get the status of the current pairing process
   */
  public getPairingStatus(): { status: PairingStatus; error: string | null } {
    return {
      status: this.status,
      error: this.lastError
    };
  }
  
  /**
   * Cancel the current pairing process
   */
  public cancelPairing(): void {
    if (this.status === 'pairing' || this.status === 'generating') {
      this.status = 'idle';
      this.currentPairingRequest = null;
    }
  }
  
  /**
   * Get the current device information
   */
  public getCurrentDevice(): {
    id: string;
    name: string;
    type: DeviceType;
  } {
    return {
      id: this.deviceId,
      name: this.deviceName,
      type: this.deviceType
    };
  }
  
  /**
   * Get all paired devices
   */
  public getPairedDevices(): PairedDevice[] {
    // Clean expired pairings before returning
    this.cleanExpiredPairings();
    return [...this.pairedDevices];
  }
  
  /**
   * Check if a device is paired
   * @param deviceId ID of the device to check
   */
  public isDevicePaired(deviceId: string): boolean {
    // Clean expired pairings before checking
    this.cleanExpiredPairings();
    return this.pairedDevices.some(device => device.id === deviceId);
  }
  
  /**
   * Update the trust duration for a paired device
   * @param deviceId ID of the device to update
   * @param trustDuration Duration in seconds (0 for permanent)
   * @returns Boolean indicating if update was successful
   */
  public updateDeviceTrust(deviceId: string, trustDuration: number): boolean {
    const device = this.pairedDevices.find(d => d.id === deviceId);
    if (!device) {
      return false;
    }
    
    device.trustedUntil = trustDuration > 0 ? Date.now() + (trustDuration * 1000) : null;
    device.lastConnected = Date.now();
    
    this.savePairedDevices();
    return true;
  }
}

export default DevicePairing.getInstance();
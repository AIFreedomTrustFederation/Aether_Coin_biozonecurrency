import { quantumVault, VaultItemType } from './index';
import { apiRequest } from '../../lib/queryClient';

/**
 * Service that connects quantum-secure stored credentials with the notification system
 */
export class SecureNotificationService {
  private static instance: SecureNotificationService;

  /**
   * Get the singleton instance
   */
  public static getInstance(): SecureNotificationService {
    if (!SecureNotificationService.instance) {
      SecureNotificationService.instance = new SecureNotificationService();
    }
    return SecureNotificationService.instance;
  }

  private constructor() {}

  /**
   * Store a phone number in the quantum vault
   * @param phoneNumber The phone number to store
   * @param label Optional label for the phone number (e.g., "Primary", "Work")
   * @returns ID of the stored item if successful, null otherwise
   */
  public storePhoneNumber(phoneNumber: string, label: string = 'Primary'): string | null {
    return quantumVault.store(
      VaultItemType.PHONE_NUMBER,
      label,
      phoneNumber,
      {
        verified: false,
        dateAdded: new Date().toISOString(),
      }
    );
  }

  /**
   * Get all phone numbers stored in the vault
   * @returns Array of phone number items
   */
  public getPhoneNumbers() {
    return quantumVault.retrieveByType(VaultItemType.PHONE_NUMBER);
  }

  /**
   * Get the primary phone number (used for notifications)
   * @returns The primary phone number or null if none exists
   */
  public getPrimaryPhoneNumber(): string | null {
    const phoneNumbers = this.getPhoneNumbers();
    
    // First, try to find one marked as primary
    const primary = phoneNumbers.find(phone => 
      phone.label.toLowerCase() === 'primary' || 
      (phone.metadata && phone.metadata.isPrimary)
    );
    
    if (primary) return primary.value;
    
    // If no primary found, return the first verified one
    const verified = phoneNumbers.find(phone => 
      phone.metadata && phone.metadata.verified
    );
    
    if (verified) return verified.value;
    
    // If no verified found, return the first one
    return phoneNumbers.length > 0 ? phoneNumbers[0].value : null;
  }

  /**
   * Store a Matrix ID in the quantum vault
   * @param matrixId The Matrix ID to store
   * @param label Optional label for the Matrix ID
   * @returns ID of the stored item if successful, null otherwise
   */
  public storeMatrixId(matrixId: string, label: string = 'Primary'): string | null {
    return quantumVault.store(
      VaultItemType.MATRIX_ID,
      label,
      matrixId,
      {
        verified: false,
        dateAdded: new Date().toISOString(),
      }
    );
  }

  /**
   * Get all Matrix IDs stored in the vault
   * @returns Array of Matrix ID items
   */
  public getMatrixIds() {
    return quantumVault.retrieveByType(VaultItemType.MATRIX_ID);
  }

  /**
   * Get the primary Matrix ID (used for notifications)
   * @returns The primary Matrix ID or null if none exists
   */
  public getPrimaryMatrixId(): string | null {
    const matrixIds = this.getMatrixIds();
    
    // First, try to find one marked as primary
    const primary = matrixIds.find(matrix => 
      matrix.label.toLowerCase() === 'primary' || 
      (matrix.metadata && matrix.metadata.isPrimary)
    );
    
    if (primary) return primary.value;
    
    // If no primary found, return the first verified one
    const verified = matrixIds.find(matrix => 
      matrix.metadata && matrix.metadata.verified
    );
    
    if (verified) return verified.value;
    
    // If no verified found, return the first one
    return matrixIds.length > 0 ? matrixIds[0].value : null;
  }

  /**
   * Update the server with the phone number from the vault
   * @returns Promise that resolves to true if successful, false otherwise
   */
  public async syncPhoneNumberWithServer(): Promise<boolean> {
    const phoneNumber = this.getPrimaryPhoneNumber();
    if (!phoneNumber) return false;

    try {
      await apiRequest('/api/notification-preferences/phone', 'POST', { phoneNumber });
      return true;
    } catch (error) {
      console.error('Failed to sync phone number with server:', error);
      return false;
    }
  }

  /**
   * Update the server with the Matrix ID from the vault
   * @returns Promise that resolves to true if successful, false otherwise
   */
  public async syncMatrixIdWithServer(): Promise<boolean> {
    const matrixId = this.getPrimaryMatrixId();
    if (!matrixId) return false;

    try {
      await apiRequest('/api/notification-preferences/matrix', 'POST', { matrixId });
      return true;
    } catch (error) {
      console.error('Failed to sync Matrix ID with server:', error);
      return false;
    }
  }

  /**
   * Verify a phone number
   * @param itemId The ID of the phone number item in the vault
   * @param verified Whether the phone number is verified
   * @returns True if update was successful, false otherwise
   */
  public setPhoneNumberVerified(itemId: string, verified: boolean): boolean {
    return quantumVault.update(itemId, {
      metadata: {
        ...quantumVault.retrieve(itemId)?.metadata,
        verified,
        verifiedAt: verified ? new Date().toISOString() : undefined,
      }
    });
  }

  /**
   * Verify a Matrix ID
   * @param itemId The ID of the Matrix ID item in the vault
   * @param verified Whether the Matrix ID is verified
   * @returns True if update was successful, false otherwise
   */
  public setMatrixIdVerified(itemId: string, verified: boolean): boolean {
    return quantumVault.update(itemId, {
      metadata: {
        ...quantumVault.retrieve(itemId)?.metadata,
        verified,
        verifiedAt: verified ? new Date().toISOString() : undefined,
      }
    });
  }

  /**
   * Set a phone number as primary
   * @param itemId The ID of the phone number item in the vault
   * @returns True if update was successful, false otherwise
   */
  public setPhoneNumberAsPrimary(itemId: string): boolean {
    // First, unset primary on all other phone numbers
    const phoneNumbers = this.getPhoneNumbers();
    for (const phone of phoneNumbers) {
      if (phone.id !== itemId && phone.metadata && phone.metadata.isPrimary) {
        quantumVault.update(phone.id, {
          metadata: {
            ...phone.metadata,
            isPrimary: false,
          }
        });
      }
    }

    // Set this one as primary
    return quantumVault.update(itemId, {
      metadata: {
        ...quantumVault.retrieve(itemId)?.metadata,
        isPrimary: true,
      }
    });
  }

  /**
   * Set a Matrix ID as primary
   * @param itemId The ID of the Matrix ID item in the vault
   * @returns True if update was successful, false otherwise
   */
  public setMatrixIdAsPrimary(itemId: string): boolean {
    // First, unset primary on all other Matrix IDs
    const matrixIds = this.getMatrixIds();
    for (const matrix of matrixIds) {
      if (matrix.id !== itemId && matrix.metadata && matrix.metadata.isPrimary) {
        quantumVault.update(matrix.id, {
          metadata: {
            ...matrix.metadata,
            isPrimary: false,
          }
        });
      }
    }

    // Set this one as primary
    return quantumVault.update(itemId, {
      metadata: {
        ...quantumVault.retrieve(itemId)?.metadata,
        isPrimary: true,
      }
    });
  }

  /**
   * Send a test notification to the device
   * @param channel The notification channel to test ('sms', 'matrix', or undefined for both)
   * @returns Promise that resolves to the result of the test
   */
  public async testNotification(channel?: 'sms' | 'matrix'): Promise<any> {
    try {
      return await apiRequest('/api/notification-preferences/test', 'POST', { channel });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }

  /**
   * Update notification preference settings on the server
   * @param preferences Object containing preference settings to update
   * @returns Promise that resolves to true if successful, false otherwise
   */
  public async updateNotificationPreferences(preferences: {
    smsEnabled?: boolean;
    matrixEnabled?: boolean;
    transactionAlerts?: boolean;
    securityAlerts?: boolean;
    priceAlerts?: boolean;
    marketingUpdates?: boolean;
  }): Promise<boolean> {
    try {
      await apiRequest('/api/notification-preferences', 'PATCH', preferences);
      return true;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return false;
    }
  }
}

// Export the singleton instance
export const secureNotificationService = SecureNotificationService.getInstance();
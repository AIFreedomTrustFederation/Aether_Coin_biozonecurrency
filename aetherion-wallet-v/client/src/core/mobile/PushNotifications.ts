/**
 * PushNotifications.ts
 * Implements push notification functionality for mobile devices
 */

import mobileFeatures from './MobileFeatures';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  vibrate?: number[];
  silent?: boolean;
  priority?: NotificationPriority;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

/**
 * Class for handling push notifications on mobile devices
 * Uses the Web Push API and Service Workers
 */
export class PushNotifications {
  private static instance: PushNotifications;
  private isAvailable: boolean = false;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;
  private notificationPermission: NotificationPermission = 'default';
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.isAvailable = mobileFeatures.isPushNotificationsEnabled;
    this.init();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): PushNotifications {
    if (!PushNotifications.instance) {
      PushNotifications.instance = new PushNotifications();
    }
    return PushNotifications.instance;
  }
  
  /**
   * Initialize push notification capabilities
   */
  private async init(): Promise<void> {
    if (!this.isAvailable) return;
    
    try {
      // Check notification permission
      if ('Notification' in window) {
        this.notificationPermission = Notification.permission;
      }
      
      // Register service worker
      if ('serviceWorker' in navigator) {
        try {
          // In production, you would register your actual service worker
          // this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw-push.js');
          
          // For our implementation, we'll check if service worker is already registered
          this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
          
          // Check for existing push subscription
          if (this.serviceWorkerRegistration) {
            this.pushSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
          }
        } catch (error) {
          console.error('Failed to register service worker:', error);
        }
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }
  
  /**
   * Request permission to send notifications
   * @returns Promise resolving to the permission status
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isAvailable) {
      throw new Error('Push notifications are not available on this device');
    }
    
    if (!('Notification' in window)) {
      throw new Error('Notifications API is not supported');
    }
    
    if (this.notificationPermission === 'granted') {
      return this.notificationPermission;
    }
    
    try {
      this.notificationPermission = await Notification.requestPermission();
      return this.notificationPermission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }
  
  /**
   * Subscribe to push notifications
   * @returns Promise resolving to the push subscription or null
   */
  public async subscribe(): Promise<PushSubscription | null> {
    if (!this.isAvailable) {
      throw new Error('Push notifications are not available on this device');
    }
    
    if (this.notificationPermission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }
    
    try {
      if (!this.serviceWorkerRegistration) {
        throw new Error('Service worker not registered');
      }
      
      // In a real implementation, you would use your application server key
      const applicationServerKey = this.urlBase64ToUint8Array(
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
      );
      
      // Subscribe to push notifications
      this.pushSubscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
      
      // In production, you would send the subscription to your server
      
      return this.pushSubscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }
  
  /**
   * Unsubscribe from push notifications
   * @returns Promise resolving to a boolean indicating success
   */
  public async unsubscribe(): Promise<boolean> {
    if (!this.pushSubscription) {
      return false;
    }
    
    try {
      const result = await this.pushSubscription.unsubscribe();
      if (result) {
        this.pushSubscription = null;
        // In production, you would notify your server
      }
      return result;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }
  
  /**
   * Send a local notification (does not require push subscription)
   * @param options Notification options
   * @returns Promise resolving to the notification or null
   */
  public async showLocalNotification(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isAvailable) {
      throw new Error('Notifications are not available on this device');
    }
    
    if (this.notificationPermission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }
    
    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon,
        badge: options.badge,
        image: options.image,
        tag: options.tag,
        data: options.data,
        vibrate: options.vibrate,
        silent: options.silent,
        actions: options.actions
      });
      
      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }
  
  /**
   * Get the current push subscription
   */
  public getSubscription(): PushSubscription | null {
    return this.pushSubscription;
  }
  
  /**
   * Check if push notifications are enabled
   */
  public isEnabled(): boolean {
    return this.isAvailable && this.notificationPermission === 'granted';
  }
  
  /**
   * Check if the user is subscribed to push notifications
   */
  public isSubscribed(): boolean {
    return !!this.pushSubscription;
  }
  
  /**
   * Get the current notification permission status
   */
  public getPermissionStatus(): NotificationPermission {
    return this.notificationPermission;
  }
  
  /**
   * Utility method to convert base64 to Uint8Array for application server key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
      
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
}

export default PushNotifications.getInstance();
declare module 'secure-web-storage' {
  type EncryptionMethods = {
    hash: (key: string) => string;
    encrypt: (data: string) => string;
    decrypt: (data: string) => string;
  };

  class SecureWebStorage {
    constructor(storage: Storage, methods: EncryptionMethods);
    
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
    key(index: number): string | null;
    length: number;
  }

  export = SecureWebStorage;
}
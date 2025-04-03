declare module 'crypto-js' {
  namespace CryptoJS {
    interface WordArray {
      toString(encoder?: any): string;
      concat(wordArray: WordArray): WordArray;
      clamp(): void;
      clone(): WordArray;
    }

    class Cipher {
      static createEncryptor(key: WordArray | string, cfg?: any): Cipher;
      static createDecryptor(key: WordArray | string, cfg?: any): Cipher;
      process(message: WordArray): WordArray;
      finalize(message?: WordArray): WordArray;
    }

    class AES {
      static encrypt(message: string | WordArray, key: string | WordArray, cfg?: any): any;
      static decrypt(ciphertext: any, key: string | WordArray, cfg?: any): any;
    }

    class SHA256 {
      static hash(message: string | WordArray): WordArray;
    }

    interface CipherParams {
      ciphertext: WordArray;
      key: WordArray;
      iv: WordArray;
      salt: WordArray;
      algorithm: any;
      mode: any;
      padding: any;
      blockSize: number;
      formatter: any;
    }

    interface Formatter {
      stringify(cipherParams: CipherParams): string;
      parse(str: string): CipherParams;
    }

    interface Mode { }
    interface Padding { }

    const enc: {
      Utf8: {
        parse(str: string): WordArray;
        stringify(wordArray: WordArray): string;
      };
      Hex: {
        parse(str: string): WordArray;
        stringify(wordArray: WordArray): string;
      };
      Base64: {
        parse(str: string): WordArray;
        stringify(wordArray: WordArray): string;
      };
    };
  }

  export = CryptoJS;
}
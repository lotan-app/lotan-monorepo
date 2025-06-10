import CryptoJS from 'crypto-js';

export function generateKeyAndIv(password: string): { key: CryptoJS.lib.WordArray; iv: CryptoJS.lib.WordArray } {
  const key = CryptoJS.SHA256(password);

  const iv = CryptoJS.enc.Hex.parse(key.toString(CryptoJS.enc.Hex).substring(0, 32));

  return { key, iv };
}

export function arrayBufferToWordArray(ab: ArrayBuffer): CryptoJS.lib.WordArray {
  const u8 = new Uint8Array(ab);
  const len = u8.length;
  const words = [];
  for (let i = 0; i < len; i += 4) {
    words.push((u8[i] << 24) | (u8[i + 1] << 16) | (u8[i + 2] << 8) | u8[i + 3]);
  }
  return CryptoJS.lib.WordArray.create(words, len);
}

export function wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
  const { words, sigBytes } = wordArray;
  if (sigBytes < 0) {
    throw new Error('Invalid sigBytes: negative value (' + sigBytes + ')');
  }
  const u8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[Math.floor(i / 4)] >> (24 - (i % 4) * 8)) & 0xff;
  }
  return u8;
}

export function encryptChunkAES(password: string, data: Uint8Array): Uint8Array {
  const { key, iv } = generateKeyAndIv(password);
  const wordArray = arrayBufferToWordArray(data.buffer as any);
  const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return wordArrayToUint8Array(encrypted.ciphertext);
}

export function decryptChunkAES(password: string, data: Uint8Array): Uint8Array {
  const { key, iv } = generateKeyAndIv(password);
  const dataCopy = new Uint8Array(data);
  const exactBuffer = dataCopy.buffer.slice(dataCopy.byteOffset, dataCopy.byteOffset + dataCopy.byteLength);
  const ciphertextWA = arrayBufferToWordArray(exactBuffer);
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertextWA } as any, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return wordArrayToUint8Array(decrypted);
}

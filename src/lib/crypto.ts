import CryptoJS from 'crypto-js';

const getEncryptionKey = (projectId: string): string => {
  return projectId;
};

export const encryptMessage = (text: string, projectId: string): string => {
  const key = getEncryptionKey(projectId);
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decryptMessage = (ciphertext: string, projectId: string): string => {
  if (!ciphertext) {
    return '';
  }
  try {
    const key = getEncryptionKey(projectId);
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
  } catch (err) {
    return '';
  }
};
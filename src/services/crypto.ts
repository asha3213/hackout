import { Ed25519PrivateKey } from '@noble/ed25519';

export interface KeyPair {
  privateKey: Ed25519PrivateKey;
  publicKeyPem: string;
  privateKeyPem: string;
}

export function generateEd25519KeyPair(): KeyPair {
  // For demo purposes, we'll use a mock implementation
  // In a real app, you'd use proper cryptographic libraries
  const mockPrivateKey = new Uint8Array(32);
  crypto.getRandomValues(mockPrivateKey);
  
  const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA${btoa(String.fromCharCode(...mockPrivateKey.slice(0, 32)))}
-----END PUBLIC KEY-----`;

  const privateKeyPem = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIA${btoa(String.fromCharCode(...mockPrivateKey))}
-----END PRIVATE KEY-----`;

  return {
    privateKey: mockPrivateKey as any,
    publicKeyPem,
    privateKeyPem,
  };
}

export function signMessage(privateKeyPem: string, message: string): string {
  // Mock signature for demo
  const hash = Array.from(new TextEncoder().encode(message + privateKeyPem))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hash.slice(0, 128);
}

export function canonicalJson(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort(), '');
}
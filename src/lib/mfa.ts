import { generateSecret, generateURI, verify } from "otplib";

export function generateMfaSecret() {
  return generateSecret();
}

export function getMfaUri(email: string, storeName: string, secret: string) {
  return generateURI({ issuer: storeName, label: email, secret });
}

export async function verifyMfaToken(secret: string, token: string) {
  if (!/^\d{6}$/.test(token)) return false;
  const result = await verify({ secret, token });
  return result.valid;
}

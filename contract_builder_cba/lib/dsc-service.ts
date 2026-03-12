/**
 * DSC (Digital Signature Certificate) signing service.
 * In production, this would interface with a PKCS#11 provider or a certificate authority.
 * This implementation provides the structure for client-side Web Crypto API signing
 * and server-side signature verification.
 */

import { createHash, createVerify } from "crypto";

export interface DSCSignaturePayload {
  contractDataHash: string;
  signature: string;
  certificate: string;
  algorithm: string;
}

export interface DSCVerificationResult {
  isValid: boolean;
  signerName?: string;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  error?: string;
}

export function computeContractHash(contractData: Record<string, unknown>): string {
  return createHash("sha256").update(JSON.stringify(contractData)).digest("hex");
}

export function verifyDSCSignature(payload: DSCSignaturePayload): DSCVerificationResult {
  try {
    const { contractDataHash, signature, certificate, algorithm } = payload;

    const verify = createVerify(algorithm || "RSA-SHA256");
    verify.update(contractDataHash);
    const isValid = verify.verify(certificate, signature, "base64");

    return {
      isValid,
      signerName: extractCertField(certificate, "CN"),
      issuer: extractCertField(certificate, "O"),
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

function extractCertField(pem: string, field: string): string | undefined {
  try {
    const match = pem.match(new RegExp(`${field}=([^,/\\n]+)`));
    return match?.[1]?.trim();
  } catch {
    return undefined;
  }
}

/**
 * Returns the data that the client-side Web Crypto API should sign.
 * The client signs this hash with their DSC private key.
 */
export function getSigningPayload(contractId: string, dataHash: string): string {
  return JSON.stringify({ contractId, dataHash, timestamp: new Date().toISOString() });
}

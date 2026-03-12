/**
 * Aadhaar e-Sign service.
 * In production, integrates with the UIDAI/NSDL eSign gateway.
 * This implementation provides a mock for development with the correct interface
 * structure for real gateway integration.
 */

export interface AadhaarESignRequest {
  contractId: string;
  dataHash: string;
  signerName: string;
  signerAadhaarLast4?: string;
  callbackUrl: string;
}

export interface AadhaarESignResponse {
  transactionId: string;
  redirectUrl: string;
  status: "INITIATED" | "SUCCESS" | "FAILED" | "EXPIRED";
}

export interface AadhaarESignCallback {
  transactionId: string;
  status: "SUCCESS" | "FAILED" | "EXPIRED";
  signedData?: string;
  signatureValue?: string;
  certificate?: string;
  error?: string;
}

const AADHAAR_GATEWAY_URL = process.env.WS_AADHAAR_ESIGN_URL;
const AADHAAR_API_KEY = process.env.WS_AADHAAR_ESIGN_KEY;

export async function initiateAadhaarESign(
  request: AadhaarESignRequest
): Promise<AadhaarESignResponse> {
  if (AADHAAR_GATEWAY_URL && AADHAAR_API_KEY) {
    // Production: call real Aadhaar eSign gateway
    const response = await fetch(AADHAAR_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": AADHAAR_API_KEY,
      },
      body: JSON.stringify({
        document_hash: request.dataHash,
        signer_name: request.signerName,
        callback_url: request.callbackUrl,
      }),
    });

    if (!response.ok) throw new Error("Aadhaar eSign gateway error");
    return response.json();
  }

  // Mock: return simulated response
  const transactionId = `MOCK-AADHAAR-${Date.now()}`;
  console.log(`[Aadhaar Mock] Initiated eSign: ${transactionId} for ${request.signerName}`);

  return {
    transactionId,
    redirectUrl: `${request.callbackUrl}?txn=${transactionId}&mock=true`,
    status: "INITIATED",
  };
}

export function parseAadhaarCallback(data: Record<string, string>): AadhaarESignCallback {
  if (data.mock === "true") {
    return {
      transactionId: data.txn || "MOCK",
      status: "SUCCESS",
      signedData: `mock-signed-data-${Date.now()}`,
      signatureValue: `mock-signature-${Date.now()}`,
      certificate: "mock-certificate",
    };
  }

  return {
    transactionId: data.transactionId || data.txn || "",
    status: (data.status as AadhaarESignCallback["status"]) || "FAILED",
    signedData: data.signedData,
    signatureValue: data.signatureValue,
    certificate: data.certificate,
    error: data.error,
  };
}

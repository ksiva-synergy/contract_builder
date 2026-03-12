/**
 * E-Stamping service.
 * In production, integrates with SHCIL (Stock Holding Corporation of India Limited)
 * or other e-stamp vendors. This is a mock implementation with the correct
 * interface structure for real gateway integration.
 */

import { prisma } from "@/lib/prisma";

export interface EStampRequest {
  contractId: string;
  jurisdiction: string;
  stampType: "JUDICIAL" | "NON_JUDICIAL" | "COMMERCIAL";
  stampDutyAmount: number;
}

export interface EStampResponse {
  certificateNo: string;
  stampDate: Date;
  isVerified: boolean;
  jurisdiction: string;
  stampType: string;
  amount: number;
}

const ESTAMP_API_URL = process.env.WS_ESTAMP_API_URL;
const ESTAMP_API_KEY = process.env.WS_ESTAMP_API_KEY;

export async function applyEStamp(request: EStampRequest): Promise<EStampResponse> {
  let certificateNo: string;
  let stampDate: Date;
  let isVerified: boolean;

  if (ESTAMP_API_URL && ESTAMP_API_KEY) {
    const response = await fetch(ESTAMP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ESTAMP_API_KEY,
      },
      body: JSON.stringify({
        jurisdiction: request.jurisdiction,
        stamp_type: request.stampType,
        duty_amount: request.stampDutyAmount,
      }),
    });

    if (!response.ok) throw new Error("E-stamp gateway error");
    const data = await response.json();
    certificateNo = data.certificate_no;
    stampDate = new Date(data.stamp_date);
    isVerified = data.verified;
  } else {
    // Mock response
    certificateNo = `ESTAMP-${request.jurisdiction.substring(0, 2).toUpperCase()}-${Date.now()}`;
    stampDate = new Date();
    isVerified = true;
    console.log(`[EStamp Mock] Generated certificate: ${certificateNo}`);
  }

  await prisma.eStamp.create({
    data: {
      contractId: request.contractId,
      stampCertificateNo: certificateNo,
      stampDutyAmount: request.stampDutyAmount,
      stampType: request.stampType,
      jurisdiction: request.jurisdiction,
      stampDate,
      isVerified,
    },
  });

  return {
    certificateNo,
    stampDate,
    isVerified,
    jurisdiction: request.jurisdiction,
    stampType: request.stampType,
    amount: request.stampDutyAmount,
  };
}

export async function verifyEStamp(certificateNo: string): Promise<{
  isValid: boolean;
  stamp?: EStampResponse;
}> {
  const stamp = await prisma.eStamp.findFirst({
    where: { stampCertificateNo: certificateNo },
  });

  if (!stamp) return { isValid: false };

  if (ESTAMP_API_URL && ESTAMP_API_KEY) {
    const response = await fetch(`${ESTAMP_API_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ESTAMP_API_KEY,
      },
      body: JSON.stringify({ certificate_no: certificateNo }),
    });
    if (response.ok) {
      const data = await response.json();
      return { isValid: data.valid, stamp: { certificateNo: stamp.stampCertificateNo, stampDate: stamp.stampDate, isVerified: stamp.isVerified, jurisdiction: stamp.jurisdiction, stampType: stamp.stampType, amount: Number(stamp.stampDutyAmount) } };
    }
  }

  return {
    isValid: stamp.isVerified,
    stamp: {
      certificateNo: stamp.stampCertificateNo,
      stampDate: stamp.stampDate,
      isVerified: stamp.isVerified,
      jurisdiction: stamp.jurisdiction,
      stampType: stamp.stampType,
      amount: Number(stamp.stampDutyAmount),
    },
  };
}

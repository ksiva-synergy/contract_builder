import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export interface VerificationResult {
  isValid: boolean;
  contractNumber: string;
  status: string;
  tampered: boolean;
  signatures: {
    signerName: string;
    signerEmail: string;
    signatureType: string;
    signedAt: string;
    hashMatch: boolean;
  }[];
  auditLog: {
    action: string;
    userName: string | null;
    timestamp: string;
  }[];
}

export function computeContractHash(contractData: Record<string, unknown>): string {
  const {
    contractNumber,
    fullName,
    dateOfBirth,
    nationality,
    vesselName,
    imoNumber,
    contractStartDate,
    contractExpiryDate,
    basicWages,
    totalMonthlySalary,
  } = contractData;

  const hashInput = JSON.stringify({
    contractNumber,
    fullName,
    dateOfBirth,
    nationality,
    vesselName,
    imoNumber,
    contractStartDate,
    contractExpiryDate,
    basicWages: String(basicWages),
    totalMonthlySalary: String(totalMonthlySalary),
  });

  return createHash("sha256").update(hashInput).digest("hex");
}

export async function verifyContract(contractId: string): Promise<VerificationResult> {
  const contract = await prisma.employmentContract.findUnique({
    where: { id: contractId },
    include: {
      contractSignatures: {
        include: { signer: { select: { name: true, email: true } } },
      },
      auditLogs: {
        include: { user: { select: { name: true } } },
        orderBy: { timestamp: "desc" },
        take: 50,
      },
    },
  });

  if (!contract) {
    throw new Error("Contract not found");
  }

  const currentHash = computeContractHash(contract as unknown as Record<string, unknown>);

  const signatureResults = contract.contractSignatures.map((sig) => ({
    signerName: sig.signer.name,
    signerEmail: sig.signer.email,
    signatureType: sig.signatureType,
    signedAt: sig.signedAt.toISOString(),
    hashMatch: sig.dataHash === currentHash,
  }));

  const tampered = signatureResults.some((s) => !s.hashMatch) && signatureResults.length > 0;

  const auditLog = contract.auditLogs.map((log) => ({
    action: log.action,
    userName: log.user?.name || null,
    timestamp: log.timestamp.toISOString(),
  }));

  return {
    isValid: !tampered && contract.contractSignatures.length > 0,
    contractNumber: contract.contractNumber,
    status: contract.status,
    tampered,
    signatures: signatureResults,
    auditLog,
  };
}

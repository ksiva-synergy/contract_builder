import { NextRequest, NextResponse } from "next/server";
import { prisma, TransactionClient } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { contractIds, signatureData, signatureType } = body as {
      contractIds: string[];
      signatureData: string;
      signatureType: string;
    };

    if (!contractIds?.length || !signatureData || !signatureType) {
      return NextResponse.json(
        { error: "contractIds, signatureData, and signatureType are required" },
        { status: 400 }
      );
    }

    let signed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const contractId of contractIds) {
      try {
        await prisma.$transaction(async (tx: TransactionClient) => {
          const assignment = await tx.contractAssignment.findFirst({
            where: {
              contractId,
              userId,
              role: "SIGNER",
              isCompleted: false,
            },
          });

          if (!assignment) {
            throw new Error(
              `No pending signer assignment for contract ${contractId}`
            );
          }

          const dataHash = createHash("sha256")
            .update(signatureData + contractId)
            .digest("hex");

          await tx.signature.create({
            data: {
              contractId,
              signerId: userId,
              signatureData,
              signatureType: signatureType as "DRAW" | "TYPE" | "UPLOAD" | "DSC" | "AADHAAR",
              dataHash,
              ipAddress:
                request.headers.get("x-forwarded-for") ||
                request.headers.get("x-real-ip"),
              userAgent: request.headers.get("user-agent"),
            },
          });

          await tx.contractAssignment.update({
            where: { id: assignment.id },
            data: { isCompleted: true, completedAt: new Date() },
          });

          const pendingSigners = await tx.contractAssignment.count({
            where: {
              contractId,
              role: "SIGNER",
              isCompleted: false,
            },
          });

          const newStatus =
            pendingSigners === 0 ? "SIGNED" : "PARTIALLY_SIGNED";

          await tx.employmentContract.update({
            where: { id: contractId },
            data: { status: newStatus },
          });

          await tx.auditLog.create({
            data: {
              contractId,
              userId,
              action: "SIGNED",
              details: { signatureType, bulkSign: true },
            },
          });
        });

        signed++;
      } catch (err) {
        failed++;
        errors.push(
          err instanceof Error ? err.message : `Failed to sign ${contractId}`
        );
      }
    }

    return NextResponse.json({ signed, failed, errors });
  } catch (error) {
    console.error("Error in bulk sign:", error);
    return NextResponse.json(
      { error: "Failed to process bulk sign" },
      { status: 500 }
    );
  }
}

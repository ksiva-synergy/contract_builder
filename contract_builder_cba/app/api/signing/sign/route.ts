import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { sendSigningRequest, sendSignatureComplete } from "@/lib/notifications";
import { sealContract } from "@/lib/sealing-service";
import { distributeDocument } from "@/lib/distribution-service";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contractId, signatureData, signatureType, signatureMethod } = await request.json();

    if (!contractId || !signatureData || !signatureType) {
      return NextResponse.json(
        { error: "contractId, signatureData, and signatureType are required" },
        { status: 400 }
      );
    }

    if (!["DRAW", "TYPE", "UPLOAD", "DSC", "AADHAAR"].includes(signatureType)) {
      return NextResponse.json(
        { error: "signatureType must be DRAW, TYPE, UPLOAD, DSC, or AADHAAR" },
        { status: 400 }
      );
    }

    const userId = (session.user as { id: string }).id;
    const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const contract = await prisma.employmentContract.findUnique({
      where: { id: contractId },
      include: {
        assignments: { include: { user: true } },
        createdBy: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.status !== "PENDING_SIGNING" && contract.status !== "PARTIALLY_SIGNED") {
      return NextResponse.json(
        { error: "Contract is not in a signable state" },
        { status: 400 }
      );
    }

    const signerAssignment = contract.assignments.find(
      (a) => a.userId === userId && a.role === "SIGNER" && !a.isCompleted
    );

    if (!signerAssignment) {
      return NextResponse.json(
        { error: "No pending signer assignment found for this user" },
        { status: 403 }
      );
    }

    // Sequential signing order enforcement
    if (contract.signingOrder === "SEQUENTIAL") {
      const earlierPending = contract.assignments.filter(
        (a) => a.role === "SIGNER" && !a.isCompleted && a.orderIndex < signerAssignment.orderIndex
      );
      if (earlierPending.length > 0) {
        return NextResponse.json(
          { error: "It is not your turn to sign yet. Previous signers must complete first." },
          { status: 400 }
        );
      }
    }

    const contractData = { ...contract, assignments: undefined };
    const dataHash = createHash("sha256")
      .update(JSON.stringify(contractData))
      .digest("hex");

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const signature = await tx.signature.create({
        data: {
          contractId,
          signerId: userId,
          signatureData,
          signatureType,
          signatureMethod: signatureMethod || signatureType,
          dataHash,
          ipAddress,
          userAgent,
        },
      });

      await tx.contractAssignment.update({
        where: { id: signerAssignment.id },
        data: { isCompleted: true, completedAt: new Date() },
      });

      const allSignerAssignments = contract.assignments.filter(
        (a) => a.role === "SIGNER"
      );
      const remainingUnsigned = allSignerAssignments.filter(
        (a) => !a.isCompleted && a.id !== signerAssignment.id
      );

      const newStatus = remainingUnsigned.length === 0 ? "SIGNED" : "PARTIALLY_SIGNED";

      const updatedContract = await tx.employmentContract.update({
        where: { id: contractId },
        data: { status: newStatus },
      });

      await tx.auditLog.create({
        data: {
          contractId,
          userId,
          action: "SIGNED",
          details: {
            signatureId: signature.id,
            signatureType,
            signatureMethod: signatureMethod || signatureType,
            newStatus,
            dataHash,
          },
          ipAddress,
        },
      });

      return { signature, contract: updatedContract, newStatus };
    });

    // Post-signing side effects (non-blocking)
    const signerUser = contract.assignments.find((a) => a.userId === userId)?.user;

    // Notify initiator that a signature was received
    if (contract.createdBy && signerUser) {
      sendSignatureComplete(
        contract.createdBy.email,
        contract.createdBy.name,
        signerUser.name,
        contract.contractNumber
      ).catch(console.error);
    }

    // Sequential mode: notify the next signer
    if (contract.signingOrder === "SEQUENTIAL" && result.newStatus === "PARTIALLY_SIGNED") {
      const nextSigner = contract.assignments
        .filter((a) => a.role === "SIGNER" && !a.isCompleted && a.id !== signerAssignment.id)
        .sort((a, b) => a.orderIndex - b.orderIndex)[0];

      if (nextSigner?.token) {
        sendSigningRequest(
          nextSigner.user.email,
          nextSigner.user.name,
          contract.contractNumber,
          nextSigner.token
        ).catch(console.error);
      }
    }

    // Auto-seal and distribute when fully signed
    if (result.newStatus === "SIGNED") {
      (async () => {
        try {
          await sealContract(contractId);
          await distributeDocument(contractId);
        } catch (err) {
          console.error("Auto seal/distribute error:", err);
        }
      })();
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error submitting signature:", error);
    return NextResponse.json(
      { error: "Failed to submit signature" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const assignment = await prisma.contractAssignment.findUnique({
      where: { token },
      include: {
        contract: true,
        user: { select: { id: true, name: true, email: true, passwordHash: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Invalid signing token" }, { status: 404 });
    }

    if (!assignment.tokenExpiresAt || new Date() > assignment.tokenExpiresAt) {
      return NextResponse.json({ error: "Signing token has expired" }, { status: 410 });
    }

    const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;

    await prisma.auditLog.create({
      data: {
        contractId: assignment.contractId,
        userId: assignment.userId,
        action: "TOKEN_ACCESSED",
        details: { assignmentId: assignment.id, token },
        ipAddress,
      },
    });

    const requiresOtp = !assignment.user.passwordHash;

    return NextResponse.json({
      assignmentId: assignment.id,
      contractNumber: assignment.contract.contractNumber,
      seafarerName: assignment.contract.fullName,
      vessel: assignment.contract.vesselName,
      position: assignment.contract.position,
      signerName: assignment.user.name,
      signerEmail: assignment.user.email,
      signerRole: assignment.role,
      requiresOtp,
    });
  } catch (error) {
    console.error("Error validating signing token:", error);
    return NextResponse.json(
      { error: "Failed to validate signing token" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { signatureData, signatureType, signatureMethod } = await request.json();

    if (!signatureData || !signatureType) {
      return NextResponse.json(
        { error: "signatureData and signatureType are required" },
        { status: 400 }
      );
    }

    const assignment = await prisma.contractAssignment.findUnique({
      where: { token },
      include: {
        contract: { include: { assignments: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Invalid signing token" }, { status: 404 });
    }

    if (!assignment.tokenExpiresAt || new Date() > assignment.tokenExpiresAt) {
      return NextResponse.json({ error: "Signing token has expired" }, { status: 410 });
    }

    const { contract } = assignment;

    if (contract.status !== "PENDING_SIGNING" && contract.status !== "PARTIALLY_SIGNED") {
      return NextResponse.json(
        { error: "Contract is not in a signable state" },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const contractData = { ...contract, assignments: undefined };
    const dataHash = createHash("sha256")
      .update(JSON.stringify(contractData))
      .digest("hex");

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const signature = await tx.signature.create({
        data: {
          contractId: assignment.contractId,
          signerId: assignment.userId,
          signatureData,
          signatureType,
          signatureMethod: signatureMethod ?? assignment.signatureMethod,
          dataHash,
          ipAddress,
          userAgent,
        },
      });

      await tx.contractAssignment.update({
        where: { id: assignment.id },
        data: { isCompleted: true, completedAt: new Date() },
      });

      const allSignerAssignments = contract.assignments.filter(
        (a) => a.role === "SIGNER"
      );
      const remainingUnsigned = allSignerAssignments.filter(
        (a) => !a.isCompleted && a.id !== assignment.id
      );

      const newStatus = remainingUnsigned.length === 0 ? "SIGNED" : "PARTIALLY_SIGNED";

      const updatedContract = await tx.employmentContract.update({
        where: { id: assignment.contractId },
        data: { status: newStatus },
      });

      await tx.auditLog.create({
        data: {
          contractId: assignment.contractId,
          userId: assignment.userId,
          action: "SIGNED",
          details: {
            signatureId: signature.id,
            signatureType,
            signatureMethod: signatureMethod ?? assignment.signatureMethod,
            newStatus,
            dataHash,
            viaToken: true,
          },
          ipAddress,
        },
      });

      return { signature, contract: updatedContract };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error submitting signature via token:", error);
    return NextResponse.json(
      { error: "Failed to submit signature" },
      { status: 500 }
    );
  }
}

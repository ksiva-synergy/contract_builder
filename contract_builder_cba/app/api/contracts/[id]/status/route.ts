import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ContractStatus, Prisma } from "@prisma/client";

const VALID_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  DRAFT: [ContractStatus.PENDING_REVIEW, ContractStatus.CANCELLED],
  PENDING_REVIEW: [
    ContractStatus.PENDING_SIGNING,
    ContractStatus.DRAFT,
    ContractStatus.CANCELLED,
  ],
  PENDING_SIGNING: [ContractStatus.PARTIALLY_SIGNED, ContractStatus.CANCELLED],
  PARTIALLY_SIGNED: [ContractStatus.SIGNED, ContractStatus.CANCELLED],
  SIGNED: [],
  CANCELLED: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !Object.values(ContractStatus).includes(status)) {
      return NextResponse.json(
        { error: "A valid ContractStatus is required" },
        { status: 400 }
      );
    }

    const contract = await prisma.employmentContract.findUnique({
      where: { id },
      include: { assignments: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const allowedNext = VALID_TRANSITIONS[contract.status];
    if (!allowedNext.includes(status)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${contract.status} to ${status}`,
          allowedTransitions: allowedNext,
        },
        { status: 400 }
      );
    }

    if (
      contract.status === "DRAFT" &&
      status === ContractStatus.PENDING_REVIEW
    ) {
      const hasReviewer = contract.assignments.some((a) => a.role === "REVIEWER");
      if (!hasReviewer) {
        return NextResponse.json(
          { error: "At least one reviewer must be assigned before submitting for review" },
          { status: 400 }
        );
      }
    }

    const userId = (session.user as { id: string }).id;
    const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedContract = await tx.employmentContract.update({
        where: { id },
        data: { status },
      });

      await tx.auditLog.create({
        data: {
          contractId: id,
          userId,
          action: status === ContractStatus.CANCELLED ? "CANCELLED" : "STATUS_CHANGED",
          details: {
            previousStatus: contract.status,
            newStatus: status,
          },
          ipAddress,
        },
      });

      return updatedContract;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error transitioning contract status:", error);
    return NextResponse.json(
      { error: "Failed to update contract status" },
      { status: 500 }
    );
  }
}

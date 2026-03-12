import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contractId, action, comment } = await request.json();

    if (!contractId || !action) {
      return NextResponse.json(
        { error: "contractId and action are required" },
        { status: 400 }
      );
    }

    if (!["APPROVE", "RETURN"].includes(action)) {
      return NextResponse.json(
        { error: "action must be APPROVE or RETURN" },
        { status: 400 }
      );
    }

    const userId = (session.user as { id: string }).id;
    const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;

    const contract = await prisma.employmentContract.findUnique({
      where: { id: contractId },
      include: { assignments: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.status !== "PENDING_REVIEW") {
      return NextResponse.json(
        { error: "Contract is not in PENDING_REVIEW status" },
        { status: 400 }
      );
    }

    const reviewerAssignment = contract.assignments.find(
      (a) => a.userId === userId && a.role === "REVIEWER" && !a.isCompleted
    );

    if (!reviewerAssignment) {
      return NextResponse.json(
        { error: "No pending reviewer assignment found for this user" },
        { status: 403 }
      );
    }

    const newStatus = action === "APPROVE" ? "PENDING_SIGNING" : "DRAFT";
    const auditAction = action === "APPROVE" ? "APPROVED" : "RETURNED";

    const result = await prisma.$transaction(async (tx) => {
      await tx.contractAssignment.update({
        where: { id: reviewerAssignment.id },
        data: { isCompleted: true, completedAt: new Date() },
      });

      const updatedContract = await tx.employmentContract.update({
        where: { id: contractId },
        data: { status: newStatus },
      });

      await tx.auditLog.create({
        data: {
          contractId,
          userId,
          action: auditAction,
          details: {
            previousStatus: contract.status,
            newStatus,
            ...(comment ? { comment } : {}),
          },
          ipAddress,
        },
      });

      return updatedContract;
    });

    return NextResponse.json({ contract: result });
  } catch (error) {
    console.error("Error reviewing contract:", error);
    return NextResponse.json(
      { error: "Failed to review contract" },
      { status: 500 }
    );
  }
}

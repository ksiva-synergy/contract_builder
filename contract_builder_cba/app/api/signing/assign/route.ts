import { NextRequest, NextResponse } from "next/server";
import { prisma, TransactionClient } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contractId, assignments } = await request.json();

    if (!contractId || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json(
        { error: "contractId and a non-empty assignments array are required" },
        { status: 400 }
      );
    }

    const contract = await prisma.employmentContract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const userId = (session.user as { id: string }).id;
    const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;

    const createdAssignments = await prisma.$transaction(async (tx: TransactionClient) => {
      const results = await Promise.all(
        assignments.map(
          (a: { userId: string; role: "SIGNER" | "REVIEWER"; orderIndex?: number }) =>
            tx.contractAssignment.create({
              data: {
                contractId,
                userId: a.userId,
                role: a.role,
                orderIndex: a.orderIndex ?? 0,
              },
              include: { user: { select: { id: true, name: true, email: true } } },
            })
        )
      );

      await Promise.all(
        results.map((assignment) =>
          tx.auditLog.create({
            data: {
              contractId,
              userId,
              action: "ASSIGNMENT_ADDED",
              details: {
                assignedUserId: assignment.userId,
                role: assignment.role,
                orderIndex: assignment.orderIndex,
              },
              ipAddress,
            },
          })
        )
      );

      return results;
    });

    return NextResponse.json(createdAssignments, { status: 201 });
  } catch (error) {
    console.error("Error assigning signers/reviewers:", error);
    return NextResponse.json(
      { error: "Failed to create assignments" },
      { status: 500 }
    );
  }
}

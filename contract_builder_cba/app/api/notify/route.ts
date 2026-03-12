import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendSigningRequest } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contractId } = body;

    if (!contractId) {
      return NextResponse.json(
        { error: "contractId is required" },
        { status: 400 }
      );
    }

    const contract = await prisma.employmentContract.findUnique({
      where: { id: contractId },
      include: {
        assignments: {
          include: { user: true },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const pendingSigners = contract.assignments.filter(
      (a) => a.role === "SIGNER" && !a.isCompleted
    );

    let notified = 0;

    for (const assignment of pendingSigners) {
      let token = assignment.token;

      if (!token) {
        token = randomUUID();
        await prisma.contractAssignment.update({
          where: { id: assignment.id },
          data: {
            token,
            tokenExpiresAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
          },
        });
      }

      await sendSigningRequest(
        assignment.user.email,
        assignment.user.name,
        contract.contractNumber,
        token
      );

      notified++;
    }

    return NextResponse.json({ notified });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}

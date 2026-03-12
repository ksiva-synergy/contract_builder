import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyContract } from "@/lib/services/verification-service";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contractId, contractNumber } = await request.json();

    let id = contractId;

    if (!id && contractNumber) {
      const found = await prisma.employmentContract.findUnique({
        where: { contractNumber },
        select: { id: true },
      });
      if (!found) {
        return NextResponse.json(
          { error: "Contract not found" },
          { status: 404 }
        );
      }
      id = found.id;
    }

    if (!id) {
      return NextResponse.json(
        { error: "contractId or contractNumber required" },
        { status: 400 }
      );
    }

    const result = await verifyContract(id);

    await prisma.auditLog.create({
      data: {
        contractId: id,
        userId: session.user.id,
        action: "VERIFIED",
        ipAddress: request.headers.get("x-forwarded-for") || null,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Contract not found") {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}

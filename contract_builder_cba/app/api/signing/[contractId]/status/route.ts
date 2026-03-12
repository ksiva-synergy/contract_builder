import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contractId } = await params;

    const contract = await prisma.employmentContract.findUnique({
      where: { id: contractId },
      select: {
        id: true,
        contractNumber: true,
        status: true,
        signingOrder: true,
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
        contractSignatures: {
          include: {
            signer: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { signedAt: "asc" },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    return NextResponse.json({
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      status: contract.status,
      signingOrder: contract.signingOrder,
      assignments: contract.assignments.map((a) => ({
        id: a.id,
        user: a.user,
        role: a.role,
        orderIndex: a.orderIndex,
        isCompleted: a.isCompleted,
        completedAt: a.completedAt,
      })),
      signatures: contract.contractSignatures.map((s) => ({
        id: s.id,
        signer: s.signer,
        signatureType: s.signatureType,
        signedAt: s.signedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching signing status:", error);
    return NextResponse.json(
      { error: "Failed to fetch signing status" },
      { status: 500 }
    );
  }
}

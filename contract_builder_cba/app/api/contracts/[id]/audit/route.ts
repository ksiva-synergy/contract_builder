import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const contract = await prisma.employmentContract.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { contractId: id },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

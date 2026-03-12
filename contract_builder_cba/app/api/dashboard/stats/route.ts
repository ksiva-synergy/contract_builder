import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const [totalContracts, statusGroups, recentActivity, pendingForUser] =
      await Promise.all([
        prisma.employmentContract.count(),

        prisma.employmentContract.groupBy({
          by: ["status"],
          _count: { status: true },
        }),

        prisma.auditLog.findMany({
          take: 10,
          orderBy: { timestamp: "desc" },
          include: {
            user: { select: { id: true, name: true, email: true } },
            contract: {
              select: { id: true, contractNumber: true, fullName: true },
            },
          },
        }),

        prisma.contractAssignment.count({
          where: { userId, isCompleted: false },
        }),
      ]);

    const statusBreakdown: Record<string, number> = {};
    for (const group of statusGroups) {
      statusBreakdown[group.status] = group._count.status;
    }

    return NextResponse.json({
      totalContracts,
      statusBreakdown,
      recentActivity,
      pendingForUser,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

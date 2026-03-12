import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { applyEStamp } from "@/lib/estamp-service";

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

    const estamps = await prisma.eStamp.findMany({
      where: { contractId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(estamps);
  } catch (error) {
    console.error("Error fetching e-stamps:", error);
    return NextResponse.json(
      { error: "Failed to fetch e-stamps" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const { jurisdiction, stampType, stampDutyAmount } = body;
    if (!jurisdiction || !stampType || stampDutyAmount == null) {
      return NextResponse.json(
        { error: "jurisdiction, stampType, and stampDutyAmount are required" },
        { status: 400 }
      );
    }

    const result = await applyEStamp({
      contractId: id,
      jurisdiction,
      stampType,
      stampDutyAmount,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error applying e-stamp:", error);
    return NextResponse.json(
      { error: "Failed to apply e-stamp" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sealContract } from "@/lib/sealing-service";

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

    const contract = await prisma.employmentContract.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    if (contract.status !== "SIGNED") {
      return NextResponse.json(
        { error: "Contract must be fully signed before sealing" },
        { status: 400 }
      );
    }

    const result = await sealContract(id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error sealing contract:", error);
    return NextResponse.json(
      { error: "Failed to seal contract" },
      { status: 500 }
    );
  }
}

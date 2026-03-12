import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { distributeDocument } from "@/lib/distribution-service";

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

    await distributeDocument(id);

    return NextResponse.json({ message: "Document distributed successfully" });
  } catch (error) {
    console.error("Error distributing document:", error);
    const message =
      error instanceof Error ? error.message : "Failed to distribute document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyEStamp } from "@/lib/estamp-service";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { certificateNo } = body;

    if (!certificateNo) {
      return NextResponse.json(
        { error: "certificateNo is required" },
        { status: 400 }
      );
    }

    const result = await verifyEStamp(certificateNo);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error verifying e-stamp:", error);
    return NextResponse.json(
      { error: "Failed to verify e-stamp" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "OTP code is required" }, { status: 400 });
    }

    const assignment = await prisma.contractAssignment.findUnique({
      where: { token },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Invalid signing token" }, { status: 404 });
    }

    if (!assignment.tokenExpiresAt || new Date() > assignment.tokenExpiresAt) {
      return NextResponse.json({ error: "Signing token has expired" }, { status: 410 });
    }

    const isValid = await verifyOtp(assignment.id, code);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;

    await prisma.auditLog.create({
      data: {
        contractId: assignment.contractId,
        userId: assignment.userId,
        action: "OTP_VERIFIED",
        details: { assignmentId: assignment.id },
        ipAddress,
      },
    });

    return NextResponse.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}

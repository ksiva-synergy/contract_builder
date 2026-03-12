import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOtpForAssignment } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/notifications";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const assignment = await prisma.contractAssignment.findUnique({
      where: { token },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Invalid signing token" }, { status: 404 });
    }

    if (!assignment.tokenExpiresAt || new Date() > assignment.tokenExpiresAt) {
      return NextResponse.json({ error: "Signing token has expired" }, { status: 410 });
    }

    const otp = await createOtpForAssignment(assignment.id);
    await sendOtpEmail(assignment.user.email, assignment.user.name, otp);

    return NextResponse.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}

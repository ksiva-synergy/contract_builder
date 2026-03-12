import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 5;

export function generateOtp(): string {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return randomInt(min, max + 1).toString();
}

export async function createOtpForAssignment(assignmentId: string): Promise<string> {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.contractAssignment.update({
    where: { id: assignmentId },
    data: {
      otpCode: otp,
      otpExpiresAt: expiresAt,
    },
  });

  return otp;
}

export async function verifyOtp(assignmentId: string, code: string): Promise<boolean> {
  const assignment = await prisma.contractAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment?.otpCode || !assignment.otpExpiresAt) return false;
  if (new Date() > assignment.otpExpiresAt) return false;
  if (assignment.otpCode !== code) return false;

  await prisma.contractAssignment.update({
    where: { id: assignmentId },
    data: { otpCode: null, otpExpiresAt: null },
  });

  return true;
}

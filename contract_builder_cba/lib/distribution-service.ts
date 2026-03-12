import { prisma } from "@/lib/prisma";
import { sendDocumentSealed } from "@/lib/notifications";

export async function distributeDocument(contractId: string): Promise<void> {
  const contract = await prisma.employmentContract.findUnique({
    where: { id: contractId },
    include: {
      assignments: { include: { user: true } },
      createdBy: true,
    },
  });

  if (!contract) throw new Error("Contract not found");
  if (!contract.sealedFilePath) throw new Error("Contract has not been sealed yet");

  const recipients: Array<{ email: string; name: string }> = [];

  if (contract.createdBy) {
    recipients.push({ email: contract.createdBy.email, name: contract.createdBy.name });
  }

  for (const assignment of contract.assignments) {
    if (!recipients.find((r) => r.email === assignment.user.email)) {
      recipients.push({ email: assignment.user.email, name: assignment.user.name });
    }
  }

  await sendDocumentSealed(recipients, contract.contractNumber, contract.sealedFilePath);

  await prisma.auditLog.create({
    data: {
      contractId,
      action: "DISTRIBUTED",
      details: {
        recipients: recipients.map((r) => r.email),
        sealedFilePath: contract.sealedFilePath,
      },
    },
  });
}

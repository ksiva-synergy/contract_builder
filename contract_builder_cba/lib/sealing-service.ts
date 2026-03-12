import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { saveFile, getFile } from "@/lib/file-storage";

export async function sealContract(contractId: string): Promise<{
  sealedFilePath: string;
  sealedHash: string;
}> {
  const contract = await prisma.employmentContract.findUnique({
    where: { id: contractId },
    include: {
      contractSignatures: { include: { signer: true } },
      assignments: { include: { user: true } },
      createdBy: true,
    },
  });

  if (!contract) throw new Error("Contract not found");
  if (contract.status !== "SIGNED") throw new Error("Contract must be fully signed before sealing");

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page 1: Contract summary
  const page1 = pdfDoc.addPage([595, 842]);
  let y = 790;

  page1.drawText("SEAFARER EMPLOYMENT CONTRACT", {
    x: 50, y, size: 18, font: fontBold, color: rgb(0, 0.45, 0.73),
  });
  y -= 30;
  page1.drawText(`Contract Number: ${contract.contractNumber}`, { x: 50, y, size: 12, font });
  y -= 20;
  page1.drawText(`Seafarer: ${contract.fullName}`, { x: 50, y, size: 12, font });
  y -= 20;
  page1.drawText(`Vessel: ${contract.vesselName} (IMO: ${contract.imoNumber})`, { x: 50, y, size: 12, font });
  y -= 20;
  page1.drawText(`Position: ${contract.position}`, { x: 50, y, size: 12, font });
  y -= 20;
  page1.drawText(`Contract Period: ${contract.contractStartDate} to ${contract.contractExpiryDate}`, { x: 50, y, size: 12, font });
  y -= 40;

  // Embed signatures
  page1.drawText("SIGNATURES", { x: 50, y, size: 14, font: fontBold, color: rgb(0, 0.45, 0.73) });
  y -= 25;

  for (const sig of contract.contractSignatures) {
    page1.drawText(`${sig.signer.name} (${sig.signatureType})`, { x: 50, y, size: 11, font: fontBold });
    y -= 15;
    page1.drawText(`Signed: ${sig.signedAt.toISOString().split("T")[0]}`, { x: 50, y, size: 10, font });
    y -= 15;
    page1.drawText(`Hash: ${sig.dataHash.substring(0, 32)}...`, { x: 50, y, size: 8, font, color: rgb(0.4, 0.4, 0.4) });
    y -= 10;

    if (sig.signatureData.startsWith("data:image")) {
      try {
        const base64 = sig.signatureData.split(",")[1];
        const imgBytes = Buffer.from(base64, "base64");
        const img = sig.signatureData.includes("png")
          ? await pdfDoc.embedPng(imgBytes)
          : await pdfDoc.embedJpg(imgBytes);
        const dims = img.scale(0.3);
        page1.drawImage(img, { x: 50, y: y - dims.height, width: dims.width, height: dims.height });
        y -= dims.height + 10;
      } catch {
        y -= 5;
      }
    }
    y -= 20;
  }

  // Page 2: Certificate of Completion
  const page2 = pdfDoc.addPage([595, 842]);
  y = 790;

  page2.drawText("CERTIFICATE OF COMPLETION", {
    x: 50, y, size: 20, font: fontBold, color: rgb(0, 0.45, 0.73),
  });
  y -= 40;
  page2.drawText("This document has been digitally signed and sealed.", { x: 50, y, size: 12, font });
  y -= 30;

  page2.drawText("Document Details:", { x: 50, y, size: 13, font: fontBold });
  y -= 20;
  page2.drawText(`Contract Number: ${contract.contractNumber}`, { x: 70, y, size: 11, font });
  y -= 16;
  page2.drawText(`Sealed At: ${new Date().toISOString()}`, { x: 70, y, size: 11, font });
  y -= 30;

  page2.drawText("Signing Participants:", { x: 50, y, size: 13, font: fontBold });
  y -= 20;

  for (const sig of contract.contractSignatures) {
    page2.drawText(`- ${sig.signer.name} <${sig.signer.email}>`, { x: 70, y, size: 11, font });
    y -= 15;
    page2.drawText(`  Role: Signer | Method: ${sig.signatureType} | Signed: ${sig.signedAt.toISOString()}`, {
      x: 70, y, size: 9, font, color: rgb(0.4, 0.4, 0.4),
    });
    y -= 15;
    page2.drawText(`  IP: ${sig.ipAddress || "N/A"} | Integrity Hash: ${sig.dataHash.substring(0, 40)}...`, {
      x: 70, y, size: 8, font, color: rgb(0.5, 0.5, 0.5),
    });
    y -= 20;
  }

  y -= 20;
  page2.drawText("Reviewers:", { x: 50, y, size: 13, font: fontBold });
  y -= 20;
  const reviewers = contract.assignments.filter((a) => a.role === "REVIEWER");
  for (const rev of reviewers) {
    page2.drawText(`- ${rev.user.name} <${rev.user.email}>`, { x: 70, y, size: 11, font });
    y -= 15;
    page2.drawText(`  Completed: ${rev.completedAt?.toISOString() || "N/A"}`, {
      x: 70, y, size: 9, font, color: rgb(0.4, 0.4, 0.4),
    });
    y -= 20;
  }

  // Compute hash of sealed PDF
  const pdfBytes = await pdfDoc.save();
  const sealedHash = createHash("sha256").update(pdfBytes).digest("hex");

  // Add hash to last page
  page2.drawText(`Document Hash (SHA-256): ${sealedHash}`, {
    x: 50, y: 50, size: 8, font, color: rgb(0.3, 0.3, 0.3),
  });

  const finalBytes = await pdfDoc.save();
  const { filePath } = await saveFile(
    Buffer.from(finalBytes),
    `${contract.contractNumber}-sealed.pdf`,
    "sealed"
  );

  const finalHash = createHash("sha256").update(finalBytes).digest("hex");

  await prisma.employmentContract.update({
    where: { id: contractId },
    data: {
      sealedFilePath: filePath,
      sealedAt: new Date(),
      sealedHash: finalHash,
    },
  });

  await prisma.auditLog.create({
    data: {
      contractId,
      action: "SEALED",
      details: { sealedHash: finalHash, sealedFilePath: filePath },
    },
  });

  return { sealedFilePath: filePath, sealedHash: finalHash };
}

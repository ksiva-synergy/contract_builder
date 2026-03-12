import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateContractPdf } from "@/lib/pdf/contract-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contract = await prisma.employmentContract.findUnique({
      where: { id },
      include: {
        contractSignatures: {
          include: { signer: { select: { name: true, email: true } } },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const signatures = contract.contractSignatures.map((sig) => ({
      signerName: sig.signer.name,
      signerEmail: sig.signer.email,
      signatureType: sig.signatureType,
      signedAt: sig.signedAt.toISOString(),
      signatureData: sig.signatureData,
    }));

    const pdfBuffer = generateContractPdf(
      {
        contractNumber: contract.contractNumber,
        effectiveFrom: contract.effectiveFrom,
        fullName: contract.fullName,
        dateOfBirth: contract.dateOfBirth,
        age: contract.age,
        nationality: contract.nationality,
        cdcNumber: contract.cdcNumber,
        address: contract.address,
        crewCode: contract.crewCode,
        position: contract.position,
        placeOfBirth: contract.placeOfBirth,
        ppNumber: contract.ppNumber,
        vesselName: contract.vesselName,
        imoNumber: contract.imoNumber,
        registeredOwner: contract.registeredOwner,
        portOfRegistry: contract.portOfRegistry,
        shipownerAddress: contract.shipownerAddress,
        contractTerm: contract.contractTerm,
        placeOfEngagement: contract.placeOfEngagement,
        contractStartDate: contract.contractStartDate,
        contractExpiryDate: contract.contractExpiryDate,
        basicWages: Number(contract.basicWages),
        employerSpecialAllowance: Number(contract.employerSpecialAllowance),
        fixedOvertime: Number(contract.fixedOvertime),
        leavePay: Number(contract.leavePay),
        subsistenceAllowance: Number(contract.subsistenceAllowance),
        specialAllowance: Number(contract.specialAllowance),
        uniformAllowance: Number(contract.uniformAllowance),
        totalMonthlySalary: Number(contract.totalMonthlySalary),
        netMonthlySalary: Number(contract.netMonthlySalary),
        status: contract.status,
      },
      signatures
    );

    await prisma.auditLog.create({
      data: {
        contractId: id,
        userId: session.user.id,
        action: "EXPORTED",
        details: { format: "PDF" },
      },
    });

    // Cast needed: Uint8Array is valid BlobPart at runtime; TS's BlobPart can exclude it when buffer is ArrayBufferLike
    return new NextResponse(new Blob([pdfBuffer as BlobPart]), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contract-${contract.contractNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

import { jsPDF } from "jspdf";

interface ContractData {
  contractNumber: string;
  effectiveFrom: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  nationality: string;
  cdcNumber: string;
  address: string;
  crewCode: string;
  position: string;
  placeOfBirth: string;
  ppNumber: string;
  vesselName: string;
  imoNumber: string;
  registeredOwner: string;
  portOfRegistry: string;
  shipownerAddress: string;
  contractTerm: string;
  placeOfEngagement: string;
  contractStartDate: string;
  contractExpiryDate: string;
  basicWages: number;
  employerSpecialAllowance: number;
  fixedOvertime: number;
  leavePay: number;
  subsistenceAllowance: number;
  specialAllowance: number;
  uniformAllowance: number;
  totalMonthlySalary: number;
  netMonthlySalary: number;
  status: string;
}

interface SignatureInfo {
  signerName: string;
  signerEmail: string;
  signatureType: string;
  signedAt: string;
  signatureData: string;
}

export function generateContractPdf(
  contract: ContractData,
  signatures: SignatureInfo[] = []
): Uint8Array {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function addText(text: string, fontSize: number, opts?: { bold?: boolean; align?: "left" | "center" | "right" }) {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    const align = opts?.align || "left";
    const x = align === "center" ? pageWidth / 2 : align === "right" ? pageWidth - margin : margin;
    doc.text(text, x, y, { align });
    y += fontSize * 0.5;
  }

  function addLine() {
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
  }

  function addField(label: string, value: string) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "N/A", margin + 55, y);
    y += 5;
  }

  function checkPage(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  }

  // Header
  addText("SEAFARER'S EMPLOYMENT CONTRACT", 16, { bold: true, align: "center" });
  y += 2;
  addText("(Standard Employment Agreement)", 10, { align: "center" });
  y += 4;
  addLine();
  y += 2;

  // Contract info
  addField("Contract Number:", contract.contractNumber);
  addField("Effective From:", contract.effectiveFrom);
  addField("Status:", contract.status);
  y += 4;

  // Personal Details
  addText("PERSONAL DETAILS", 12, { bold: true });
  y += 2;
  addLine();
  addField("Full Name:", contract.fullName);
  addField("Date of Birth:", contract.dateOfBirth);
  addField("Age:", String(contract.age));
  addField("Nationality:", contract.nationality);
  addField("CDC Number:", contract.cdcNumber);
  addField("Address:", contract.address);
  addField("Crew Code:", contract.crewCode);
  addField("Position:", contract.position);
  addField("Place of Birth:", contract.placeOfBirth);
  addField("PP Number:", contract.ppNumber);
  y += 4;

  checkPage(60);

  // Vessel Details
  addText("VESSEL DETAILS", 12, { bold: true });
  y += 2;
  addLine();
  addField("Vessel Name:", contract.vesselName);
  addField("IMO Number:", contract.imoNumber);
  addField("Registered Owner:", contract.registeredOwner);
  addField("Port of Registry:", contract.portOfRegistry);
  addField("Shipowner Address:", contract.shipownerAddress);
  y += 4;

  checkPage(40);

  // Contract Terms
  addText("CONTRACT TERMS", 12, { bold: true });
  y += 2;
  addLine();
  addField("Contract Term:", contract.contractTerm);
  addField("Place of Engagement:", contract.placeOfEngagement);
  addField("Start Date:", contract.contractStartDate);
  addField("Expiry Date:", contract.contractExpiryDate);
  y += 4;

  checkPage(70);

  // Wage Breakdown
  addText("WAGE BREAKDOWN (USD)", 12, { bold: true });
  y += 2;
  addLine();

  const wages = [
    ["Basic Wages", contract.basicWages],
    ["Employer Special Allowance", contract.employerSpecialAllowance],
    ["Fixed Overtime", contract.fixedOvertime],
    ["Leave Pay", contract.leavePay],
    ["Subsistence Allowance", contract.subsistenceAllowance],
    ["Special Allowance", contract.specialAllowance],
    ["Uniform Allowance", contract.uniformAllowance],
  ] as const;

  for (const [label, amount] of wages) {
    addField(`${label}:`, `$${Number(amount).toFixed(2)}`);
  }
  y += 2;
  doc.setDrawColor(100);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;
  addField("Total Monthly Salary:", `$${Number(contract.totalMonthlySalary).toFixed(2)}`);
  addField("Net Monthly Salary:", `$${Number(contract.netMonthlySalary).toFixed(2)}`);
  y += 6;

  // Signatures
  if (signatures.length > 0) {
    checkPage(30 + signatures.length * 40);
    addText("SIGNATURES", 12, { bold: true });
    y += 2;
    addLine();

    for (const sig of signatures) {
      checkPage(40);
      addField("Signer:", `${sig.signerName} (${sig.signerEmail})`);
      addField("Signed At:", new Date(sig.signedAt).toLocaleString());
      addField("Method:", sig.signatureType);

      if (sig.signatureData && sig.signatureData.startsWith("data:image")) {
        try {
          doc.addImage(sig.signatureData, "PNG", margin, y, 60, 20);
          y += 24;
        } catch {
          addField("Signature:", "[Image could not be embedded]");
        }
      }
      y += 4;
    }
  }

  // Footer
  checkPage(20);
  y += 6;
  addLine();
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    `Generated on ${new Date().toLocaleString()} | Contract Builder CBA Platform`,
    pageWidth / 2,
    y,
    { align: "center" }
  );

  return new Uint8Array(doc.output("arraybuffer"));
}

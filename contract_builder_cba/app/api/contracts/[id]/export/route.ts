import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const contract = await prisma.employmentContract.findUnique({
      where: { id },
      include: { otherEarnings: true, deductions: true, salaryRevisions: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const totalWages =
      Number(contract.basicWages) +
      Number(contract.employerSpecialAllowance) +
      Number(contract.fixedOvertime) +
      Number(contract.leavePay) +
      Number(contract.subsistenceAllowance) +
      Number(contract.specialAllowance) +
      Number(contract.uniformAllowance);

    const totalEarnings = contract.otherEarnings.reduce((sum: number, e: { amount: unknown }) => sum + Number(e.amount), 0);
    const totalDeductions = contract.deductions.reduce((sum: number, d: { amount: unknown }) => sum + Number(d.amount), 0);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; font-size: 12px; color: #000; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { text-align: center; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; }
    h2 { font-size: 14px; border-bottom: 1px solid #999; padding-bottom: 4px; margin-top: 24px; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 24px; }
    .meta { font-size: 11px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    td { padding: 4px 0; font-size: 11px; }
    .label { color: #666; width: 35%; }
    .wages td { border-bottom: 1px solid #eee; }
    .total td { border-top: 2px solid #000; font-weight: bold; }
    .signatures { display: flex; justify-content: space-between; margin-top: 48px; }
    .sig-block { width: 45%; }
    .sig-line { border-bottom: 1px solid #000; height: 60px; margin-bottom: 4px; }
    .footer { text-align: center; font-size: 9px; color: #999; margin-top: 48px; border-top: 1px solid #ddd; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Seafarer's Employment Contract</h1>
    <p class="meta">In compliance with the Maritime Labour Convention (MLC) 2006</p>
    <p class="meta">Contract No: <strong>${contract.contractNumber}</strong> | Effective From: <strong>${contract.effectiveFrom}</strong></p>
  </div>

  <h2>1. Personal Details</h2>
  <table>
    <tr><td class="label">Full Name</td><td>${contract.fullName}</td></tr>
    <tr><td class="label">Date of Birth</td><td>${contract.dateOfBirth}</td></tr>
    <tr><td class="label">Age</td><td>${contract.age}</td></tr>
    <tr><td class="label">Nationality</td><td>${contract.nationality}</td></tr>
    <tr><td class="label">CDC Number</td><td>${contract.cdcNumber}</td></tr>
    <tr><td class="label">Address</td><td>${contract.address}</td></tr>
    <tr><td class="label">Crew Code</td><td>${contract.crewCode}</td></tr>
    <tr><td class="label">Position</td><td>${contract.position}</td></tr>
  </table>

  <h2>2. Vessel Details</h2>
  <table>
    <tr><td class="label">Vessel Name</td><td>${contract.vesselName}</td></tr>
    <tr><td class="label">IMO Number</td><td>${contract.imoNumber}</td></tr>
    <tr><td class="label">Registered Owner</td><td>${contract.registeredOwner}</td></tr>
    <tr><td class="label">Port of Registry</td><td>${contract.portOfRegistry}</td></tr>
  </table>

  <h2>3. Contract Terms</h2>
  <table>
    <tr><td class="label">Contract Term</td><td>${contract.contractTerm}</td></tr>
    <tr><td class="label">Place of Engagement</td><td>${contract.placeOfEngagement}</td></tr>
    <tr><td class="label">Start Date</td><td>${contract.contractStartDate}</td></tr>
    <tr><td class="label">Expiry Date</td><td>${contract.contractExpiryDate}</td></tr>
  </table>

  <h2>4. Wage Breakdown (Monthly)</h2>
  <table class="wages">
    <tr><td>Basic Wages</td><td style="text-align:right">${Number(contract.basicWages).toFixed(2)}</td></tr>
    <tr><td>Employer Special Allowance</td><td style="text-align:right">${Number(contract.employerSpecialAllowance).toFixed(2)}</td></tr>
    <tr><td>Fixed Overtime</td><td style="text-align:right">${Number(contract.fixedOvertime).toFixed(2)}</td></tr>
    <tr><td>Leave Pay</td><td style="text-align:right">${Number(contract.leavePay).toFixed(2)}</td></tr>
    <tr><td>Subsistence Allowance</td><td style="text-align:right">${Number(contract.subsistenceAllowance).toFixed(2)}</td></tr>
    <tr><td>Special Allowance</td><td style="text-align:right">${Number(contract.specialAllowance).toFixed(2)}</td></tr>
    <tr><td>Uniform Allowance</td><td style="text-align:right">${Number(contract.uniformAllowance).toFixed(2)}</td></tr>
    <tr class="total"><td>Total Monthly Salary</td><td style="text-align:right">USD ${totalWages.toFixed(2)}</td></tr>
  </table>

  ${contract.otherEarnings.length > 0 ? `
  <h2>5. Other Earnings</h2>
  <table class="wages">
    ${contract.otherEarnings.map((e: { description: string; amount: unknown }) => `<tr><td>${e.description}</td><td style="text-align:right">${Number(e.amount).toFixed(2)}</td></tr>`).join("")}
    <tr class="total"><td>Total</td><td style="text-align:right">USD ${totalEarnings.toFixed(2)}</td></tr>
  </table>` : ""}

  ${contract.deductions.length > 0 ? `
  <h2>${contract.otherEarnings.length > 0 ? "6" : "5"}. Deductions</h2>
  <table class="wages">
    ${contract.deductions.map((d: { description: string; amount: unknown }) => `<tr><td>${d.description}</td><td style="text-align:right">${Number(d.amount).toFixed(2)}</td></tr>`).join("")}
    <tr class="total"><td>Total</td><td style="text-align:right">USD ${totalDeductions.toFixed(2)}</td></tr>
  </table>` : ""}

  <div style="background:#f5f5f5;padding:12px;border-radius:4px;margin-top:24px">
    <table>
      <tr><td>Total Monthly Salary</td><td style="text-align:right">${totalWages.toFixed(2)}</td></tr>
      ${totalEarnings > 0 ? `<tr><td>+ Other Earnings</td><td style="text-align:right">${totalEarnings.toFixed(2)}</td></tr>` : ""}
      ${totalDeductions > 0 ? `<tr><td>- Deductions</td><td style="text-align:right">(${totalDeductions.toFixed(2)})</td></tr>` : ""}
      <tr class="total"><td>Net Monthly Pay</td><td style="text-align:right">USD ${(totalWages + totalEarnings - totalDeductions).toFixed(2)}</td></tr>
    </table>
  </div>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line">${contract.signature || ""}</div>
      <p><strong>Seafarer's Signature</strong></p>
      <p class="meta">${contract.fullName}</p>
      ${contract.place ? `<p class="meta">Place: ${contract.place}</p>` : ""}
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <p><strong>Shipowner / Representative</strong></p>
      <p class="meta">${contract.registeredOwner}</p>
    </div>
  </div>

  <div class="footer">
    <p>Generated by Contract Builder CBA Platform | Document ID: ${contract.id}</p>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="contract-${contract.contractNumber}.html"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to export contract" }, { status: 500 });
  }
}

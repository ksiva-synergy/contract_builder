import { sendEmail } from "@/lib/email";

const APP_URL = process.env.WS_APP_URL || "http://localhost:3002";

export async function sendSigningRequest(
  signerEmail: string,
  signerName: string,
  contractNumber: string,
  token: string
) {
  const signingUrl = `${APP_URL}/sign/${token}`;
  return sendEmail({
    to: signerEmail,
    subject: `Action Required: Sign Contract ${contractNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0ea5e9; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">Document Signing Request</h1>
        </div>
        <div style="padding: 24px; background: #f8fafc;">
          <p>Hello ${signerName},</p>
          <p>You have been requested to sign contract <strong>${contractNumber}</strong>.</p>
          <p>Please click the button below to review and sign the document:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${signingUrl}" style="background: #0ea5e9; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review & Sign Document
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${signingUrl}">${signingUrl}</a>
          </p>
          <p style="color: #64748b; font-size: 12px;">This link will expire in 7 days.</p>
        </div>
      </div>
    `,
  });
}

export async function sendOtpEmail(
  email: string,
  name: string,
  otp: string
) {
  return sendEmail({
    to: email,
    subject: `Your Verification Code: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0ea5e9; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">Identity Verification</h1>
        </div>
        <div style="padding: 24px; background: #f8fafc;">
          <p>Hello ${name},</p>
          <p>Your one-time verification code is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0ea5e9;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code expires in 5 minutes. Do not share it with anyone.</p>
        </div>
      </div>
    `,
  });
}

export async function sendSigningReminder(
  signerEmail: string,
  signerName: string,
  contractNumber: string,
  token: string
) {
  const signingUrl = `${APP_URL}/sign/${token}`;
  return sendEmail({
    to: signerEmail,
    subject: `Reminder: Sign Contract ${contractNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">Signing Reminder</h1>
        </div>
        <div style="padding: 24px; background: #f8fafc;">
          <p>Hello ${signerName},</p>
          <p>This is a reminder that contract <strong>${contractNumber}</strong> is awaiting your signature.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${signingUrl}" style="background: #f59e0b; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Sign Now
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendSignatureComplete(
  initiatorEmail: string,
  initiatorName: string,
  signerName: string,
  contractNumber: string
) {
  return sendEmail({
    to: initiatorEmail,
    subject: `Signature Received: ${contractNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #22c55e; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">Signature Received</h1>
        </div>
        <div style="padding: 24px; background: #f8fafc;">
          <p>Hello ${initiatorName},</p>
          <p><strong>${signerName}</strong> has signed contract <strong>${contractNumber}</strong>.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/contracts" style="background: #22c55e; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Contract
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendDocumentSealed(
  recipients: Array<{ email: string; name: string }>,
  contractNumber: string,
  attachmentPath?: string
) {
  const promises = recipients.map((r) =>
    sendEmail({
      to: r.email,
      subject: `Document Finalized: ${contractNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #6366f1; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0;">Document Sealed & Finalized</h1>
          </div>
          <div style="padding: 24px; background: #f8fafc;">
            <p>Hello ${r.name},</p>
            <p>Contract <strong>${contractNumber}</strong> has been fully signed and digitally sealed.</p>
            <p>All signatures have been verified and the document has been finalized. ${attachmentPath ? "The sealed document is attached to this email." : "You can download the sealed document from the portal."}</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${APP_URL}/contracts" style="background: #6366f1; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View in Portal
              </a>
            </div>
          </div>
        </div>
      `,
      attachments: attachmentPath ? [{ filename: `${contractNumber}-sealed.pdf`, path: attachmentPath }] : undefined,
    })
  );
  return Promise.all(promises);
}

export async function sendDocumentRejected(
  initiatorEmail: string,
  initiatorName: string,
  reviewerName: string,
  contractNumber: string,
  reason?: string
) {
  return sendEmail({
    to: initiatorEmail,
    subject: `Contract Returned: ${contractNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">Contract Returned</h1>
        </div>
        <div style="padding: 24px; background: #f8fafc;">
          <p>Hello ${initiatorName},</p>
          <p><strong>${reviewerName}</strong> has returned contract <strong>${contractNumber}</strong> for revision.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/contracts" style="background: #ef4444; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review & Revise
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

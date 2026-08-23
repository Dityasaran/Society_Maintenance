import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface StatusChangeEmailParams {
  residentName: string;
  residentEmail: string;
  complaintId: string;
  category: string;
  oldStatus: string | null;
  newStatus: string;
  note?: string | null;
}

interface NoticeEmailParams {
  residentName: string;
  residentEmail: string;
  noticeTitle: string;
  noticeBody: string;
}

export async function sendStatusChangeEmail(
  params: StatusChangeEmailParams
): Promise<void> {
  const { residentName, residentEmail, complaintId, category, oldStatus, newStatus, note } = params;
  const subject = `[Society Maintenance] Your complaint status updated: ${newStatus}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px;">
      <h2 style="color:#2563eb;">Society Maintenance Tracker</h2>
      <p>Hi <strong>${residentName}</strong>,</p>
      <p>Your complaint <strong>#${complaintId.slice(-8).toUpperCase()}</strong> (Category: <strong>${category}</strong>) has been updated.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:8px;background:#e5e7eb;font-weight:bold;">Previous Status</td>
          <td style="padding:8px;">${oldStatus ?? 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding:8px;background:#e5e7eb;font-weight:bold;">New Status</td>
          <td style="padding:8px;color:#16a34a;font-weight:bold;">${newStatus}</td>
        </tr>
        ${note ? `<tr><td style="padding:8px;background:#e5e7eb;font-weight:bold;">Note</td><td style="padding:8px;">${note}</td></tr>` : ''}
      </table>
      <p style="color:#6b7280;font-size:14px;">Log in to the Society Maintenance Tracker portal to view full details.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Society Maintenance" <${process.env.SMTP_USER}>`,
      to: residentEmail,
      subject,
      html,
    });
    console.log(`[mail] Status change email sent to ${residentEmail}`);
  } catch (err) {
    console.error(`[mail] Failed to send status change email to ${residentEmail}:`, err);
  }
}

export async function sendImportantNoticeEmail(
  recipients: { name: string; email: string }[],
  noticeTitle: string,
  noticeBody: string
): Promise<void> {
  if (!recipients.length) return;

  const subject = `[Society Notice] ${noticeTitle}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px;">
      <h2 style="color:#dc2626;">⚠️ Important Society Notice</h2>
      <h3 style="color:#1e293b;">${noticeTitle}</h3>
      <p style="white-space:pre-wrap;">${noticeBody}</p>
      <p style="color:#6b7280;font-size:14px;margin-top:24px;">This notice was posted by the Society Administration.</p>
    </div>
  `;

  for (const recipient of recipients) {
    try {
      await transporter.sendMail({
        from: `"Society Maintenance" <${process.env.SMTP_USER}>`,
        to: recipient.email,
        subject,
        html,
      });
      console.log(`[mail] Notice email sent to ${recipient.email}`);
    } catch (err) {
      console.error(`[mail] Failed to send notice email to ${recipient.email}:`, err);
    }
  }
}

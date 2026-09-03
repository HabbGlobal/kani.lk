import "server-only";
import nodemailer from "nodemailer";

/**
 * SMTP transport. Credentials come from env only. The transport is verified
 * lazily on first use and the result cached, so a broken mailbox is reported
 * clearly in the log rather than failing silently on every enquiry.
 */
let transporter: nodemailer.Transporter | null = null;
let verified: Promise<boolean> | null = null;

function getTransport() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  // Google displays app passwords in groups of four; the spaces are for reading
  // and must not be sent, so strip whitespace whatever the admin pasted in.
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured — set SMTP_HOST, SMTP_USER and SMTP_PASS");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function verifyTransport(): Promise<boolean> {
  if (!verified) {
    verified = getTransport()
      .verify()
      .then(() => {
        console.info("[mail] SMTP transport verified");
        return true;
      })
      .catch((err) => {
        console.error("[mail] SMTP verification FAILED:", err?.message ?? err);
        return false;
      });
  }
  return verified;
}

const GREEN = "#12452F";
const GOLD = "#BE9B4E";
const BONE = "#F6F5F1";

/** kani.lk-branded HTML shell. Tables, because email clients are from 2003. */
function wrap(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${BONE};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BONE};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;
                    font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
        <tr>
          <td style="background:${GREEN};padding:22px 28px;">
            <span style="font-family:Georgia,serif;font-size:24px;font-weight:600;color:#ffffff;">
              kani<span style="color:${GOLD};">.lk</span>
            </span>
            <div style="margin-top:4px;font-size:11px;letter-spacing:2px;color:rgba(255,255,255,0.65);text-transform:uppercase;">
              Find. Invest. Own.
            </div>
          </td>
        </tr>
        <tr><td style="padding:28px;color:#16201B;font-size:15px;line-height:1.6;">
          ${bodyHtml}
        </td></tr>
        <tr>
          <td style="background:#0A2C1E;padding:18px 28px;color:rgba(255,255,255,0.6);font-size:12px;">
            kani.lk — land and property in the Northern and Eastern provinces of Sri Lanka.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#5F6B63;font-size:13px;width:130px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;color:#16201B;font-size:15px;">${escapeHtml(value)}</td>
  </tr>`;
}

export type InquiryMailData = {
  name: string;
  phone: string;
  email?: string;
  message: string;
  landTitle?: string;
  landRefCode?: string;
  landUrl?: string;
  source: "listing" | "contact";
};

/** 1. To the admin, with Reply-To set to the enquirer so reply just works. */
export async function sendAdminNotification(data: InquiryMailData) {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) throw new Error("ADMIN_NOTIFY_EMAIL is not set");

  const subject = data.landRefCode
    ? `New enquiry — ${data.landRefCode} — ${data.name}`
    : `New contact message — ${data.name}`;

  const html = wrap(
    subject,
    `<h1 style="margin:0 0 4px;font-family:Georgia,serif;font-size:22px;color:${GREEN};">
       ${data.source === "listing" ? "New listing enquiry" : "New contact message"}
     </h1>
     <p style="margin:0 0 20px;color:#5F6B63;font-size:14px;">
       Reply to this email to answer ${escapeHtml(data.name)} directly.
     </p>
     <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
       ${data.landTitle ? row("Listing", data.landTitle) : ""}
       ${data.landRefCode ? row("Reference", data.landRefCode) : ""}
       ${row("Name", data.name)}
       ${row("Phone", data.phone)}
       ${data.email ? row("Email", data.email) : ""}
     </table>
     <div style="margin:20px 0;padding:16px;background:${BONE};border-radius:10px;
                 border-left:3px solid ${GOLD};white-space:pre-wrap;">${escapeHtml(data.message)}</div>
     ${
       data.landUrl
         ? `<p style="margin:20px 0 0;">
              <a href="${data.landUrl}" style="display:inline-block;background:${GREEN};color:#fff;
                 text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px;">
                Open the listing</a></p>`
         : ""
     }`
  );

  const text = [
    data.source === "listing" ? "New listing enquiry" : "New contact message",
    data.landTitle ? `Listing: ${data.landTitle}` : "",
    data.landRefCode ? `Reference: ${data.landRefCode}` : "",
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    data.email ? `Email: ${data.email}` : "",
    "",
    data.message,
    data.landUrl ? `\n${data.landUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return getTransport().sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
    replyTo: data.email ? `${data.name} <${data.email}>` : undefined,
  });
}

/** 2. To the enquirer — this is what makes the site feel trustworthy. */
export async function sendInquiryAcknowledgement(data: InquiryMailData) {
  if (!data.email) return null;

  const subject = data.landRefCode
    ? `We received your enquiry — ${data.landRefCode}`
    : "We received your message — kani.lk";

  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "";

  const html = wrap(
    subject,
    `<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:22px;color:${GREEN};">
       Thank you, ${escapeHtml(data.name.split(" ")[0])}
     </h1>
     <p style="margin:0 0 16px;">
       We have passed your message to the owner. They will usually call you back
       within a day, on <strong>${escapeHtml(data.phone)}</strong>.
     </p>
     ${
       data.landTitle
         ? `<div style="margin:0 0 16px;padding:16px;background:${BONE};border-radius:10px;">
              <div style="color:#5F6B63;font-size:13px;">Your enquiry was about</div>
              <div style="font-family:Georgia,serif;font-size:17px;color:${GREEN};margin-top:2px;">
                ${escapeHtml(data.landTitle)}</div>
              ${data.landRefCode ? `<div style="color:#5F6B63;font-size:13px;margin-top:4px;">${escapeHtml(data.landRefCode)}</div>` : ""}
            </div>`
         : ""
     }
     <div style="margin:0 0 16px;padding:14px;border:1px solid #DCDAD0;border-radius:10px;">
       <strong style="color:${GREEN};">Before you pay any money</strong>
       <p style="margin:6px 0 0;color:#5F6B63;font-size:14px;">
         Always verify the deed and survey plan with a lawyer, and visit the block
         in person to walk the boundary and check the access road.
       </p>
     </div>
     ${phone ? `<p style="margin:0;">Any questions, call us on <strong>${escapeHtml(phone)}</strong>.</p>` : ""}`
  );

  return getTransport().sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to: data.email,
    subject,
    html,
    text:
      `Thank you, ${data.name}.\n\n` +
      `We have passed your message to the owner. They will usually call you back within a day on ${data.phone}.\n\n` +
      (data.landTitle ? `Your enquiry was about: ${data.landTitle}\n\n` : "") +
      `Before you pay any money, always verify the deed and survey plan with a lawyer.\n\n— kani.lk`,
  });
}

/** 4. Admin password reset — single-use token, 30 minute expiry. */
export async function sendPasswordReset(to: string, name: string, resetUrl: string) {
  const html = wrap(
    "Reset your kani.lk password",
    `<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:22px;color:${GREEN};">
       Reset your password
     </h1>
     <p style="margin:0 0 16px;">
       Hello ${escapeHtml(name)}, someone asked to reset the password for your
       kani.lk admin account. This link works once and expires in 30 minutes.
     </p>
     <p style="margin:0 0 16px;">
       <a href="${resetUrl}" style="display:inline-block;background:${GREEN};color:#fff;
          text-decoration:none;padding:13px 26px;border-radius:999px;font-size:15px;">
          Set a new password</a>
     </p>
     <p style="margin:0;color:#5F6B63;font-size:14px;">
       If you did not ask for this, ignore this email — your password will not change.
     </p>`
  );

  return getTransport().sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to,
    subject: "Reset your kani.lk password",
    html,
    text: `Reset your kani.lk password.\n\nThis link works once and expires in 30 minutes:\n${resetUrl}\n\nIf you did not ask for this, ignore this email.`,
  });
}

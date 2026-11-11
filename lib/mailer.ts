import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// Cached transporter — reusing the connection avoids a fresh TLS handshake
// on every reset request, which shaves seconds off delivery start.
let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  if (!transporter) {
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      // Keep the connection alive briefly for pooled reuse
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });
  }
  return transporter;
}

// Sends mail via SMTP_* env vars. Returns false when SMTP is not configured
// or the send fails — callers must not claim delivery on false.
export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  const t = getTransporter();
  const user = process.env.SMTP_USER;
  if (!t || !user) return false;

  try {
    const info = await t.sendMail({
      from: process.env.SMTP_FROM || user,
      to,
      subject,
      text,
    });
    // info.accepted/rejected show whether the SMTP server took the message;
    // never log credentials, codes or message bodies
    console.log("mail sent:", { accepted: info.accepted?.length ?? 0, rejected: info.rejected?.length ?? 0, response: info.response });
    return true;
  } catch (error) {
    // Reset the cached transporter so a broken connection isn't reused
    transporter = null;
    const err = error as NodeJS.ErrnoException;
    console.error("mail send failed:", err?.code, err?.message);
    return false;
  }
}

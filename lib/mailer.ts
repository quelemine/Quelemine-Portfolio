import nodemailer from "nodemailer";

// Sends mail via SMTP_* env vars. Returns false when SMTP is not configured.
export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return false;

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    const info = await transporter.sendMail({
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
    const err = error as NodeJS.ErrnoException;
    console.error("mail send failed:", err?.code, err?.message);
    return false;
  }
}

import nodemailer from "nodemailer";
import {
  prepareEmails,
  readMailConfig,
  type MailConfig,
  type MailEnv,
  type MailResult,
  type PreparedEmail,
} from "./email-templates";

/**
 * Full send_email.php flow: read config, validate payload,
 * send the admin notification, then the client thank-you email.
 *
 * - BREVO_API_KEY set -> Brevo HTTPS API. Required on Cloudflare Pages, because
 *   Cloudflare's servers can't reach SMTP servers (Gmail/Hostinger/Brevo SMTP all fail there).
 * - otherwise        -> Nodemailer over SMTP (fine for local `npm run dev`).
 */
export async function handleMailRequest(rawBody: string, env: MailEnv): Promise<MailResult> {
  const config = readMailConfig(env);
  if ("status" in config) return config;

  let data: unknown;
  try {
    data = JSON.parse(rawBody);
  } catch {
    data = null;
  }

  const emails = prepareEmails(data, config);
  if (!Array.isArray(emails)) return emails;

  try {
    if (config.provider === "brevo") {
      for (const email of emails) await sendWithBrevo(config, email);
    } else {
      await sendWithSmtp(config, emails);
    }
    return { status: 200, body: { success: true, message: "Emails sent successfully" } };
  } catch (error) {
    const info = error instanceof Error ? error.message : String(error);
    console.error("Mailer Error:", info);
    return { status: 500, body: { success: false, message: `Mailer Error: ${info}` } };
  }
}

/** https://developers.brevo.com/reference/sendtransacemail */
async function sendWithBrevo(config: MailConfig, email: PreparedEmail): Promise<void> {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": config.brevoApiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: config.fromName, email: config.fromEmail },
      to: [{ email: email.to.address, ...(email.to.name ? { name: email.to.name } : {}) }],
      ...(email.replyTo ? { replyTo: { email: email.replyTo.address, name: email.replyTo.name } } : {}),
      subject: email.subject,
      htmlContent: email.html,
    }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
    throw new Error(`Brevo ${res.status}${body.code ? ` ${body.code}` : ""}: ${body.message || res.statusText}`);
  }
}

async function sendWithSmtp(config: MailConfig, emails: PreparedEmail[]): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // true = SMTPS (465), false = STARTTLS (587)
    requireTLS: !config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 20_000, // PHPMailer Timeout = 20
    greetingTimeout: 20_000,
    socketTimeout: 20_000,
  });

  try {
    for (const email of emails) {
      await transporter.sendMail({
        from: { name: config.fromName, address: config.fromEmail },
        to: email.to,
        replyTo: email.replyTo,
        subject: email.subject,
        html: email.html,
        encoding: "utf-8",
      });
    }
  } finally {
    transporter.close();
  }
}

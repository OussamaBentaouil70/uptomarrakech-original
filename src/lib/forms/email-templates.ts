/**
 * Email logic shared by the Cloudflare Pages Function (functions/api/send-email.ts)
 * and the local Next.js route (src/app/api/send-email/route.ts).
 *
 * This is a 1:1 port of phpmailer/send_email.php: same validation, same
 * escaping, same templates, same subjects, same JSON responses.
 * It has no Node.js dependencies so it can run on Cloudflare Workers.
 */

export type MailEnv = {
  /** When set, emails are sent with the Brevo HTTPS API (required on Cloudflare). Otherwise SMTP/Nodemailer. */
  BREVO_API_KEY?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_SECURE?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  ADMIN_EMAIL?: string;
  FROM_EMAIL?: string;
  FROM_NAME?: string;
  LOGO_URL?: string;
  SITE_URL?: string;
  ALLOWED_ORIGIN?: string;
};

export type MailConfig = {
  provider: "brevo" | "smtp";
  brevoApiKey: string;
  host: string;
  port: number;
  /** true = implicit TLS (PHPMailer ENCRYPTION_SMTPS, port 465); false = STARTTLS (port 587) */
  secure: boolean;
  user: string;
  pass: string;
  adminEmail: string;
  fromEmail: string;
  fromName: string;
  logoUrl: string;
  siteUrl: string;
};

export type PreparedEmail = {
  to: { name?: string; address: string };
  replyTo?: { name: string; address: string };
  subject: string;
  html: string;
};

export type MailResult = { status: number; body: { success: boolean; message: string } };

/** PHP envValue(): empty string counts as "not set". */
function envValue(env: MailEnv, key: keyof MailEnv, fallback: string): string {
  const value = env[key];
  return value === undefined || value === null || value === "" ? fallback : String(value);
}

/** PHP: htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8') */
export function cleanText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** PHP nl2br() */
function nl2br(value: string): string {
  return value.replace(/(\r\n|\n\r|\n|\r)/g, "<br />$1");
}

/** Close equivalent of PHP filter_var($email, FILTER_VALIDATE_EMAIL). */
function validateEmail(value: string): string {
  const re = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
  return value.length <= 254 && re.test(value) && !value.includes("..") ? value : "";
}

export function corsHeaders(env: MailEnv): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": envValue(env, "ALLOWED_ORIGIN", "*"),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  };
}

export function readMailConfig(env: MailEnv): MailConfig | MailResult {
  const brevoApiKey = envValue(env, "BREVO_API_KEY", "").trim();
  const provider = brevoApiKey ? "brevo" : "smtp";
  const user = envValue(env, "SMTP_USER", "");
  const pass = envValue(env, "SMTP_PASS", "");
  const adminEmail = envValue(env, "ADMIN_EMAIL", user);
  const fromEmail = envValue(env, "FROM_EMAIL", user);

  const missingCredentials = provider === "smtp" && (user === "" || pass === "");
  if (missingCredentials || adminEmail === "" || fromEmail === "") {
    return { status: 500, body: { success: false, message: "Server mail configuration is incomplete" } };
  }

  const secureMode = envValue(env, "SMTP_SECURE", "ssl").toLowerCase();

  return {
    provider,
    brevoApiKey,
    host: envValue(env, "SMTP_HOST", "smtp.gmail.com"),
    port: Number.parseInt(envValue(env, "SMTP_PORT", "465"), 10) || 465,
    // PHP: 'tls' => STARTTLS, anything else => SMTPS (implicit TLS)
    secure: secureMode !== "tls",
    user,
    pass,
    adminEmail,
    fromEmail,
    fromName: envValue(env, "FROM_NAME", "Up To Marrakech"),
    logoUrl: envValue(env, "LOGO_URL", "https://uptomarrakech.com/assets/brand/uptomarrakech-logo.png"),
    siteUrl: envValue(env, "SITE_URL", "https://uptomarrakech.com"),
  };
}

/**
 * Validates the JSON payload and builds both emails exactly like send_email.php.
 * Returns an error result (400/422) or the two emails to send (admin first, then client).
 */
export function prepareEmails(data: unknown, config: MailConfig): MailResult | PreparedEmail[] {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { status: 400, body: { success: false, message: "Invalid JSON payload" } };
  }
  const d = data as Record<string, unknown>;

  const formType = cleanText(d.formType ?? "contact");
  const name = cleanText(d.contact_name ?? "");
  const rawName = String(d.contact_name ?? "").trim();
  const email = validateEmail(String(d.contact_email ?? "").trim());
  const phone = cleanText(d.contact_phone ?? "");
  const service = cleanText(d.service_type ?? "General inquiry");
  const preferredDate = cleanText(d.preferred_date ?? "");
  const preferredTime = cleanText(d.preferred_time ?? "");
  const itemSlug = cleanText(d.item_slug ?? "");
  const categoryType = cleanText(d.category_type ?? "");
  const message = nl2br(cleanText(d.message ?? ""));

  // Extra fields sent by the inquiry / hot-air-balloon forms (not in the PHP version).
  // Shown only when present, so contact emails look exactly like before.
  const persons = cleanText(d.number_of_persons ?? "");
  const flightType = cleanText(d.flight_type ?? "");
  const stayLocation = cleanText(d.stay_location ?? "");

  if (name === "" || email === "" || message === "") {
    return { status: 422, body: { success: false, message: "Name, valid email and message are required" } };
  }

  const { logoUrl, siteUrl } = config;
  const primaryColor = "#C39A5A";
  const textColor = "#1F1B16";
  const bgColor = "#F8F2E8";

  const styles = `
<style>
  body { font-family: Arial, Helvetica, sans-serif; background: ${bgColor}; margin:0; padding:0; color: ${textColor}; }
  .container { max-width: 640px; margin: 24px auto; background: #fff; border: 1px solid rgba(195,154,90,.2); border-radius: 18px; padding: 30px; }
  .logo { max-width: 180px; height: auto; display:block; margin: 0 auto 22px; }
  .title { font-size: 24px; text-align:center; margin: 0 0 20px; color: ${textColor}; }
  .label { font-size: 11px; letter-spacing: 1.7px; text-transform: uppercase; color: ${primaryColor}; margin-top: 16px; }
  .value { font-size: 16px; line-height: 1.6; margin-top: 6px; }
  .divider { height: 1px; background: linear-gradient(to right, transparent, ${primaryColor}, transparent); margin: 20px 0; }
  .footer { font-size: 12px; text-align:center; color: #8A7B67; margin-top: 24px; }
</style>
`;

  const optionalRow = (label: string, value: string) =>
    value ? `
    <div class='label'>${label}</div>
    <div class='value'>${value}</div>
` : "";

  const adminBody = `
<!DOCTYPE html><html><head>${styles}</head><body>
  <div class='container'>
    <img class='logo' src='${logoUrl}' alt='Up To Marrakech logo'>
    <h1 class='title'>New ${formType} Submission</h1>

    <div class='label'>Name</div>
    <div class='value'>${name}</div>

    <div class='label'>Email</div>
    <div class='value'>${email}</div>

    <div class='label'>Phone</div>
    <div class='value'>${phone}</div>

    <div class='label'>Service</div>
    <div class='value'>${service}</div>

    <div class='label'>Preferred date / time</div>
    <div class='value'>${preferredDate} ${preferredTime}</div>
${optionalRow("Number of persons", persons)}${optionalRow("Flight type", flightType)}${optionalRow("Stay location", stayLocation)}
    <div class='label'>Item slug / category</div>
    <div class='value'>${itemSlug} ${categoryType}</div>

    <div class='divider'></div>

    <div class='label'>Message</div>
    <div class='value'>${message}</div>

    <div class='footer'>Internal notification - Up To Marrakech</div>
  </div>
</body></html>
`;

  const clientBody = `
<!DOCTYPE html><html><head>${styles}</head><body>
  <div class='container'>
    <img class='logo' src='${logoUrl}' alt='Up To Marrakech logo'>
    <h1 class='title'>Thank You ${name}</h1>
    <div class='value' style='text-align:center;'>
      We received your request and our team will get back to you shortly.<br>
      We are excited to help you create your Marrakech experience.
    </div>
    <div class='divider'></div>
    <div class='footer'>
      <a href='${siteUrl}' style='color:#8A7B67; text-decoration:none;'>${siteUrl}</a>
    </div>
  </div>
</body></html>
`;

  return [
    {
      to: { address: config.adminEmail },
      replyTo: { name: rawName, address: email },
      // Subject is plain text (not HTML), so use the unescaped values here.
      subject: `Up To Marrakech ${String(d.formType ?? "contact").trim()}: ${rawName}`,
      html: adminBody,
    },
    {
      to: { name: rawName, address: email },
      subject: "Thank you - Up To Marrakech",
      html: clientBody,
    },
  ];
}

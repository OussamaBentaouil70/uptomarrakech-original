/**
 * Server-side Cloudflare Turnstile check (runs in the Pages Function / local Next route only).
 * The secret key comes from the TURNSTILE_SECRET_KEY environment variable and is never sent to the browser.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult = { ok: true } | { ok: false; reason: string };

export async function verifyTurnstile(token: unknown, secret: string, remoteIp?: string | null): Promise<TurnstileResult> {
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return { ok: false, reason: "missing-input-response" };
  }
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (remoteIp) form.append("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body: form });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    return data.success ? { ok: true } : { ok: false, reason: (data["error-codes"] ?? ["verification-failed"]).join(",") };
  } catch {
    // Siteverify unreachable: refuse rather than let unverified submissions through.
    return { ok: false, reason: "siteverify-unreachable" };
  }
}

/** JSON body returned to the browser when the check fails (status 403). */
export const TURNSTILE_FAILED_BODY = {
  success: false,
  code: "turnstile_failed",
  message: "Anti-bot verification failed. Please try again.",
};

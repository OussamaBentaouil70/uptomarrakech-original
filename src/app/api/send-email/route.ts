// Local development only (`npm run dev`).
// In production (static export on Cloudflare Pages) this route is not used:
// functions/api/send-email.ts serves /api/send-email with the same shared logic (incl. Turnstile).
import { corsHeaders, type MailEnv } from "@/lib/forms/email-templates";
import { handleMailRequest } from "@/lib/forms/send-mail";
import { TURNSTILE_FAILED_BODY, verifyTurnstile } from "@/lib/forms/turnstile-verify";

const env = process.env as MailEnv & { TURNSTILE_SECRET_KEY?: string };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders(env) });
}

export async function POST(request: Request) {
  const raw = await request.text();
  const secret = env.TURNSTILE_SECRET_KEY?.trim();
  if (secret) {
    let token: unknown;
    try {
      token = (JSON.parse(raw) as { turnstileToken?: unknown }).turnstileToken;
    } catch {
      token = undefined;
    }
    const check = await verifyTurnstile(token, secret, request.headers.get("x-forwarded-for"));
    if (!check.ok) return new Response(JSON.stringify(TURNSTILE_FAILED_BODY), { status: 403, headers: corsHeaders(env) });
  }
  const result = await handleMailRequest(raw, env);
  return new Response(JSON.stringify(result.body), { status: result.status, headers: corsHeaders(env) });
}

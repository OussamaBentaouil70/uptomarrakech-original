/**
 * Cloudflare Pages Function -> https://uptomarrakech.com/api/send-email
 * Sends the form emails (Brevo API in production, see src/lib/forms/send-mail.ts).
 *
 * Every submission must carry a valid Cloudflare Turnstile token, verified here against
 * Cloudflare's siteverify endpoint before anything is sent (TURNSTILE_SECRET_KEY, server-side only).
 * Requires the `nodejs_compat` compatibility flag (Pages > Settings > Runtime).
 */
import { corsHeaders, type MailEnv } from "../../src/lib/forms/email-templates";
import { handleMailRequest } from "../../src/lib/forms/send-mail";
import { TURNSTILE_FAILED_BODY, verifyTurnstile } from "../../src/lib/forms/turnstile-verify";

type Env = MailEnv & { TURNSTILE_SECRET_KEY?: string };
type Context = { request: Request; env: Env };

export async function onRequestOptions({ env }: Context): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(env) });
}

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  const raw = await request.text();

  const secret = env.TURNSTILE_SECRET_KEY?.trim();
  if (secret) {
    let token: unknown;
    try {
      token = (JSON.parse(raw) as { turnstileToken?: unknown }).turnstileToken;
    } catch {
      token = undefined;
    }
    const check = await verifyTurnstile(token, secret, request.headers.get("CF-Connecting-IP"));
    if (!check.ok) {
      console.warn("Turnstile rejected:", check.reason);
      return new Response(JSON.stringify(TURNSTILE_FAILED_BODY), { status: 403, headers: corsHeaders(env) });
    }
  } else {
    console.warn("TURNSTILE_SECRET_KEY is not set: form submissions are not bot-checked.");
  }

  const result = await handleMailRequest(raw, env);
  return new Response(JSON.stringify(result.body), { status: result.status, headers: corsHeaders(env) });
}

export async function onRequest({ env }: Context): Promise<Response> {
  return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
    status: 405,
    headers: corsHeaders(env),
  });
}

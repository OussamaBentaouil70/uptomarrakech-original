/**
 * Cloudflare Pages Function -> https://<your-domain>/api/send-email
 * Replaces phpmailer/send_email.php on Cloudflare Pages (PHP can't run there).
 * Requires the `nodejs_compat` compatibility flag (Pages > Settings > Runtime) so Nodemailer can open SMTP sockets.
 * SMTP settings come from the Pages project's environment variables / secrets.
 */
import { corsHeaders, type MailEnv } from "../../src/lib/forms/email-templates";
import { handleMailRequest } from "../../src/lib/forms/send-mail";

type Context = { request: Request; env: MailEnv };

export async function onRequestOptions({ env }: Context): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(env) });
}

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  const result = await handleMailRequest(await request.text(), env);
  return new Response(JSON.stringify(result.body), { status: result.status, headers: corsHeaders(env) });
}

export async function onRequest({ env }: Context): Promise<Response> {
  return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
    status: 405,
    headers: corsHeaders(env),
  });
}

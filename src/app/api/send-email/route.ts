// Local development only (`npm run dev`).
// In production (static export on Cloudflare Pages) this route is not used:
// functions/api/send-email.ts serves /api/send-email with the same shared logic.
import { corsHeaders, type MailEnv } from "@/lib/forms/email-templates";
import { handleMailRequest } from "@/lib/forms/send-mail";

const env = process.env as MailEnv;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders(env) });
}

export async function POST(request: Request) {
  const result = await handleMailRequest(await request.text(), env);
  return new Response(JSON.stringify(result.body), { status: result.status, headers: corsHeaders(env) });
}

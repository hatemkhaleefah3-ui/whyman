import app from './index';

type Env = {
  DB: D1Database;
  FILES: R2Bucket;
  APP_ORIGIN: string;
  RESEND_API_KEY: string;
  RESEND_FROM: string;
};

function allowedOrigin(origin: string | null, env: Env): string | null {
  if (!origin) return null;
  if (origin === env.APP_ORIGIN) return origin;
  try {
    const url = new URL(origin);
    if (url.protocol === 'https:' && (url.hostname === 'whyman.pages.dev' || url.hostname.endsWith('.whyman.pages.dev'))) return origin;
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return origin;
  } catch {
    return null;
  }
  return null;
}

function corsHeaders(request: Request, env: Env): Headers {
  const headers = new Headers();
  const origin = allowedOrigin(request.headers.get('origin'), env);
  if (origin) headers.set('access-control-allow-origin', origin);
  headers.set('access-control-allow-methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  headers.set('access-control-allow-headers', 'Content-Type,Authorization,X-File-Name');
  headers.set('access-control-expose-headers', 'ETag');
  headers.set('access-control-max-age', '86400');
  headers.set('vary', 'Origin');
  return headers;
}

function json(data: unknown, status: number, env: Env, request: Request): Response {
  const headers = corsHeaders(request, env);
  headers.set('content-type', 'application/json');
  return new Response(JSON.stringify(data), {status, headers});
}

function sixDigitCode(): string {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(values[0] % 1_000_000).padStart(6, '0');
}

async function sha256(value: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

function verificationEmail(code: string): string {
  return `<!doctype html><html><body style="margin:0;background:#F0F2F5;font-family:Inter,Arial,sans-serif"><table width="100%"><tr><td align="center" style="padding:32px"><table width="600" style="max-width:100%;background:#fff;border-radius:18px;overflow:hidden"><tr><td style="padding:22px 28px;background:#0056D2;color:#fff;font-weight:800;font-size:20px">W · Whyman</td></tr><tr><td style="padding:34px 28px"><div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#0056D2">EMAIL VERIFICATION</div><h1 style="margin:10px 0 14px;color:#1C1E21;font-size:28px">Verify your email</h1><p style="color:#65676B;line-height:1.7">Enter this code in Whyman. It expires in 10 minutes.</p><div style="margin:24px 0;padding:20px;border-radius:14px;background:#E8F0FE;text-align:center;font-family:monospace;font-size:32px;font-weight:800;letter-spacing:10px;color:#0056D2">${code}</div><p style="color:#9EA3AA;font-size:13px">If you did not request this code, you can ignore this email.</p></td></tr><tr><td style="padding:18px 28px;background:#F8F9FB;color:#9EA3AA;font-size:12px">Whyman Learning Network · Security notification</td></tr></table></td></tr></table></body></html>`;
}

async function sendVerification(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{channel?: string; destination?: string}>();
  if (body.channel !== 'email' || !body.destination || !/^\S+@\S+\.\S+$/.test(body.destination)) {
    return json({error: 'Enter a valid email address'}, 400, env, request);
  }
  if (!env.RESEND_API_KEY) return json({error: 'Email service is not configured in the Worker'}, 503, env, request);

  const code = sixDigitCode();
  const id = crypto.randomUUID();
  await env.DB.prepare("DELETE FROM verification_codes WHERE channel='email' AND destination=? AND verified_at IS NULL").bind(body.destination).run();
  await env.DB.prepare("INSERT INTO verification_codes(id,channel,destination,code_hash,expires_at) VALUES(?,'email',?,?,datetime('now','+10 minutes'))")
    .bind(id, body.destination, await sha256(code)).run();

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Whyman-Worker/1.0',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM || 'Whyman <onboarding@resend.dev>',
      to: [body.destination],
      subject: `${code} is your Whyman verification code`,
      html: verificationEmail(code),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    await env.DB.prepare('DELETE FROM verification_codes WHERE id=?').bind(id).run();
    console.error(JSON.stringify({level: 'error', event: 'resend.send_failed', status: response.status, details}));
    let message = 'Email could not be sent.';
    if (response.status === 401 || response.status === 403) message = 'The Resend API key or sender is not authorized.';
    if (response.status === 422) message = 'Resend rejected the recipient or sender. Use your Resend account email until a domain is verified.';
    return json({error: message}, 502, env, request);
  }
  return json({sent: true, expiresInMinutes: 10}, 200, env, request);
}

async function prepareEmailOnlySignup(request: Request, env: Env): Promise<Request> {
  const body = await request.json<Record<string, unknown>>();
  const phone = typeof body.phone === 'string' ? body.phone : '';
  if (phone) {
    await env.DB.prepare("INSERT INTO verification_codes(id,channel,destination,code_hash,expires_at,verified_at) VALUES(?,'phone',?,'not-required',datetime('now','+1 day'),CURRENT_TIMESTAMP)")
      .bind(crypto.randomUUID(), phone).run();
  }
  return new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: JSON.stringify(body),
  });
}

function withCors(response: Response, request: Request, env: Env): Response {
  const headers = new Headers(response.headers);
  const gatewayHeaders = corsHeaders(request, env);
  gatewayHeaders.forEach((value, key) => headers.set(key, value));
  return new Response(response.body, {status: response.status, statusText: response.statusText, headers});
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get('origin');
    if (origin && !allowedOrigin(origin, env)) return json({error: 'Origin not allowed'}, 403, env, request);
    if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers: corsHeaders(request, env)});

    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/api/verification/send') {
      return sendVerification(request, env);
    }
    let forwarded = request;
    if (request.method === 'POST' && url.pathname === '/api/signup-requests') {
      forwarded = await prepareEmailOnlySignup(request, env);
    }
    const response = await app.fetch(forwarded, env, ctx);
    return withCors(response, request, env);
  },
};

type BootstrapEnv = {
  DB: D1Database;
  RESEND_API_KEY: string;
  RESEND_FROM: string;
  ADMIN_BOOTSTRAP_EMAIL: string;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {'content-type': 'application/json'},
  });
}

function randomDigits(length: number): string {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(values[0] % 10 ** length).padStart(length, '0');
}

async function sha256(value: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

function credentialsEmail(name: string, adminId: string, passkey: string): string {
  return `<!doctype html><html><body style="margin:0;background:#F0F2F5;font-family:Inter,Arial,sans-serif"><table width="100%"><tr><td align="center" style="padding:32px"><table width="600" style="max-width:100%;background:#fff;border-radius:18px;overflow:hidden"><tr><td style="padding:22px 28px;background:#0056D2;color:#fff;font-weight:800;font-size:20px">W · Whyman</td></tr><tr><td style="padding:34px 28px"><div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#0056D2">ADMIN ACCOUNT</div><h1 style="margin:10px 0 14px;color:#1C1E21;font-size:28px">Your Admin account is ready</h1><p style="color:#65676B;line-height:1.7">Welcome ${name || 'Administrator'}. Use these credentials to sign in.</p><div style="margin:24px 0;padding:20px;border-radius:14px;background:#E8F0FE;font-family:monospace;color:#0056D2"><strong>Admin ID</strong><br><span style="font-size:20px">${adminId}</span><br><br><strong>Passkey</strong><br><span style="font-size:30px;letter-spacing:10px">${passkey}</span></div><p style="color:#9EA3AA;font-size:13px">Keep this passkey private.</p></td></tr><tr><td style="padding:18px 28px;background:#F8F9FB;color:#9EA3AA;font-size:12px">Whyman Learning Network · Administrator access</td></tr></table></td></tr></table></body></html>`;
}

async function sendCredentials(env: BootstrapEnv, email: string, name: string, adminId: string, passkey: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM || 'Whyman <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Whyman Admin account',
      html: credentialsEmail(name, adminId, passkey),
    }),
  });
  return response.ok;
}

export async function tryBootstrapAdmin(request: Request, env: BootstrapEnv): Promise<Response | null> {
  const body = await request.json<Record<string, unknown>>();
  const email = String(body.email || '').trim().toLowerCase();
  const configuredEmail = String(env.ADMIN_BOOTSTRAP_EMAIL || '').trim().toLowerCase();
  if (!configuredEmail || email !== configuredEmail) return null;

  const existingAdmin = await env.DB.prepare("SELECT id FROM users WHERE role='Admin' LIMIT 1").first<{id: string}>();
  if (existingAdmin) return null;

  const verified = await env.DB.prepare("SELECT id FROM verification_codes WHERE channel='email' AND destination=? AND verified_at IS NOT NULL ORDER BY created_at DESC LIMIT 1")
    .bind(email).first<{id: string}>();
  if (!verified) return json({error: 'Verify the administrator email first'}, 400);

  const name = String(body.name || 'Whyman Administrator').trim();
  const phone = String(body.phone || '').trim();
  const photoKey = String(body.photoKey || '').trim();
  const adminId = `ADM-${new Date().getUTCFullYear()}-${randomDigits(5)}`;
  const passkey = randomDigits(6);
  const userId = crypto.randomUUID();

  const emailSent = await sendCredentials(env, email, name, adminId, passkey);
  if (!emailSent) return json({error: 'Could not send Admin credentials email'}, 502);

  await env.DB.prepare(`INSERT INTO users(id,student_id,name,role,institution,stage,status,active_course_id,email,phone,photo_key,passkey_hash,representative_active)
    VALUES(?,?,?,'Admin',NULL,NULL,'Active',NULL,?,?,?,?,0)`)
    .bind(userId, adminId, name, email, phone || null, photoKey || null, await sha256(passkey)).run();

  await env.DB.prepare('INSERT INTO audit_logs(actor_id,action,target_id,metadata) VALUES(?,?,?,?)')
    .bind(userId, 'admin.bootstrap', userId, JSON.stringify({email})).run();

  return json({status: 'Active', adminBootstrap: true, studentId: adminId}, 201);
}

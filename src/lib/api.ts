export type ApiRole = 'Student' | 'Representative Student' | 'Teacher' | 'Manager' | 'Admin';
export type SignupStatus = 'Pending' | 'Active' | 'Rejected';

export interface SessionUser {
  id: string;
  student_id: string;
  name: string;
  role: ApiRole;
  institution: string | null;
  stage: string | null;
  status: string;
  active_course_id: string | null;
}

export interface CourseRecord {
  id: string;
  name: string;
  institution: string;
  stage: string;
  visibility: 'Public' | 'Institution';
  progress: number;
}

export interface SignupRequestRecord {
  id: string;
  name: string;
  role: ApiRole;
  institution: string | null;
  stage: string | null;
  email: string;
  phone: string;
  photo_key: string;
  status: SignupStatus;
  approval_tier: string;
  rejection_reason: string | null;
  student_id: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface SignupPayload {
  name: string;
  fatherName: string;
  grandfatherName: string;
  dateOfBirth: string;
  sex: string;
  role: Exclude<ApiRole, 'Admin'>;
  accountType: 'Free' | 'Institution';
  institution?: string;
  stage?: string;
  email: string;
  phone: string;
  photoKey: string;
}

const configuredBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');
const API_BASE = configuredBase ?? 'https://whyman.hatemkhaleefah3.workers.dev';
const TOKEN_KEY = 'whyman_session_token';

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message); this.name = 'ApiError'; this.status = status; this.details = details;
  }
}

function token(): string | null { return window.localStorage.getItem(TOKEN_KEY); }
function saveToken(value: string) { window.localStorage.setItem(TOKEN_KEY, value); }

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const sessionToken = token();
  if (sessionToken) headers.set('Authorization', `Bearer ${sessionToken}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_BASE}${path}`, {...init, headers});
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof body === 'object' && body && 'error' in body ? String((body as {error: unknown}).error) : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, body);
  }
  return body as T;
}

export const api = {
  baseUrl: API_BASE,
  hasSession: () => Boolean(token()),
  clearSession: () => window.localStorage.removeItem(TOKEN_KEY),
  health: () => request<{ok: boolean; service: string}>('/api/health'),
  signIn: async (studentId: string, passkey: string) => {
    const result = await request<{token: string; user: SessionUser}>('/api/auth/sign-in', {method: 'POST', body: JSON.stringify({studentId, passkey})});
    saveToken(result.token); return result.user;
  },
  signOut: async () => { try { await request('/api/auth/sign-out', {method: 'POST'}); } finally { api.clearSession(); } },
  me: () => request<{user: SessionUser; impersonating: boolean}>('/api/me'),
  returnToAdmin: async () => { const result = await request<{token: string}>('/api/admin/return', {method: 'POST'}); saveToken(result.token); return result; },
  impersonate: async (userId: string) => { const result = await request<{token: string}>(`/api/admin/impersonate/${encodeURIComponent(userId)}`, {method: 'POST'}); saveToken(result.token); return result; },
  sendVerificationCode: (channel: 'email' | 'phone', destination: string) => request<{sent: boolean; developmentCode?: string}>('/api/verification/send', {method: 'POST', body: JSON.stringify({channel, destination})}),
  verifyCode: (channel: 'email' | 'phone', destination: string, code: string) => request<{verified: boolean}>('/api/verification/verify', {method: 'POST', body: JSON.stringify({channel, destination, code})}),
  upload: async (file: File) => {
    const headers = new Headers({'Content-Type': file.type || 'application/octet-stream', 'X-File-Name': file.name});
    const sessionToken = token(); if (sessionToken) headers.set('Authorization', `Bearer ${sessionToken}`);
    const response = await fetch(`${API_BASE}/api/uploads`, {method: 'POST', headers, body: file});
    const data = await response.json() as {key?: string; error?: string};
    if (!response.ok || !data.key) throw new ApiError(data.error ?? 'Upload failed', response.status, data);
    return data.key;
  },
  createSignupRequest: (payload: SignupPayload) => request<{id: string; status: SignupStatus; approvalTier: string}>('/api/signup-requests', {method: 'POST', body: JSON.stringify(payload)}),
  signupRequests: () => request<SignupRequestRecord[]>('/api/admin/signup-requests'),
  representativeRequests: () => request<SignupRequestRecord[]>('/api/admin/signup-requests'),
  reviewSignupRequest: (id: string, decision: 'Accept' | 'Reject', reason?: string) => request<{status: string; studentId?: string; passkey?: string}>(`/api/admin/signup-requests/${encodeURIComponent(id)}`, {method: 'PATCH', body: JSON.stringify({decision, reason})}),
  institutions: () => request<{id: string; name: string; type: string}[]>('/api/institutions'),
  courses: (institution?: string) => request<CourseRecord[]>(`/api/courses${institution ? `?institution=${encodeURIComponent(institution)}` : ''}`),
  course: (id: string) => request<Record<string, unknown>>(`/api/courses/${encodeURIComponent(id)}`),
  subject: (id: string) => request<Record<string, unknown>>(`/api/subjects/${encodeURIComponent(id)}`),
  setActiveCourse: (courseId: string) => request<{activeCourseId: string}>('/api/me/active-course', {method: 'PATCH', body: JSON.stringify({courseId})}),
  users: () => request<SessionUser[]>('/api/admin/users'),
};

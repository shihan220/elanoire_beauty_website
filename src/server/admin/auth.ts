import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import type { AdminAuthMode } from '@/types/admin';

export const adminSessionCookieName = 'elanoire_admin_session';
const adminSessionDurationSeconds = 60 * 60 * 8;
// Local-only fallback credentials for the temporary admin gate.
// Replace this with real role-based authentication before production rollout.
const fallbackAdminCredentials = {
  email: 'admin@elanoire.local',
  password: 'ElanoireAdmin123',
} as const;

type AdminSessionPayload = {
  email: string;
  exp: number;
};

function getAdminSessionSecret() {
  const configuredSecret = process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET;

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Configure ADMIN_SESSION_SECRET or NEXTAUTH_SECRET before enabling admin access in production.');
  }

  return 'elanoire-admin-session-secret';
}

function signAdminPayload(payload: string) {
  return createHmac('sha256', getAdminSessionSecret()).update(payload).digest('base64url');
}

function encodeAdminSession(payload: AdminSessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signAdminPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function decodeAdminSession(token: string) {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) return null;

  const expectedSignature = signAdminPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as AdminSessionPayload;

    if (!payload.email || typeof payload.exp !== 'number') return null;
    if (payload.exp * 1000 <= Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function getAdminCredentialConfig() {
  const email = process.env.ADMIN_LOGIN_EMAIL?.trim();
  const password = process.env.ADMIN_LOGIN_PASSWORD?.trim();

  if (email && password) {
    return {
      mode: 'configured' as AdminAuthMode,
      email,
      password,
    };
  }

  return {
    mode: 'mock' as AdminAuthMode,
    email: fallbackAdminCredentials.email,
    password: fallbackAdminCredentials.password,
  };
}

export function getAdminLoginHint() {
  const config = getAdminCredentialConfig();

  if (config.mode !== 'mock') {
    return {
      mode: config.mode,
      email: config.email,
      password: null,
    };
  }

  return {
    mode: config.mode,
    email: config.email,
    password: config.password,
  };
}

export function validateAdminCredentials(email: string, password: string) {
  const config = getAdminCredentialConfig();
  const normalisedEmail = email.trim().toLowerCase();

  return (
    safeCompare(normalisedEmail, config.email.trim().toLowerCase()) &&
    safeCompare(password, config.password)
  );
}

export function createAdminSessionToken(email: string) {
  return encodeAdminSession({
    email,
    exp: Math.floor(Date.now() / 1000) + adminSessionDurationSeconds,
  });
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: adminSessionDurationSeconds,
  };
}

export async function getAdminSession() {
  const token = (await cookies()).get(adminSessionCookieName)?.value;
  if (!token) return null;

  return decodeAdminSession(token);
}

export async function requireAdminSession() {
  return getAdminSession();
}

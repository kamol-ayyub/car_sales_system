import type { Response } from 'express';

export const REFRESH_COOKIE_NAME = 'refreshToken';

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/auth',
};

const MS_PER_UNIT: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function readRefreshToken(cookieHeader?: string): string | undefined {
  const prefix = `${REFRESH_COOKIE_NAME}=`;
  const cookie = cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : undefined;
}

export function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...refreshCookieOptions,
    maxAge: toMs(process.env.JWT_REFRESH_EXPIRES_IN || '1m'),
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
}

function toMs(duration: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(duration);
  if (!match) return MS_PER_UNIT.h;

  return Number(match[1]) * (MS_PER_UNIT[match[2]] ?? MS_PER_UNIT.h);
}

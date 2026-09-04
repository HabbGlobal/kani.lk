"use client";

/**
 * Wraps fetch() for every /api/admin/* call from the admin dashboard. The
 * access token is short-lived (30 min); without this, any mutation attempted
 * after it expires just fails with a generic 401 that the UI reports as
 * "could not save" even though the fix is a silent token refresh.
 *
 * On a 401, it exchanges the refresh cookie for a new access token via
 * /api/auth/refresh and retries the original request once. If the refresh
 * itself fails (fully logged out, account deactivated), the original 401
 * response is returned so callers can show a real "please sign in again".
 */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status !== 401) return res;

  const refreshed = await fetch("/api/auth/refresh", { method: "POST" }).catch(() => null);
  if (!refreshed || !refreshed.ok) return res;

  return fetch(input, init);
}

export class SessionExpiredError extends Error {
  constructor() {
    super("Your session has expired — please sign in again.");
    this.name = "SessionExpiredError";
  }
}

/** Throws SessionExpiredError on a 401 that survives the refresh-and-retry. */
export async function adminFetchOrThrow(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await adminFetch(input, init);
  if (res.status === 401) throw new SessionExpiredError();
  return res;
}

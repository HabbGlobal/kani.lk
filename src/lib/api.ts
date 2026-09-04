import "server-only";
import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";

/**
 * Every admin route handler catches AuthError the same way — centralised so
 * the 401 vs 403 split (superadmin-only actions) never drifts between routes.
 */
export function authErrorResponse(err: unknown): NextResponse | null {
  if (!(err instanceof AuthError)) return null;
  const status = err.message.includes("superadmin") ? 403 : 401;
  return NextResponse.json({ error: err.message }, { status });
}

/** First zod issue, in the same shape the client forms already expect. */
export function zodErrorResponse(error: { issues: { message: string }[] }): NextResponse {
  return NextResponse.json(
    { error: error.issues[0]?.message ?? "Check your details", issues: error.issues },
    { status: 400 }
  );
}

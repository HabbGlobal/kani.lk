/**
 * Runs once when the server starts. Verifies the SMTP transport up front so a
 * broken mailbox is a clear line in the boot log — "SMTP verification FAILED" —
 * rather than a silent failure discovered only when the first enquiry email
 * doesn't arrive. Enquiries are still saved to Mongo regardless (see
 * src/app/api/inquiries/route.ts): this check is diagnostic, not a gate.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { verifyTransport } = await import("@/lib/mail");
  void verifyTransport();
}

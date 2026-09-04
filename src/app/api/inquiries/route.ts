import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import Land from "@/models/Land";
import { inquirySchema } from "@/lib/validation";
import { rateLimit, clientIp, hashIp } from "@/lib/rate-limit";
import { sendAdminNotification, sendInquiryAcknowledgement } from "@/lib/mail";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req);

  const limit = rateLimit(`inquiry:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many messages sent. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Please check the form and try again" },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Honeypot: a bot filled the hidden field. Return success so it does not
  // learn to adapt, but write nothing.
  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  await dbConnect();

  // Resolve listing context so the inbox row and the email are self-contained
  // even if the listing is later edited or deleted.
  let landTitle: string | undefined;
  let landRefCode: string | undefined;
  let landSlug: string | undefined;

  if (data.landId) {
    const land = await Land.findById(data.landId)
      .select("title refCode slug")
      .lean();
    if (land) {
      landTitle = land.title;
      landRefCode = land.refCode;
      landSlug = land.slug;
    }
  }

  // Save first, then email. A bounced SMTP must never lose a lead.
  const inquiry = await Inquiry.create({
    land: data.landId || undefined,
    landRefCode,
    landTitle,
    source: data.source,
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    message: data.message,
    ipHash: hashIp(ip),
    userAgent: req.headers.get("user-agent")?.slice(0, 300),
  });

  if (data.landId) {
    await Land.updateOne({ _id: data.landId }, { $inc: { inquiryCount: 1 } });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const mailData = {
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    message: data.message,
    landTitle,
    landRefCode,
    landUrl: landSlug ? `${site}/lands/${landSlug}` : undefined,
    source: data.source,
  };

  // Fire-and-forget, outside the request path: a slow SMTP must not stall the
  // response the visitor is waiting on. Failures are logged and recorded.
  void (async () => {
    try {
      await Promise.all([
        sendAdminNotification(mailData),
        sendInquiryAcknowledgement(mailData),
      ]);
      await Inquiry.updateOne({ _id: inquiry._id }, { $set: { emailSent: true } });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[inquiry] email failed:", message);
      await Inquiry.updateOne(
        { _id: inquiry._id },
        { $set: { emailSent: false, emailError: message.slice(0, 400) } }
      ).catch(() => {});
    }
  })();

  return NextResponse.json({ ok: true, id: String(inquiry._id) });
}

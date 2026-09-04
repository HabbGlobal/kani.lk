import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import { requireSession } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export const runtime = "nodejs";

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  // Quote whenever the value could be misread as a delimiter or a new row.
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Streams the inbox as CSV — hand-built, no dependency needed at this volume. */
export async function GET(req: Request) {
  try {
    await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const landId = searchParams.get("landId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filter: Record<string, unknown> = {};
  if (landId) filter.land = landId;
  if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.$gte = new Date(from);
    if (to) range.$lte = new Date(`${to}T23:59:59.999Z`);
    filter.createdAt = range;
  }

  await dbConnect();
  const rows = await Inquiry.find(filter).sort({ createdAt: -1 }).lean();

  const header = [
    "Date", "Name", "Phone", "Email", "Listing", "Ref code", "Source", "Handled", "Message",
  ];
  const lines = [header.map(csvCell).join(",")];

  for (const r of rows) {
    lines.push(
      [
        formatDate(r.createdAt),
        r.name,
        r.phone,
        r.email ?? "",
        r.landTitle ?? "",
        r.landRefCode ?? "",
        r.source,
        r.isHandled ? "Yes" : "No",
        r.message,
      ]
        .map(csvCell)
        .join(",")
    );
  }

  const csv = lines.join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="inquiries.csv"',
    },
  });
}

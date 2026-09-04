import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import { requireSession } from "@/lib/auth";
import { authErrorResponse, zodErrorResponse } from "@/lib/api";
import { plain } from "@/lib/utils";

export const runtime = "nodejs";

/** Small ad hoc schema — this route only ever toggles handled state + a note. */
const patchSchema = z.object({
  isHandled: z.boolean().optional(),
  adminNote: z.string().trim().max(2000).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.isHandled === true) {
    update.handledAt = new Date();
    update.handledBy = user.id;
  } else if (parsed.data.isHandled === false) {
    update.handledAt = undefined;
    update.handledBy = undefined;
  }

  await dbConnect();
  const doc = await Inquiry.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  if (!doc) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });

  return NextResponse.json({ item: plain(doc) });
}

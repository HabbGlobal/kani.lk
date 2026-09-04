import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Page from "@/models/Page";
import { pageSchema } from "@/lib/validation";
import { requireSession } from "@/lib/auth";
import { authErrorResponse, zodErrorResponse } from "@/lib/api";
import { revalidateContentPage } from "@/lib/revalidate";
import { plain } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await ctx.params;
  await dbConnect();
  const doc = await Page.findOne({ slug }).lean();
  if (!doc) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  return NextResponse.json({ item: plain(doc) });
}

/** Pages are fixed by slug (about/terms/privacy, seeded already) — never created or deleted here. */
export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  let user;
  try {
    user = await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = pageSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  await dbConnect();
  const doc = await Page.findOneAndUpdate(
    { slug },
    { $set: parsed.data, updatedBy: user.id },
    { new: true, runValidators: true }
  ).lean();
  if (!doc) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  revalidateContentPage(slug);
  return NextResponse.json({ item: plain(doc) });
}

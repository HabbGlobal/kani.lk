import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";
import { requireSession } from "@/lib/auth";
import { authErrorResponse, zodErrorResponse } from "@/lib/api";
import { revalidateLandPages } from "@/lib/revalidate";

export const runtime = "nodejs";

const schema = z.object({ landIds: z.array(z.string()).min(1) });

/** Sets popularRank sequentially (0-based) from the submitted order. */
export async function PATCH(req: Request) {
  try {
    await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  await dbConnect();
  await Promise.all(
    parsed.data.landIds.map((id, i) =>
      Land.updateOne({ _id: id }, { $set: { popularRank: i } })
    )
  );

  revalidateLandPages();
  return NextResponse.json({ ok: true });
}

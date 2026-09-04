import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Page from "@/models/Page";
import { plain } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/Card";
import { PageEditor } from "@/components/admin/PageEditor";

export const metadata: Metadata = { title: "Edit page", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPageEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await dbConnect();
  const doc = await Page.findOne({ slug }).lean();
  if (!doc) notFound();

  const page = plain<{ title: string; body: string; seoTitle?: string; seoDescription?: string }>(doc);

  return (
    <div>
      <SectionHeading title={page.title} subtitle={`/${slug}`} />
      <PageEditor
        slug={slug}
        initial={{
          title: page.title,
          body: page.body,
          seoTitle: page.seoTitle ?? "",
          seoDescription: page.seoDescription ?? "",
        }}
      />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBody } from "@/components/site/PageBody";
import { getPage } from "@/lib/queries";

export const revalidate = 600;

const SLUG = "privacy";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(SLUG);
  if (!page) return {};
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
    alternates: { canonical: `/${SLUG}` },
  };
}

export default async function ContentPage() {
  const page = await getPage(SLUG);
  if (!page) notFound();

  return (
    <div className="container-kani py-8 md:py-12">
      <article className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-[27px] text-[var(--kani-green)] md:text-[34px]">
          {page.title}
        </h1>
        <PageBody body={page.body} />
      </article>
    </div>
  );
}

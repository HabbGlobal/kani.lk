import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/site/Logo";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--bone)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo withTagline className="items-center" />
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--hairline)] bg-[var(--card)] p-6 md:p-8">
          <h1 className="mb-1 text-[27px] text-[var(--kani-green)]">Sign in</h1>
          <p className="mb-6 text-[15px] text-[var(--muted)]">
            Manage listings, enquiries and site content.
          </p>
          {/* Only allow relative paths — an open redirect here would be a real hole. */}
          <LoginForm next={next?.startsWith("/") ? next : "/admin"} />
        </div>

        <p className="mt-6 text-center text-[14px] text-[var(--muted)]">
          <a href="/" className="underline-offset-4 hover:underline">
            Back to kani.lk
          </a>
        </p>
      </div>
    </div>
  );
}

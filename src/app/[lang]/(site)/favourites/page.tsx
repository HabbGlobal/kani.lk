import type { Metadata } from "next";
import { FavouritesList } from "@/components/land/FavouritesList";

export const metadata: Metadata = {
  title: "Your saved lands",
  description: "The listings you have saved on this device.",
  // Device-local content: nothing here is worth indexing.
  robots: { index: false, follow: true },
};

export default function FavouritesPage() {
  return (
    <div className="container-kani py-8 md:py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-[27px] text-[var(--kani-green)] md:text-[34px]">
          Your saved lands
        </h1>
        <p className="mt-2 text-[16px] leading-relaxed text-[var(--muted)]">
          Saved on this device only. Nothing is sent to us and no account is
          needed — but clearing your browser data will clear this list.
        </p>
      </header>

      <FavouritesList />
    </div>
  );
}

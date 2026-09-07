/** The /lands page title — a plain centered heading, no card or subtitle,
 * so it reads as a page title rather than another floating panel competing
 * with the filter sidebar and results below it. */
export function LandsPageHeader({ title }: { title: string }) {
  return (
    <h1 className="mb-6 text-center text-[26px] leading-tight text-[var(--kani-green)] sm:text-[30px] md:text-[34px]">
      {title}
    </h1>
  );
}

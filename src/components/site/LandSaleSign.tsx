/**
 * A gold line-art illustration of a hanging "FOR SALE" sign on a post, with
 * a small tuft of grass at its base — the decorative anchor for the
 * "list your land" CTA. Purely ornamental: hidden from assistive tech.
 */
export function LandSaleSign({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 132"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Post */}
      <path
        d="M60 22v96"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Cross-arm the sign hangs from */}
      <path
        d="M60 30h26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Two hanging chains */}
      <path
        d="M68 32.5v8M80 32.5v8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Sign board */}
      <rect
        x="52"
        y="40"
        width="60"
        height="34"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <text
        x="82"
        y="61.5"
        textAnchor="middle"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="1"
        fill="currentColor"
        fontFamily="Public Sans, system-ui, sans-serif"
      >
        FOR SALE
      </text>
      {/* Ground line */}
      <path
        d="M14 118h92"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Grass tufts at the base of the post */}
      <path
        d="M52 118c1-7 4-11 8-13-2 5-2 9-1 13M68 118c-1-7-4-11-8-13 2 5 2 9 1 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M20 118c1-5 3.5-8 6.5-9.5-1.5 4-1.5 6.5-.5 9.5M32 118c-1-5-3.5-8-6.5-9.5 1.5 4 1.5 6.5.5 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

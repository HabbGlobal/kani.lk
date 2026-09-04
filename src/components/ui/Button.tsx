import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "outline" | "ghost" | "danger" | "light";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "btn-primary bg-[var(--kani-green)] text-white hover:bg-[var(--kani-green-deep)] shadow-[0_1px_2px_rgba(10,44,30,0.16)]",
  gold: "bg-[var(--palmyra-gold)] text-[var(--kani-green-deep)] hover:bg-[#a9873f] font-600",
  outline:
    "bg-transparent text-[var(--heading)] border border-[var(--heading)]/35 hover:bg-[var(--heading)]/10 hover:border-[var(--heading)]/60",
  ghost: "bg-transparent text-[var(--ink)] hover:bg-[var(--hover-tint)]",
  danger: "bg-[var(--laterite)] text-white hover:bg-[#8d3e23]",
  light:
    "bg-white/92 text-[var(--kani-green)] hover:bg-white backdrop-blur-sm border border-white/60",
};

/** 44px minimum touch target on every size — this is a phone-first site. */
const SIZES: Record<Size, string> = {
  sm: "h-11 px-4 text-[15px] gap-1.5",
  md: "h-12 px-6 text-[16px] gap-2",
  lg: "h-14 px-8 text-[17px] gap-2.5",
};

const BASE =
  "inline-flex items-center justify-center rounded-[var(--radius-pill)] font-medium " +
  "cursor-pointer select-none whitespace-nowrap " +
  "transition-[background-color,border-color,transform,box-shadow,opacity] duration-200 " +
  "[transition-timing-function:var(--ease-out)] " +
  "active:scale-[0.97] " +
  "disabled:opacity-55 disabled:pointer-events-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  fullWidth,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  fullWidth,
  href,
  ...props
}: CommonProps &
  Omit<React.ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    />
  );
}

/** Plain anchor for tel:, wa.me and other external targets. */
export function ButtonAnchor({
  variant = "primary",
  size = "md",
  className,
  fullWidth,
  ...props
}: CommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    />
  );
}

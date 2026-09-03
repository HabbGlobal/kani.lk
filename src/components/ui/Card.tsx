import { cn } from "@/lib/utils";

/** White card on bone — never white on white. */
export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--card)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-[27px] leading-tight text-[var(--kani-green)] md:text-[34px]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-[15px] text-[var(--muted)] md:text-[16px]">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 pb-1">{action}</div>}
    </div>
  );
}

/** Empty state that offers a way forward rather than an apology. */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <svg
        viewBox="0 0 48 48"
        className="size-12 text-[var(--hairline)]"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 34c10-4 20-6 36-6M6 41c12-5 22-7 36-7"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M12 26V12h14v14"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="text-[21px] text-[var(--kani-green)]">{title}</h3>
      {children && (
        <div className="max-w-md text-[15px] text-[var(--muted)]">{children}</div>
      )}
      {action && <div className="mt-2">{action}</div>}
    </Card>
  );
}

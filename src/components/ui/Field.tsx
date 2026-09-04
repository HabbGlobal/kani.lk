"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

/* Fields stay on a fixed white surface with fixed dark text by design (they
   read like the public search bar's white pills) — not on the --ink/--card
   tokens, which flip in admin dark mode and would otherwise make typed text
   invisible against this deliberately-light input surface. */
const CONTROL =
  "w-full rounded-[var(--radius-md)] border border-[var(--hairline)] bg-white px-4 " +
  "text-[16px] text-[#16201b] placeholder:text-[#5f6b63]/70 " +
  "transition-[border-color,box-shadow] duration-200 [transition-timing-function:var(--ease-out)] " +
  "hover:border-[var(--kani-green)]/40 " +
  "focus:border-[var(--kani-green)] focus:outline-none focus:ring-2 focus:ring-[var(--kani-green)]/25 " +
  "disabled:bg-black/[0.03] disabled:text-[#5f6b63] disabled:cursor-not-allowed " +
  "aria-[invalid=true]:border-[var(--laterite)] aria-[invalid=true]:ring-[var(--laterite)]/25";

/** Wraps any control with a visible label, helper text and inline error. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-[14px] font-medium text-[var(--ink)]"
        >
          {label}
          {required && (
            <span className="ml-0.5 text-[var(--laterite)]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {/* Error replaces the hint, and sits next to the field — never only at the top. */}
      {error ? (
        <p className="flex items-start gap-1 text-[13px] font-medium text-[var(--laterite)]">
          <span aria-hidden="true">•</span>
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(CONTROL, "h-12", className)} {...props} />;
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea ref={ref} className={cn(CONTROL, "min-h-32 py-3 leading-relaxed", className)} {...props} />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        // Tighter horizontal padding than a text input: the chevron needs room,
        // and these sit in narrow two-up range columns.
        className={cn(
          CONTROL,
          "h-12 cursor-pointer appearance-none !px-3 pr-8",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

/** Checkbox with a real label and a 44px target. */
export function Checkbox({
  label,
  className,
  id,
  ...props
}: { label: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-[var(--ink)] select-none",
        className
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        className="size-5 shrink-0 cursor-pointer rounded-[5px] border-[var(--hairline)]
                   accent-[var(--kani-green)] focus-visible:outline-2 focus-visible:outline-offset-2"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

/** Segmented control — used for the hero purpose toggle and admin filters. */
export function Segmented({
  name,
  options,
  value,
  onChange,
  className,
}: {
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex w-full rounded-[var(--radius-pill)] bg-black/[0.05] p-1",
        className
      )}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "relative flex-1 cursor-pointer rounded-[var(--radius-pill)] px-3 py-2.5 text-center",
              "text-[15px] font-medium transition-all duration-200 [transition-timing-function:var(--ease-out)]",
              active
                ? "bg-white text-[var(--kani-green)] shadow-[0_1px_4px_rgba(10,44,30,0.14)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={active}
              onChange={() => onChange?.(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

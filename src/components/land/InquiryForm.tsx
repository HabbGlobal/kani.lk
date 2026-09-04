"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { inquirySchema, type InquiryFormValues } from "@/lib/validation";

/**
 * Enquiry form. Validation is the same Zod schema the API route runs, so the
 * client and server can never disagree about what is valid.
 */
export function InquiryForm({
  landId,
  landTitle,
  source = "listing",
  compact = false,
}: {
  landId?: string;
  landTitle?: string;
  source?: "listing" | "contact";
  compact?: boolean;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    mode: "onBlur",
    defaultValues: {
      landId,
      source,
      message: landTitle ? `I am interested in "${landTitle}". Please contact me.` : "",
      website: "",
    },
  });

  async function onSubmit(values: InquiryFormValues) {
    setState("sending");
    setErrorMessage("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setState("sent");
      reset();
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (state === "sent") {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-lg)] border border-[var(--paddy)]/40 bg-[var(--paddy)]/8 p-6 text-center animate-rise"
      >
        <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[var(--paddy)] text-white">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor"
               strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h3 className="mb-1.5 text-[21px] text-[var(--kani-green)]">Message sent</h3>
        <p className="text-[15px] text-[var(--muted)]">
          We have passed your message on. The owner will usually call you back
          within a day. Check your email for a copy.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setState("idle")}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <input type="hidden" {...register("landId")} />
      <input type="hidden" {...register("source")} />

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <Field label="Your name" htmlFor="iq-name" required error={errors.name?.message}>
          <Input
            id="iq-name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </Field>

        <Field
          label="Phone number"
          htmlFor="iq-phone"
          required
          hint="So the owner can call you back"
          error={errors.phone?.message}
        >
          <Input
            id="iq-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0771234567"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
        </Field>
      </div>

      <Field
        label="Email"
        htmlFor="iq-email"
        hint="Optional — we send you a copy of your message"
        error={errors.email?.message}
      >
        <Input
          id="iq-email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </Field>

      <Field label="Message" htmlFor="iq-message" required error={errors.message?.message}>
        <Textarea
          id="iq-message"
          rows={4}
          aria-invalid={!!errors.message}
          {...register("message")}
        />
      </Field>

      {state === "error" && (
        <p role="alert" className="text-[14px] font-medium text-[var(--laterite)]">
          {errorMessage}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send enquiry"}
      </Button>

      <p className="text-[13px] leading-relaxed text-[var(--muted)]">
        Your details go to the owner of this listing and to kani.lk. We do not
        share them with anyone else.
      </p>
    </form>
  );
}

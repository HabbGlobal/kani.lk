"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { useI18n } from "@/lib/i18n/client";

export function LoginForm({ next = "/admin" }: { next?: string }) {
  const router = useRouter();
  const { d } = useI18n();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? d.admin.signInFailed);
      router.push(next);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : d.admin.signInFailed);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Field
        label={d.admin.email}
        htmlFor="email"
        required
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </Field>

      <Field
        label={d.admin.password}
        htmlFor="password"
        required
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
      </Field>

      {serverError && (
        <p role="alert" className="text-[14px] font-medium text-[var(--laterite)]">
          {serverError}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth disabled={loading}>
        {loading ? d.admin.signingIn : d.admin.signIn}
      </Button>
    </form>
  );
}

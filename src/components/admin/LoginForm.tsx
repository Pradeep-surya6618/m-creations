"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validation/admin";
import { AdminButton } from "./AdminButton";

const fieldBase =
  "w-full rounded-xl border border-brand-blush bg-white px-4 py-3 text-sm text-brand-ink " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error ?? "Sign-in failed.");
        setSubmitting(false);
        return;
      }
      router.push(next);
    } catch {
      toast.error("Network error.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-semibold mb-2">
          Email
        </span>
        <input className={fieldBase} type="email" autoComplete="email" {...register("email")} />
        {errors.email && (
          <span className="block mt-1 text-xs text-brand-pink">{errors.email.message}</span>
        )}
      </label>
      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-semibold mb-2">
          Password
        </span>
        <input
          className={fieldBase}
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <span className="block mt-1 text-xs text-brand-pink">{errors.password.message}</span>
        )}
      </label>
      <AdminButton type="submit" disabled={submitting} className="w-full">
        {submitting ? "Signing in…" : "Sign in"}
      </AdminButton>
    </form>
  );
}

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
  const [showPassword, setShowPassword] = useState(false);

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
      // Toast must live on the destination — this page's <Toaster /> unmounts
      // during the navigation. WelcomeFlash on the dashboard picks this up.
      sessionStorage.setItem("mc:admin-welcome", "Welcome back!");
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
        <div className="relative">
          <input
            className={`${fieldBase} pr-12`}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-2 my-auto h-9 w-9 inline-flex items-center justify-center rounded-full text-brand-ink-muted hover:text-brand-pink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
          >
            {showPassword ? (
              // eye-off icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              // eye icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
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

import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/admin/LoginForm";
import { AdminToaster } from "@/components/admin/AdminToaster";
import { FloatingPetals } from "@/components/brand/FloatingPetals";

export const metadata: Metadata = {
  title: "Admin · Sign in",
};

export default function AdminLoginPage() {
  return (
    <>
      <AdminToaster />
      <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] bg-brand-cream overflow-hidden">
        {/* === LEFT — Cover image with brand overlay === */}
        <aside className="relative hidden lg:flex items-end overflow-hidden">
          <Image
            src="/Admin-Cover.png"
            alt="Maria Creations atelier"
            fill
            priority
            sizes="55vw"
            className="object-cover"
          />
          {/* Layered overlays for legibility + brand mood */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-pink-dark/60 via-brand-pink/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/55 via-transparent to-transparent" />
          <FloatingPetals count={6} />

          <div className="relative z-10 p-12 text-white max-w-md">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4 opacity-90">
              Maria Creations · Admin
            </p>
            <h2 className="font-script text-5xl lg:text-6xl leading-[0.9]">
              Crafting flowers,<br />curating stories.
            </h2>
            <p className="mt-6 text-sm opacity-90 leading-relaxed max-w-sm">
              Sign in to manage your handmade collection, verify orders, and
              edit what your customers see — every petal at a time.
            </p>
            <div className="mt-10 flex items-center gap-4 text-xs uppercase tracking-[0.25em] font-semibold opacity-80">
              <span className="h-px w-12 bg-white/60" />
              <span>Est. Madurai</span>
            </div>
          </div>
        </aside>

        {/* === RIGHT — Sign-in card === */}
        <section className="relative flex items-center justify-center px-6 py-12 sm:px-10 overflow-hidden">
          {/* Soft floral background on mobile (lg+ uses the image side) */}
          <div className="absolute inset-0 lg:hidden bg-gradient-to-br from-brand-blush/40 via-brand-cream to-brand-pink-soft/15" />
          <div className="pointer-events-none absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-brand-pink/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-[350px] w-[350px] rounded-full bg-brand-blush/40 blur-3xl" />

          <div className="relative w-full max-w-sm">
            {/* Brand mark + greeting */}
            <div className="text-center mb-10">
              <span className="font-script text-5xl text-brand-pink leading-none">
                Maria Creations
              </span>
              <div className="mt-6 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-brand-pink-dark font-bold">
                <span className="h-px w-8 bg-brand-pink" />
                Admin Sign In
                <span className="h-px w-8 bg-brand-pink" />
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-brand-ink">
                Welcome back, Maria.
              </h1>
              <p className="mt-2 text-sm text-brand-ink-muted">
                Sign in to manage the boutique.
              </p>
            </div>

            {/* Premium glass card around the form */}
            <div className="relative">
              {/* Glow halo */}
              <div className="pointer-events-none absolute -inset-1 bg-brand-gradient opacity-20 blur-2xl rounded-3xl" />

              <div className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-white/60 shadow-petal-lg p-7 sm:p-8">
                <Suspense>
                  <LoginForm />
                </Suspense>
              </div>
            </div>

            <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-brand-ink-muted">
              Made with love · Madurai
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

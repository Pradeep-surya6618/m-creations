import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${BRAND.name} — handmade flowers from ${BRAND.location}.`,
};

const channels = [
  {
    label: "Instagram",
    value: "@mariacreations",
    href: BRAND.instagram,
    external: true,
  },
  {
    label: "WhatsApp",
    value: "Message us",
    href: BRAND.whatsapp,
    external: true,
  },
  {
    label: "Email",
    value: BRAND.email,
    href: `mailto:${BRAND.email}`,
    external: false,
  },
  {
    label: "Studio",
    value: BRAND.location,
    href: null,
    external: false,
  },
];

export default function ContactPage() {
  return (
    <Container className="py-12 lg:py-20">
      <div className="max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-ink-muted mb-3 font-semibold">
          Say hello
        </p>
        <ScriptHeading as="h1">Let&apos;s chat</ScriptHeading>
        <p className="mt-6 text-base text-brand-ink-muted leading-relaxed">
          Whether you&apos;re placing a custom order, asking about delivery, or just want to talk
          flowers — we&apos;d love to hear from you. Pick whichever channel works best.
        </p>
      </div>

      <GlassCard className="mt-12 p-8 lg:p-12 max-w-2xl">
        <ul className="space-y-6">
          {channels.map((c) => (
            <li key={c.label} className="flex items-center justify-between gap-4 pb-6 border-b border-brand-blush last:border-b-0 last:pb-0">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-ink-muted font-semibold mb-1">
                  {c.label}
                </p>
                <p className="text-lg text-brand-ink font-medium">{c.value}</p>
              </div>
              {c.href && (
                <a
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                  className="cursor-pointer text-brand-pink text-2xl hover:opacity-70 transition-opacity"
                  aria-label={`Open ${c.label}`}
                >
                  →
                </a>
              )}
            </li>
          ))}
        </ul>
      </GlassCard>

      <p className="mt-10 text-center text-brand-ink-muted text-sm">
        A contact form is coming soon 🌸
      </p>
    </Container>
  );
}

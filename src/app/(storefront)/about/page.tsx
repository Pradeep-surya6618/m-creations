import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { SectionDivider } from "@/components/brand/SectionDivider";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About",
  description: `The story behind ${BRAND.name} — handmade flowers crafted with love in ${BRAND.location}.`,
};

const values = [
  {
    title: "Handmade with patience",
    body: "Every petal, leaf, and stem is shaped by hand. We don't cut corners — we shape them.",
  },
  {
    title: "Made to last",
    body: "Our blooms never wilt. Pieces from years ago still look the way they did the day they were made.",
  },
  {
    title: "Small batch, on purpose",
    body: "We keep stock low so every piece gets full attention. If it's listed, it's been loved into being.",
  },
];

export default function AboutPage() {
  return (
    <Container className="py-12 lg:py-20">
      <div className="max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-ink-muted mb-3 font-semibold">
          Our Story
        </p>
        <ScriptHeading as="h1">A boutique made by hand</ScriptHeading>
        <p className="mt-6 text-lg text-brand-ink-muted leading-relaxed">
          Maria Creations started in a small studio in {BRAND.location}, with a few pipe cleaners,
          a roll of satin ribbon, and the stubborn idea that flowers shouldn&apos;t have to wilt.
        </p>
        <p className="mt-4 text-base text-brand-ink-muted leading-relaxed">
          What began as a quiet passion has grown into a small collection of bouquets, candles,
          and gifts — each one made by hand, each one a little different from the last. We&apos;re
          glad you&apos;re here.
        </p>
      </div>

      <SectionDivider className="my-16" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-petal-md">
            <Image
              src="/Handmade-2.jpeg"
              alt="Maria in the studio"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-ink-muted mb-3 font-semibold">
            Made by Maria
          </p>
          <ScriptHeading as="h2">Meet the maker</ScriptHeading>
          <p className="mt-6 text-base text-brand-ink-muted leading-relaxed">
            Hi, I&apos;m Maria — the hands behind every piece. I learned to make pipe-cleaner flowers
            from my grandmother as a child, and I haven&apos;t really stopped since.
          </p>
          <p className="mt-4 text-base text-brand-ink-muted leading-relaxed">
            If there&apos;s a colour, size, or arrangement you&apos;re dreaming of that you don&apos;t see in the
            shop, message me on Instagram or WhatsApp — I love a custom request.
          </p>
        </Reveal>
      </div>

      <SectionDivider className="my-16" />

      <div>
        <ScriptHeading as="h2" align="center" ornament>What we believe</ScriptHeading>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.05}>
              <div className="bg-white/85 rounded-2xl p-8 shadow-petal-sm border border-white/60 h-full">
                <p className="text-brand-pink text-3xl mb-3">✿</p>
                <h3 className="font-script text-3xl text-brand-pink mb-3">{v.title}</h3>
                <p className="text-sm text-brand-ink-muted leading-relaxed">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <Button href="/shop" variant="gradient" size="lg">Browse the Collection</Button>
      </div>
    </Container>
  );
}

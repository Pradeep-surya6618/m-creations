import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { SectionDivider } from "@/components/brand/SectionDivider";
import { FloatingPetals } from "@/components/brand/FloatingPetals";
import { CategoryTile } from "@/components/product/CategoryTile";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/motion/Reveal";
import { getAllCategories, getFeaturedProducts } from "@/lib/catalog";
import { getHeroContent } from "@/lib/content";

const categoryLabels: Record<string, string> = {
  bouquets: "BOUQUETS",
  "pipe-cleaner": "PIPE CLEANER",
  "flower-pots": "FLOWER POTS",
  gifts: "GIFTS",
  "candle-floral": "CANDLE FLORAL",
};

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const categories = await getAllCategories();
  const hero = await getHeroContent();

  return (
    <>
      {/* === HERO === */}
      <section className="relative -mt-16 lg:-mt-20 overflow-hidden">
        {/* Layered backgrounds — extend behind the (transparent) navbar */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blush/40 via-brand-cream to-brand-pink-soft/15" />
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-pink/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-brand-blush/50 blur-3xl" />

        {/* Ambient petals across the whole hero */}
        <FloatingPetals count={8} />

        <Container width="hero" className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 sm:gap-8 lg:gap-12 items-center pt-20 lg:pt-24 pb-10 lg:pb-14">
            {/* TEXT */}
            <div className="relative">
              <p className="inline-flex items-center gap-2 sm:gap-3 mb-6 lg:mb-8 text-[9px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em] text-brand-pink-dark font-bold">
                <span className="h-px w-6 sm:w-8 bg-brand-pink" />
                {hero.eyebrow}
              </p>

              <h1 className="font-script text-brand-pink leading-[0.9] tracking-tight text-4xl sm:text-6xl lg:text-7xl xl:text-8xl whitespace-nowrap">
                Maria Creations
              </h1>

              <p className="mt-4 max-w-md text-base sm:text-lg text-brand-ink-muted leading-relaxed">
                {hero.tagline}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-3">
                <Button
                  href="/shop"
                  variant="gradient"
                  size="md"
                  className="whitespace-nowrap sm:px-8 sm:py-3.5 sm:text-sm"
                >
                  Shop Now
                </Button>
                <Button
                  href="/shop"
                  variant="ghost"
                  size="md"
                  className="whitespace-nowrap sm:px-8 sm:py-3.5 sm:text-sm"
                >
                  View Collection
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-brand-ink-muted">
                <div className="flex items-center gap-2">
                  <span className="text-brand-pink text-sm">✿</span>
                  <span className="font-medium">Handmade · never wilts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-pink text-sm">✿</span>
                  <span className="font-medium">Made in Madurai</span>
                </div>
              </div>
            </div>

            {/* IMAGE */}
            <div className="relative">
              {/* Glow behind image */}
              <div className="pointer-events-none absolute -inset-6 bg-brand-gradient opacity-15 blur-3xl rounded-full" />

              <div className="relative h-[360px] sm:h-[440px] lg:h-[460px] rounded-[2rem] overflow-hidden shadow-petal-lg ring-1 ring-white/50">
                <Image
                  src={hero.image ?? "/Handmade-1.jpeg"}
                  alt="Handmade pipe-cleaner bouquet by Maria Creations"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized={hero.image?.startsWith("/api/images/") ?? false}
                  className="object-cover"
                />
                {/* Subtle vignette for depth */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-ink/15 via-transparent to-transparent" />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 left-4 sm:left-6 lg:bottom-6 lg:left-auto lg:-right-5 flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur-md px-4 py-3 shadow-petal-lg border border-brand-blush">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-white text-base shadow-petal-sm">
                  ✿
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-brand-pink-dark font-bold">{hero.badgeLabel}</p>
                  <p className="text-sm font-semibold text-brand-ink">{hero.badgeText}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {categories.length > 0 && (
        <>
          <SectionDivider />

          {/* === SHOP BY CATEGORY === */}
          <section className="py-12 lg:py-20">
            <Container>
              <Reveal>
                <ScriptHeading as="h2" align="center" ornament>
                  Shop by Category
                </ScriptHeading>
              </Reveal>
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 justify-items-center">
                {categories.map((c, i) => (
                  <Reveal key={c.slug} delay={i * 0.05}>
                    <CategoryTile category={c} />
                  </Reveal>
                ))}
              </div>
            </Container>
          </section>
        </>
      )}

      {featured.length > 0 && (
        <>
          <SectionDivider />

          {/* === FEATURED === */}
          <section className="py-12 lg:py-20">
            <Container>
              <Reveal>
                <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
                  <ScriptHeading as="h2">Featured Bouquets</ScriptHeading>
                  <Button href="/shop" variant="link" size="sm">View all →</Button>
                </div>
              </Reveal>
              <ProductGrid>
                {featured.map((p, i) => (
                  <Reveal key={p.id} delay={i * 0.05}>
                    <ProductCard
                      product={p}
                      categoryLabel={categoryLabels[p.category]}
                    />
                  </Reveal>
                ))}
              </ProductGrid>
            </Container>
          </section>
        </>
      )}

      <SectionDivider />

      {/* === BRAND STORY === */}
      <section className="py-12 lg:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-petal-md">
                <Image
                  src="/Handmade-2.jpeg"
                  alt="Behind the scenes at Maria Creations"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[10px] uppercase tracking-[0.3em] text-brand-ink-muted mb-3 font-semibold">
                Handmade with Love
              </p>
              <ScriptHeading as="h2">Made just for you</ScriptHeading>
              <p className="mt-6 text-base text-brand-ink-muted leading-relaxed">
                Every bloom is shaped by hand in our Madurai studio — no two are ever exactly alike.
                We use pipe cleaners, soft fabrics, and a quiet patience to make pieces that last
                far longer than the bouquets they were inspired by.
              </p>
              <p className="mt-4 text-base text-brand-ink-muted leading-relaxed">
                Whether it&apos;s a single rose or a candle wrapped in petals — it&apos;s made just for you.
              </p>
              <div className="mt-8">
                <Button href="/about" variant="outline" size="md">Our Story</Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <SectionDivider />

      {/* === INSTAGRAM STRIP === */}
      <section className="py-12 lg:py-16">
        <Container>
          <Reveal>
            <div className="text-center mb-8">
              <ScriptHeading as="h2" align="center">@mariacreations</ScriptHeading>
              <p className="mt-3 text-sm text-brand-ink-muted">Follow along for new blooms and behind-the-scenes</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <a
                key={i}
                href="https://instagram.com/mariacreations"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-2xl overflow-hidden group"
              >
                <Image
                  src={i % 2 === 0 ? "/Handmade-1.jpeg" : "/Handmade-2.jpeg"}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-brand-pink/0 group-hover:bg-brand-pink/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold uppercase tracking-[0.2em] transition-opacity">
                    @mariacreations
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* === FINAL CTA === */}
      <section className="my-12 lg:my-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-10 lg:p-14 text-center text-white shadow-petal-lg">
            <FloatingPetals count={4} />
            <h2 className="relative font-script text-5xl sm:text-6xl text-white leading-none">
              Explore the collection
            </h2>
            <p className="relative mt-4 text-white/90 text-base">A bloom for every story.</p>
            <div className="relative mt-8 flex justify-center">
              <Button href="/shop" variant="ghost" size="lg" className="bg-white text-brand-pink border-white">
                Shop Now
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { SectionDivider } from "@/components/brand/SectionDivider";
import { FloatingPetals } from "@/components/brand/FloatingPetals";
import { CategoryTile } from "@/components/product/CategoryTile";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/motion/Reveal";
import { categories } from "@/data/categories";
import { getFeaturedProducts } from "@/data/products";

const categoryLabels: Record<string, string> = {
  bouquets: "BOUQUETS",
  "pipe-cleaner": "PIPE CLEANER",
  "flower-pots": "FLOWER POTS",
  gifts: "GIFTS",
  "candle-floral": "CANDLE FLORAL",
};

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      {/* === HERO === */}
      <section className="relative">
        <Container width="hero">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-16 lg:py-24">
            <div className="relative">
              <FloatingPetals count={6} className="hidden lg:block" />
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-brand-ink-muted mb-4 font-semibold">
                Est. Madurai · Handmade
              </p>
              <ScriptHeading as="h1">Maria Creations</ScriptHeading>
              <p className="mt-6 max-w-md text-base sm:text-lg text-brand-ink-muted leading-relaxed">
                Handmade flowers crafted with love — one petal at a time, made just for you.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/shop" variant="gradient" size="lg">Shop Now</Button>
                <Button href="/shop" variant="ghost" size="lg">Collections</Button>
              </div>
            </div>

            <div className="relative aspect-[4/5] lg:aspect-square rounded-3xl overflow-hidden shadow-petal-lg">
              <Image
                src="/Handmade-1.jpeg"
                alt="Handmade bouquet"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-5 right-5">
                <Chip variant="new">New · Bouquets</Chip>
              </div>
            </div>
          </div>
        </Container>
      </section>

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

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { SectionDivider } from "@/components/brand/SectionDivider";
import { BRAND } from "@/lib/brand";

const shopLinks = [
  { href: "/shop?category=bouquets", label: "Bouquets" },
  { href: "/shop?category=pipe-cleaner", label: "Pipe Cleaner Flowers" },
  { href: "/shop?category=flower-pots", label: "Flower Pots" },
  { href: "/shop?category=gifts", label: "Floral Gifts" },
  { href: "/shop?category=candle-floral", label: "Candle Florals" },
];

const aboutLinks = [
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
  { href: "/shop", label: "All Products" },
];

export function Footer() {
  return (
    <footer className="mt-24 pt-8 pb-12 bg-white/50 border-t border-brand-blush">
      <Container>
        <SectionDivider className="mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-brand-ink-muted leading-relaxed max-w-xs">
              {BRAND.tagline} — handmade in {BRAND.location}.
            </p>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="About" links={aboutLinks} />

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-brand-ink font-bold mb-4">
              Connect
            </h4>
            <ul className="space-y-2 text-sm text-brand-ink-muted">
              <li>
                <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href={BRAND.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink transition-colors">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${BRAND.email}`} className="hover:text-brand-pink transition-colors">
                  {BRAND.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-brand-blush flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-ink-muted">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="font-script text-lg text-brand-pink">Handmade with love in Madurai</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.2em] text-brand-ink font-bold mb-4">
        {title}
      </h4>
      <ul className="space-y-2 text-sm text-brand-ink-muted">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-brand-pink transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

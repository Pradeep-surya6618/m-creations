import Link from "next/link";
import { Container } from "@/components/ui/Container";
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
    <footer className="mt-24 pt-16 pb-12 bg-brand-pink-dark text-white">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" aria-label={BRAND.name} className="inline-block">
              <span className="font-script text-4xl text-white leading-none">
                {BRAND.name}
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/75 leading-relaxed max-w-xs">
              {BRAND.tagline} — handmade in {BRAND.location}.
            </p>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="About" links={aboutLinks} />

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white font-bold mb-4">
              Connect
            </h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <a
                  href={BRAND.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={BRAND.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="hover:text-white transition-colors"
                >
                  {BRAND.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <p className="font-script text-lg text-brand-blush">
            Handmade with love in Madurai
          </p>
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
      <h4 className="text-xs uppercase tracking-[0.2em] text-white font-bold mb-4">
        {title}
      </h4>
      <ul className="space-y-2 text-sm text-white/75">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

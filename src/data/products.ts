import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "mc-p-001",
    slug: "rose-garden-bouquet",
    name: "Rose Garden Bouquet",
    category: "bouquets",
    price: 499,
    images: ["/Handmade-1.jpeg", "/Handmade-2.jpeg"],
    shortDescription: "A dozen handmade pipe-cleaner roses tied with satin ribbon.",
    handmadeDetails: [
      "12 pipe-cleaner roses in soft pinks",
      "Satin ribbon wrap, hand-tied",
      "Approx. 28cm tall · 18cm wide",
    ],
    stock: 8,
    featured: true,
    createdAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "mc-p-002",
    slug: "blush-lily-bouquet",
    name: "Blush Lily Bouquet",
    category: "bouquets",
    price: 649,
    images: ["/Handmade-2.jpeg", "/Handmade-1.jpeg"],
    shortDescription: "Hand-shaped lilies in blush and ivory, gathered with kraft paper.",
    handmadeDetails: [
      "9 hand-shaped lilies",
      "Kraft paper wrap with twine",
      "Approx. 32cm tall",
    ],
    stock: 5,
    featured: true,
    createdAt: "2026-04-12T10:00:00.000Z",
  },
  {
    id: "mc-p-003",
    slug: "spring-meadow-bouquet",
    name: "Spring Meadow Bouquet",
    category: "bouquets",
    price: 899,
    images: ["/Handmade-1.jpeg"],
    shortDescription: "A wildflower-style mix of pipe cleaner blooms in soft pastels.",
    handmadeDetails: [
      "Mixed-bloom arrangement",
      "Pastel palette: blush, mint, butter",
      "Hand-tied with lace ribbon",
    ],
    stock: 3,
    createdAt: "2026-04-20T10:00:00.000Z",
  },
  {
    id: "mc-p-004",
    slug: "single-stem-rose",
    name: "Single-Stem Rose",
    category: "pipe-cleaner",
    price: 99,
    images: ["/Handmade-2.jpeg"],
    shortDescription: "A single handcrafted pipe-cleaner rose — the perfect little gift.",
    handmadeDetails: [
      "Hand-shaped petals",
      "Approx. 22cm stem",
      "Choice of pink, red, or ivory (specify on order)",
    ],
    stock: 24,
    createdAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "mc-p-005",
    slug: "trio-of-tulips",
    name: "Trio of Tulips",
    category: "pipe-cleaner",
    price: 249,
    images: ["/Handmade-1.jpeg"],
    shortDescription: "Three handcrafted tulips, tied together with a delicate ribbon.",
    handmadeDetails: [
      "Three pipe-cleaner tulips",
      "Pastel colour mix",
      "Ribbon wrap",
    ],
    stock: 12,
    featured: true,
    createdAt: "2026-05-02T10:00:00.000Z",
  },
  {
    id: "mc-p-006",
    slug: "cottage-bloom-pot",
    name: "Cottage Bloom Pot",
    category: "flower-pots",
    price: 899,
    images: ["/Handmade-1.jpeg", "/Handmade-2.jpeg"],
    shortDescription: "A miniature ceramic pot brimming with handmade flowers.",
    handmadeDetails: [
      "Ceramic pot · approx. 10cm diameter",
      "Mixed pipe-cleaner blooms",
      "Ready to display",
    ],
    stock: 4,
    createdAt: "2026-04-25T10:00:00.000Z",
  },
  {
    id: "mc-p-007",
    slug: "tiny-terrace-planter",
    name: "Tiny Terrace Planter",
    category: "flower-pots",
    price: 599,
    images: ["/Handmade-2.jpeg"],
    shortDescription: "A petite planter perfect for desks and bedside tables.",
    handmadeDetails: [
      "Hand-painted terracotta pot",
      "3 pipe-cleaner blooms",
      "Wipe-clean, no watering needed",
    ],
    stock: 7,
    createdAt: "2026-05-10T10:00:00.000Z",
  },
  {
    id: "mc-p-008",
    slug: "love-note-gift-box",
    name: "Love Note Gift Box",
    category: "gifts",
    price: 749,
    images: ["/Handmade-1.jpeg"],
    shortDescription: "A gift box with a mini bouquet and handwritten love note.",
    handmadeDetails: [
      "Mini bouquet of 5 stems",
      "Handwritten note (specify wording on order)",
      "Branded gift box",
    ],
    stock: 6,
    featured: true,
    createdAt: "2026-04-30T10:00:00.000Z",
  },
  {
    id: "mc-p-009",
    slug: "anniversary-keepsake-set",
    name: "Anniversary Keepsake Set",
    category: "gifts",
    price: 1299,
    images: ["/Handmade-2.jpeg", "/Handmade-1.jpeg"],
    shortDescription: "A keepsake bouquet paired with a candle floral piece.",
    handmadeDetails: [
      "Handmade bouquet of 7 stems",
      "Matching candle floral piece",
      "Gift-ready presentation",
    ],
    stock: 3,
    createdAt: "2026-05-15T10:00:00.000Z",
  },
  {
    id: "mc-p-010",
    slug: "birthday-blooms-set",
    name: "Birthday Blooms Set",
    category: "gifts",
    price: 599,
    images: ["/Handmade-1.jpeg"],
    shortDescription: "A bright handmade bouquet with a birthday tag.",
    handmadeDetails: [
      "Mixed-bloom mini bouquet",
      "Birthday card included",
      "Bright cheerful palette",
    ],
    stock: 9,
    createdAt: "2026-05-18T10:00:00.000Z",
  },
  {
    id: "mc-p-011",
    slug: "pink-petal-candle",
    name: "Pink Petal Candle",
    category: "candle-floral",
    price: 699,
    images: ["/Handmade-2.jpeg"],
    shortDescription: "A scented candle wrapped in handmade rose petals.",
    handmadeDetails: [
      "Soy wax · rose scent",
      "Hand-shaped petal wrap",
      "Approx. 8cm tall",
    ],
    stock: 5,
    createdAt: "2026-05-05T10:00:00.000Z",
  },
  {
    id: "mc-p-012",
    slug: "blush-glow-candle",
    name: "Blush Glow Candle",
    category: "candle-floral",
    price: 849,
    images: ["/Handmade-1.jpeg", "/Handmade-2.jpeg"],
    shortDescription: "A larger candle with a halo of handmade pink blooms.",
    handmadeDetails: [
      "Soy wax · jasmine scent",
      "Bloom halo arrangement",
      "Approx. 12cm tall",
    ],
    stock: 0,
    createdAt: "2026-05-20T10:00:00.000Z",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getRelatedProducts(
  productId: string,
  category: string,
  limit = 4
): Product[] {
  return products
    .filter((p) => p.id !== productId && p.category === category)
    .slice(0, limit);
}

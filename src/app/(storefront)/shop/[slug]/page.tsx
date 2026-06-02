import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Chip } from "@/components/ui/Chip";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { SectionDivider } from "@/components/brand/SectionDivider";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AddToCartControls } from "@/components/product/AddToCartControls";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
  getAllCategories,
} from "@/lib/catalog";

type Params = { slug: string };

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category, 4);
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug === product.category);

  return (
    <Container className="py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.2em] text-brand-ink-muted mb-6">
        <Link href="/" className="hover:text-brand-pink">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/shop" className="hover:text-brand-pink">Shop</Link>
        {category && (
          <>
            <span className="mx-2">›</span>
            <Link
              href={`/shop?category=${category.slug}`}
              className="hover:text-brand-pink"
            >
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="flex flex-col gap-6">
          {category && (
            <Chip variant="category" className="self-start">
              {category.name}
            </Chip>
          )}
          <ScriptHeading as="h1">{product.name}</ScriptHeading>
          <ProductPrice amount={product.price} size="lg" />
          <p className="text-brand-ink-muted leading-relaxed">
            {product.shortDescription}
          </p>

          {product.handmadeDetails.length > 0 && (
            <div className="mt-2 pt-6 border-t border-brand-blush">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-ink-muted font-semibold mb-3">
                Handmade Details
              </p>
              <ul className="space-y-2">
                {product.handmadeDetails.map((detail, i) => (
                  <li key={i} className="flex gap-3 text-sm text-brand-ink">
                    <span className="text-brand-pink flex-shrink-0">✿</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-2 pt-6 border-t border-brand-blush">
            <AddToCartControls productId={product.id} stock={product.stock} />
            {product.stock > 0 && product.stock < 5 && (
              <p className="mt-3 text-xs text-brand-pink font-semibold">
                Only {product.stock} left — made by hand, limited quantity
              </p>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <SectionDivider className="my-16" />
          <ScriptHeading as="h2">You may also love</ScriptHeading>
          <div className="mt-8">
            <ProductGrid>
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  categoryLabel={categories.find((c) => c.slug === p.category)?.name.toUpperCase()}
                />
              ))}
            </ProductGrid>
          </div>
        </>
      )}
    </Container>
  );
}

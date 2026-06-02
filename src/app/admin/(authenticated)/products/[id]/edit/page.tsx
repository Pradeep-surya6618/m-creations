import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import { getAllCategories } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import type { ProductDoc } from "@/types/catalog";

export const metadata: Metadata = { title: "Admin · Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // `id` here is the public productId (e.g. "mc-p-001"). We resolve to
  // the Mongo _id below and hand THAT to the update/delete actions.
  const db = await getDb();
  const doc = await db.collection<ProductDoc>("products").findOne({ productId: id });
  if (!doc) notFound();

  const categories = await getAllCategories();
  return (
    <div className="space-y-10 max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold">Edit {doc.name}</h1>
        <p className="text-xs text-brand-ink-muted mt-1 font-mono">{doc.productId}</p>
      </header>
      <ProductForm
        categories={categories}
        mode="edit"
        productMongoId={doc._id.toHexString()}
        initial={{
          name: doc.name,
          slug: doc.slug,
          category: doc.category,
          price: doc.price,
          stock: doc.stock,
          featured: doc.featured,
          shortDescription: doc.shortDescription,
          handmadeDetails: doc.handmadeDetails,
          images: doc.images.map((id) => id.toHexString()),
        }}
      />
      <div className="pt-8 border-t border-brand-blush">
        <DeleteProductButton productMongoId={doc._id.toHexString()} productName={doc.name} />
      </div>
    </div>
  );
}

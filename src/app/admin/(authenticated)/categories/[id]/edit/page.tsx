import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { CategoryDoc } from "@/types/catalog";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

export const metadata = { title: "Admin · Edit Category" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();
  const db = await getDb();
  const doc = await db.collection<CategoryDoc>("categories").findOne({ _id: new ObjectId(id) });
  if (!doc) notFound();

  // How many products still reference this category — drives the delete
  // confirmation dialog (info vs. danger variant).
  const productCount = await db
    .collection("products")
    .countDocuments({ category: doc.slug });

  return (
    <div className="space-y-6 w-full">
      <AdminBackLink href="/admin/categories" label="Categories" />
      <h1 className="text-2xl font-bold">Edit {doc.name}</h1>
      <CategoryForm
        mode="edit"
        mongoId={id}
        productCount={productCount}
        initial={{
          name: doc.name,
          slug: doc.slug,
          description: doc.description,
          image: doc.image ? doc.image.toHexString() : null,
        }}
      />
    </div>
  );
}

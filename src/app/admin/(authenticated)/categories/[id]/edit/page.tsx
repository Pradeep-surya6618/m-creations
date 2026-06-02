import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { CategoryDoc } from "@/types/catalog";
import { CategoryForm } from "@/components/admin/CategoryForm";

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

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Edit {doc.name}</h1>
      <CategoryForm
        mode="edit"
        mongoId={id}
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

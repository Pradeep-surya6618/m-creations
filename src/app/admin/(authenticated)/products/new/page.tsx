import type { Metadata } from "next";
import { getAllCategories } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Admin · New Product" };

export default async function NewProductPage() {
  const categories = await getAllCategories();
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">New product</h1>
      <ProductForm categories={categories} mode="create" />
    </div>
  );
}

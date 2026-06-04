import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata = { title: "Admin · New Category" };

export default function NewCategoryPage() {
  return (
    <div className="space-y-6 w-full">
      <h1 className="text-2xl font-bold">New category</h1>
      <CategoryForm mode="create" />
    </div>
  );
}

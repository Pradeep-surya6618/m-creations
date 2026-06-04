import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

export const metadata = { title: "Admin · New Category" };

export default function NewCategoryPage() {
  return (
    <div className="space-y-6 w-full">
      <AdminBackLink href="/admin/categories" label="Categories" />
      <h1 className="text-2xl font-bold">New category</h1>
      <CategoryForm mode="create" />
    </div>
  );
}

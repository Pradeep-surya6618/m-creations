import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminSession";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileTopbar } from "@/components/admin/AdminMobileTopbar";
import { AdminToaster } from "@/components/admin/AdminToaster";
import { getDb } from "@/lib/mongodb";

async function countPendingVerifications(): Promise<number> {
  try {
    const db = await getDb();
    return await db.collection("orders").countDocuments({ paymentStatus: "Verification Pending" });
  } catch {
    return 0;
  }
}

export default async function AdminAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const pendingCount = await countPendingVerifications();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-cream text-brand-ink">
      <AdminSidebar adminEmail={session.email} pendingCount={pendingCount} />
      <AdminMobileTopbar adminEmail={session.email} pendingCount={pendingCount} />
      <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
      <AdminToaster />
    </div>
  );
}

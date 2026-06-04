import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminSession";
import { AdminAppBar } from "@/components/admin/AdminAppBar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBottomBar } from "@/components/admin/AdminBottomBar";
import { AdminToaster } from "@/components/admin/AdminToaster";
import { MotionProvider } from "@/components/motion/MotionProvider";
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
    <MotionProvider>
      <div className="min-h-screen bg-brand-cream text-brand-ink">
        <AdminAppBar adminEmail={session.email} pendingCount={pendingCount} />
        <div className="flex">
          <AdminSidebar pendingCount={pendingCount} />
          {/* Bottom padding on mobile so content isn't hidden behind the fixed bottom bar */}
          <main className="flex-1 min-w-0 p-4 md:p-8 pb-24 md:pb-8">{children}</main>
        </div>
        <AdminBottomBar pendingCount={pendingCount} />
        <AdminToaster />
      </div>
    </MotionProvider>
  );
}

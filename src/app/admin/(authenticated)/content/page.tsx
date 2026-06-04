import type { Metadata } from "next";
import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminCard";

export const metadata: Metadata = { title: "Admin · Content" };

export default function ContentHubPage() {
  return (
    <div className="space-y-6 w-full">
      <h1 className="text-2xl font-bold">Content</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminCard>
          <h2 className="font-script text-2xl text-brand-pink">About page</h2>
          <p className="mt-2 text-sm text-brand-ink-muted">Edit the page copy, image, and eyebrow.</p>
          <Link href="/admin/content/about" className="mt-4 inline-block text-brand-pink font-semibold cursor-pointer">Edit →</Link>
        </AdminCard>
        <AdminCard>
          <h2 className="font-script text-2xl text-brand-pink">Hero</h2>
          <p className="mt-2 text-sm text-brand-ink-muted">Swap the right-side image and edit the eyebrow, tagline, and badge.</p>
          <Link href="/admin/content/hero" className="mt-4 inline-block text-brand-pink font-semibold cursor-pointer">Edit →</Link>
        </AdminCard>
      </div>
    </div>
  );
}

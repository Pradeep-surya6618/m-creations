import { getAboutContent } from "@/lib/content";
import { AboutEditor } from "@/components/admin/AboutEditor";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

export const metadata = { title: "Admin · About" };

export default async function AboutPage() {
  const c = await getAboutContent();
  // ImagePicker expects ObjectId hex, but getAboutContent returns the URL.
  // Strip back to hex for the form's initial value.
  const imageHex =
    c.image && c.image.startsWith("/api/images/") ? c.image.replace("/api/images/", "") : null;
  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/content" label="Content" />
      <h1 className="text-2xl font-bold">About page</h1>
      <AboutEditor initial={{ body: c.body, image: imageHex, eyebrow: c.eyebrow }} />
    </div>
  );
}

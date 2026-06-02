import { getHeroContent } from "@/lib/content";
import { HeroEditor } from "@/components/admin/HeroEditor";

export const metadata = { title: "Admin · Hero" };

export default async function HeroEditorPage() {
  const h = await getHeroContent();
  const imageHex =
    h.image && h.image.startsWith("/api/images/") ? h.image.replace("/api/images/", "") : null;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hero</h1>
      <HeroEditor initial={{
        image: imageHex,
        eyebrow: h.eyebrow,
        tagline: h.tagline,
        badgeLabel: h.badgeLabel,
        badgeText: h.badgeText,
      }} />
    </div>
  );
}

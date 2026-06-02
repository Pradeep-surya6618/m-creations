import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PageTransition } from "@/components/motion/PageTransition";
import { getAllProducts } from "@/lib/catalog";
import { StorefrontToaster } from "@/components/storefront/StorefrontToaster";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const products = await getAllProducts();
  return (
    <MotionProvider>
      <Navbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <CartDrawer products={products} />
      <StorefrontToaster />
    </MotionProvider>
  );
}

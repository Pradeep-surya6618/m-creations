import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your handmade flower order and complete payment.",
};

export default function CheckoutPage() {
  return (
    <MotionProvider>
      <Navbar />
      <main className="flex-1">
        <Container className="py-12 lg:py-20 max-w-2xl">
          <div className="text-center">
            <ScriptHeading as="h1" align="center" ornament>
              Checkout opens soon 🌸
            </ScriptHeading>
            <p className="mt-6 text-base text-brand-ink-muted leading-relaxed">
              We&apos;re finishing up the secure checkout experience. Your cart is saved — come back
              any time and it&apos;ll be waiting for you. For urgent orders, message us on Instagram
              or WhatsApp.
            </p>
          </div>

          <div className="mt-12">
            <CheckoutPreview />
          </div>

          <div className="mt-10 flex justify-center">
            <Button href="/shop" variant="gradient" size="lg">Continue shopping</Button>
          </div>
        </Container>
      </main>
      <Footer />
      <CartDrawer />
    </MotionProvider>
  );
}

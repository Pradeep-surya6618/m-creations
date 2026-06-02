import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CheckoutEmptyGuard } from "@/components/checkout/CheckoutEmptyGuard";
import { getAllProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery details to place your handmade flower order.",
};

export default async function CheckoutPage() {
  const products = await getAllProducts();
  return (
    <MotionProvider>
      <Navbar />
      <main className="flex-1">
        <Container className="py-12 lg:py-16">
          <ScriptHeading as="h1">Checkout</ScriptHeading>
          <CheckoutEmptyGuard>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 items-start">
              <CheckoutForm />
              <div className="lg:sticky lg:top-28">
                <OrderSummary products={products} />
              </div>
            </div>
          </CheckoutEmptyGuard>
        </Container>
      </main>
      <Footer />
      <CartDrawer products={products} />
    </MotionProvider>
  );
}

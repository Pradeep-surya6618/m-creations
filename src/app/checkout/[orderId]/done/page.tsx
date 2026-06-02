import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getOrderByOrderId } from "@/lib/orders";
import { StorefrontToaster } from "@/components/storefront/StorefrontToaster";

export const metadata: Metadata = {
  title: "Order Received",
};

export default async function OrderDonePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderByOrderId(orderId);
  if (!order) notFound();

  return (
    <MotionProvider>
      <Navbar />
      <main className="flex-1">
        <Container className="py-12 lg:py-20 max-w-2xl">
          <div className="text-center">
            <ScriptHeading as="h1" align="center" ornament>Order received 🌸</ScriptHeading>
            <p className="mt-4 inline-block rounded-full bg-brand-pink-dark text-white text-xs font-bold tracking-[0.1em] px-4 py-1.5">
              ORDER {order.orderId}
            </p>
            <p className="mt-6 text-base text-brand-ink-muted leading-relaxed">
              Thank you, {order.customer.name.split(" ")[0]}! We&apos;ve received your payment proof and
              will verify it shortly. Your handmade flowers are on their way to being made just for you.
            </p>
          </div>

          <div className="mt-10 bg-white/85 rounded-2xl p-6 shadow-petal-sm border border-white/60">
            <h2 className="text-xs uppercase tracking-[0.2em] text-brand-ink font-bold mb-5">Your Order</h2>
            <ul className="divide-y divide-brand-blush">
              {order.items.map((item) => (
                <li key={item.productId} className="flex gap-3 py-3">
                  <div className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-brand-blush">
                    <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-brand-ink leading-tight">{item.name}</p>
                      <p className="text-xs text-brand-ink-muted">Qty {item.quantity}</p>
                    </div>
                    <ProductPrice amount={item.price * item.quantity} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-4 border-t border-brand-blush flex justify-between items-center">
              <span className="text-sm uppercase tracking-[0.15em] text-brand-ink-muted">Total Paid</span>
              <ProductPrice amount={order.totalAmount} size="lg" />
            </div>
            {/* Masked delivery info — full address lives in the admin (Phase 3) */}
            <p className="mt-5 pt-4 border-t border-brand-blush text-xs text-brand-ink-muted">
              Delivering to {order.customer.name} · {order.customer.city}
            </p>
          </div>

          <div className="mt-10 text-center">
            <Button href="/shop" variant="gradient" size="lg">Continue shopping</Button>
          </div>
        </Container>
      </main>
      <Footer />
      <StorefrontToaster />
    </MotionProvider>
  );
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { UpiQr } from "@/components/checkout/UpiQr";
import { PaymentUpload } from "@/components/checkout/PaymentUpload";
import { getOrderByOrderId } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Complete Payment",
};

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderByOrderId(orderId);
  if (!order) notFound();
  if (order.paymentStatus !== "Pending") {
    redirect(`/checkout/${orderId}/done`);
  }

  return (
    <MotionProvider>
      <Navbar />
      <main className="flex-1">
        <Container className="py-12 lg:py-16 max-w-4xl">
          <div className="text-center mb-10">
            <ScriptHeading as="h1" align="center">Thank you 🌸</ScriptHeading>
            <p className="mt-3 inline-block rounded-full bg-brand-pink-dark text-white text-xs font-bold tracking-[0.1em] px-4 py-1.5">
              ORDER {order.orderId}
            </p>
            <p className="mt-4 text-sm text-brand-ink-muted max-w-md mx-auto">
              Please complete payment using the QR code and upload your payment screenshot to confirm.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <section className="bg-white border border-brand-blush rounded-2xl p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-brand-pink-dark font-bold mb-5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-pink text-white text-[10px]">1</span>
                Pay via UPI
              </div>
              <UpiQr amount={order.totalAmount} orderId={order.orderId} />
            </section>

            <section className="bg-white border border-brand-blush rounded-2xl p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-brand-pink-dark font-bold mb-5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-pink text-white text-[10px]">2</span>
                Confirm payment
              </div>
              <PaymentUpload orderId={order.orderId} />
            </section>
          </div>
        </Container>
      </main>
      <Footer />
      <CartDrawer />
    </MotionProvider>
  );
}

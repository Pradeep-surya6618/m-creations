import Image from "next/image";
import { buildUpiUri, generateQrDataUrl } from "@/lib/upi";
import { ProductPrice } from "@/components/product/ProductPrice";
import { CopyableUpiId } from "./CopyableUpiId";

type Props = { amount: number; orderId: string };

export async function UpiQr({ amount, orderId }: Props) {
  const upiId = process.env.NEXT_PUBLIC_UPI_ID ?? "";
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME ?? "Maria Creations";
  const uri = buildUpiUri({ payeeId: upiId, payeeName: upiName, amount, note: orderId });
  const qr = await generateQrDataUrl(uri);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-48 w-48 rounded-2xl overflow-hidden border-4 border-white shadow-petal-md bg-white">
        {/* qrcode data-url is a trusted, locally-generated PNG */}
        <Image src={qr} alt={`UPI QR for order ${orderId}`} fill sizes="192px" unoptimized />
      </div>
      <div className="mt-4">
        <ProductPrice amount={amount} size="lg" />
      </div>
      {upiId && (
        <div className="mt-3">
          <CopyableUpiId upiId={upiId} />
        </div>
      )}
      <ul className="mt-4 text-left text-xs text-brand-ink-muted space-y-1">
        <li className="flex gap-2"><span className="text-brand-pink">✿</span> Scan with any UPI app (GPay, PhonePe, Paytm)</li>
        <li className="flex gap-2"><span className="text-brand-pink">✿</span> Amount is pre-filled — please don&apos;t change it</li>
      </ul>
    </div>
  );
}

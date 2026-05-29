import QRCode from "qrcode";

export type UpiParams = {
  payeeId: string;
  payeeName: string;
  amount: number;
  note: string;
};

export function buildUpiUri({ payeeId, payeeName, amount, note }: UpiParams): string {
  const parts = [
    `pa=${encodeURIComponent(payeeId)}`,
    `pn=${encodeURIComponent(payeeName)}`,
    `am=${encodeURIComponent(String(amount))}`,
    `tn=${encodeURIComponent(note)}`,
    `cu=INR`,
  ];
  return `upi://pay?${parts.join("&")}`;
}

/** Render the UPI URI to a PNG data-URL (server-side). */
export async function generateQrDataUrl(upiUri: string): Promise<string> {
  return QRCode.toDataURL(upiUri, {
    width: 320,
    margin: 1,
    color: { dark: "#2a1620", light: "#ffffff" },
  });
}

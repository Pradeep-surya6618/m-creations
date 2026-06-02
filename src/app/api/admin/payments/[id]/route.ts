import { requireAdminSession } from "@/lib/adminSession";
import { getPaymentById } from "@/lib/payments";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const payment = await getPaymentById(id);
  if (!payment) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(payment.bytes), {
    headers: {
      "Content-Type": payment.contentType,
      "Cache-Control": "private, no-store",
    },
  });
}

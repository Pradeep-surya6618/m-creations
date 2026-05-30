import { getOrderByOrderId, markPaymentUploaded } from "@/lib/orders";
import { savePaymentScreenshot } from "@/lib/payments";
import { isAllowedImage } from "@/lib/upload";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const order = await getOrderByOrderId(orderId);
  if (!order) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.paymentStatus !== "Pending") {
    return Response.json({ error: "Payment already submitted." }, { status: 409 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  const utrRaw = formData.get("utr");
  const utr =
    typeof utrRaw === "string" && utrRaw.trim() !== "" ? utrRaw.trim() : undefined;

  if (!(file instanceof File)) {
    return Response.json({ error: "No screenshot provided." }, { status: 400 });
  }

  const check = isAllowedImage(file.type, file.size);
  if (!check.ok) {
    return Response.json({ error: check.error }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const screenshotId = await savePaymentScreenshot({
      orderId,
      bytes,
      contentType: file.type,
    });
    await markPaymentUploaded({ orderId, screenshotId, utr });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("payment upload failed:", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}

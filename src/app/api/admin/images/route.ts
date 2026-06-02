import { requireAdminSession } from "@/lib/adminSession";
import { isAllowedProductImage } from "@/lib/upload";
import { saveImage } from "@/lib/images";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No image provided." }, { status: 400 });
  }

  const check = isAllowedProductImage(file.type, file.size);
  if (!check.ok) {
    return Response.json({ error: check.error }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const id = await saveImage({ bytes, contentType: file.type });
    return Response.json({ id });
  } catch (err) {
    console.error("admin image upload failed:", err);
    return Response.json({ error: "Upload failed. Try again." }, { status: 500 });
  }
}

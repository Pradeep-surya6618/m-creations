import { Binary, ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import type { ImageDoc } from "@/types/catalog";

type ImageDocWithData = ImageDoc & { data: Binary };

async function col() {
  return (await getDb()).collection<ImageDocWithData>("images");
}

export async function saveImage(args: {
  bytes: Buffer;
  contentType: string;
  width?: number;
  height?: number;
}): Promise<string> {
  const c = await col();
  const _id = new ObjectId();
  await c.insertOne({
    _id,
    data: new Binary(args.bytes),
    contentType: args.contentType,
    size: args.bytes.length,
    width: args.width,
    height: args.height,
    createdAt: new Date(),
  });
  return _id.toHexString();
}

export async function getImageById(
  hexId: string
): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!ObjectId.isValid(hexId)) return null;
  const c = await col();
  const doc = await c.findOne({ _id: new ObjectId(hexId) });
  if (!doc) return null;
  return { bytes: Buffer.from(doc.data.buffer), contentType: doc.contentType };
}

export async function deleteImage(hexId: string): Promise<void> {
  if (!ObjectId.isValid(hexId)) return;
  const c = await col();
  await c.deleteOne({ _id: new ObjectId(hexId) });
}

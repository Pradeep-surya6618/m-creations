export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function isAllowedImage(type: string, size: number): ValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(type)) {
    return { ok: false, error: "Please upload a JPG, PNG, or WebP image." };
  }
  if (size <= 0) {
    return { ok: false, error: "The file appears to be empty." };
  }
  if (size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "Image must be 2MB or smaller." };
  }
  return { ok: true };
}

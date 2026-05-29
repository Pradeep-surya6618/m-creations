import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  addressLine1: z.string().trim().min(1, "Address is required").max(120),
  addressLine2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(60),
  state: z.string().trim().min(1, "State is required").max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

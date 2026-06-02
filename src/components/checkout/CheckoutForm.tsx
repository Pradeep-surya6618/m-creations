"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/checkout";
import { createOrder } from "@/actions/createOrder";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";

const fieldBase =
  "w-full rounded-xl border border-brand-blush bg-white px-4 py-3 text-sm text-brand-ink " +
  "placeholder:text-brand-ink-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink";

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({ resolver: zodResolver(checkoutSchema) });

  const onSubmit = async (data: CheckoutInput) => {
    const result = await createOrder({
      customer: data,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
    if (result.ok) {
      router.push(`/checkout/${result.orderId}`);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Full Name" error={errors.name?.message}>
        <input className={fieldBase} placeholder="Your name" {...register("name")} />
      </Field>
      <Field label="Phone" error={errors.phone?.message}>
        <input className={fieldBase} inputMode="numeric" placeholder="10-digit mobile number" {...register("phone")} />
      </Field>
      <Field label="Address Line 1" error={errors.addressLine1?.message}>
        <input className={fieldBase} placeholder="House no., street" {...register("addressLine1")} />
      </Field>
      <Field label="Address Line 2 (optional)" error={errors.addressLine2?.message}>
        <input className={fieldBase} placeholder="Area, landmark" {...register("addressLine2")} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="City" error={errors.city?.message}>
          <input className={fieldBase} placeholder="City" {...register("city")} />
        </Field>
        <Field label="State" error={errors.state?.message}>
          <input className={fieldBase} placeholder="State" {...register("state")} />
        </Field>
      </div>
      <Field label="Pincode" error={errors.pincode?.message}>
        <input className={fieldBase} inputMode="numeric" placeholder="6-digit pincode" {...register("pincode")} />
      </Field>

      <Button type="submit" variant="gradient" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Placing order…" : "Place Order"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-semibold mb-2">
        {label}
      </span>
      {children}
      {error && <span className="block mt-1 text-xs text-brand-pink">{error}</span>}
    </label>
  );
}

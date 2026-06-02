export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered";
export type PaymentStatus = "Pending" | "Verification Pending" | "Paid" | "Rejected";

export type CustomerInfo = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

/** Shape stored in MongoDB (without the driver's ObjectId typing here). */
export type OrderRecord = {
  orderId: string;
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  payment?: {
    screenshotId: string;
    utr?: string;
    uploadedAt: string; // ISO
  };
  verification?: {
    verifiedAt?: string;   // ISO
    rejectedAt?: string;   // ISO
    notes?: string;
  };
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

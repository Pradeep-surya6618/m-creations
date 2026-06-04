"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Reads a one-shot welcome message written by /admin/login (via sessionStorage)
 * and flashes it as a success toast on the first dashboard render. The login
 * page can't show the toast itself because its <Toaster /> unmounts during the
 * router.push, killing the toast queue mid-flight.
 */
export function WelcomeFlash() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const msg = sessionStorage.getItem("mc:admin-welcome");
    if (!msg) return;
    sessionStorage.removeItem("mc:admin-welcome");
    toast.success(msg);
  }, []);
  return null;
}

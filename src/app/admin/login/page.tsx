import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { AdminCard } from "@/components/admin/AdminCard";
import { LoginForm } from "@/components/admin/LoginForm";
import { AdminToaster } from "@/components/admin/AdminToaster";

export const metadata: Metadata = {
  title: "Admin · Sign in",
};

export default function AdminLoginPage() {
  return (
    <>
      <AdminToaster />
      <main className="min-h-screen flex items-center justify-center bg-brand-cream">
        <Container className="max-w-md py-12">
          <div className="text-center mb-8">
            <ScriptHeading as="h1" align="center">Welcome back</ScriptHeading>
            <p className="mt-3 text-sm text-brand-ink-muted">Sign in to manage the boutique.</p>
          </div>
          <AdminCard>
            <LoginForm />
          </AdminCard>
        </Container>
      </main>
    </>
  );
}

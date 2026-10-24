import { AdminNav } from "@/components/admin-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/40 bg-card px-4 py-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Admin view.</span> The team&apos;s notes for presenting Cargo Window. Users of the console never need these pages.
        </p>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}

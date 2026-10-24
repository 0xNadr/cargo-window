import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHome() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Link href="/admin/deck/">
        <Card className="h-full transition-colors hover:border-primary">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-wide uppercase">Pitch deck</CardTitle>
            <CardDescription>The full idea pitch as slides, with speaker notes and full-screen presenting.</CardDescription>
          </CardHeader>
        </Card>
      </Link>
      <Link href="/admin/idea/">
        <Card className="h-full transition-colors hover:border-primary">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-wide uppercase">The idea</CardTitle>
            <CardDescription>The challenge&apos;s seven questions answered, what is original, and the technology choices.</CardDescription>
          </CardHeader>
        </Card>
      </Link>
      <Link href="/admin/pitch/">
        <Card className="h-full transition-colors hover:border-primary">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-wide uppercase">Pitch &amp; demo</CardTitle>
            <CardDescription>The five-minute run sheet, the demo click path, scoring, jury questions and the stage checklist.</CardDescription>
          </CardHeader>
        </Card>
      </Link>
    </div>
  );
}

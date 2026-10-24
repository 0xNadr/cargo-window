"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MISSION_DATE, d, type BaseId, type Priority } from "@/lib/engine";
import type { BookingRow } from "@/lib/scenario";

const DESTINATIONS = [
  { value: "mars", label: "Ares Outpost, Mars" },
  { value: "moon", label: "Shackleton Base, Moon" },
];
const PRIORITIES = [
  { value: "life", label: "P1 Life-critical" },
  { value: "mission", label: "P2 Mission-critical" },
  { value: "commercial", label: "P3 Commercial" },
];

export function ManualBookingDialog({ onBook }: { onBook: (row: BookingRow) => void }) {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState("Ice prospecting drill");
  const [shipper, setShipper] = useState("Kepler Mining");
  const [dest, setDest] = useState<BaseId>("mars");
  const [priority, setPriority] = useState<Priority>("commercial");
  const [mass, setMass] = useState("600");
  const [vol, setVol] = useState("3");
  const [needed, setNeeded] = useState("2036-06-01");
  const [bid, setBid] = useState("95000");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const problems: string[] = [];
    if (!item.trim()) problems.push("name the load");
    if (!shipper.trim()) problems.push("name the shipper");
    if (!(Number(mass) > 0)) problems.push("enter a mass above 0 kg");
    if (!(Number(vol) > 0)) problems.push("enter a volume above 0 m³");
    if (!needed || !(d(needed) > MISSION_DATE)) problems.push("pick a need date after 02 May 2035");
    if (priority === "commercial" && !(Number(bid) > 0)) problems.push("enter a bid per kg");
    if (problems.length) {
      setError(`To book this load, ${problems.join(", ")}.`);
      return;
    }
    setError("");
    onBook([dest, item.trim(), shipper.trim(), priority, Math.round(Number(mass)), Math.round(Number(vol) * 10) / 10, needed, priority === "commercial" ? Math.round(Number(bid)) : undefined]);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <PlusIcon /> Add cargo by hand
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add cargo by hand</DialogTitle>
            <DialogDescription>For a load you already know every detail of. The planner puts it on the first flight with room.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="m-item">Load</Label>
              <Input id="m-item" value={item} onChange={(e) => setItem(e.target.value)} />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="m-shipper">Shipper</Label>
              <Input id="m-shipper" value={shipper} onChange={(e) => setShipper(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Destination</Label>
              <Select items={DESTINATIONS} value={dest} onValueChange={(v) => v && setDest(v as BaseId)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DESTINATIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Priority</Label>
              <Select items={PRIORITIES} value={priority} onValueChange={(v) => v && setPriority(v as Priority)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="m-mass">Mass (kg)</Label>
              <Input id="m-mass" type="number" min={1} value={mass} onChange={(e) => setMass(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="m-vol">Volume (m³)</Label>
              <Input id="m-vol" type="number" min={0.1} step={0.1} value={vol} onChange={(e) => setVol(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="m-needed">Needed at base by</Label>
              <Input id="m-needed" type="date" min="2035-05-03" value={needed} onChange={(e) => setNeeded(e.target.value)} />
            </div>
            {priority === "commercial" && (
              <div className="grid gap-1.5">
                <Label htmlFor="m-bid">Bid ($ per kg)</Label>
                <Input id="m-bid" type="number" min={1} step={1000} value={bid} onChange={(e) => setBid(e.target.value)} />
              </div>
            )}
          </div>
          {error && <p className="text-sm text-late">{error}</p>}
          <DialogFooter>
            <Button type="submit">Book load</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

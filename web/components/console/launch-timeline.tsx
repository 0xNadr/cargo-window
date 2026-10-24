"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BASES, FLIGHTS, MISSION_DATE, arrival, d, flightsFor, statusOf, type BaseId, type Booking, type Plan } from "@/lib/engine";
import { fmtDate, gapText } from "@/lib/format";
import { cn } from "@/lib/utils";

const W = 1000;
const H = 188;
const X0 = 150;
const X1 = 984;
const T0 = d("2035-05-01");
const T1 = d("2038-05-01");
const LANE: Record<BaseId, number> = { moon: 66, mars: 132 };
const x = (t: number) => +(X0 + ((t - T0) / (T1 - T0)) * (X1 - X0)).toFixed(1);

export function LaunchTimeline({ bookings, plan, selected, onSelect }: { bookings: Booking[]; plan: Plan; selected: string; onSelect: (id: string) => void }) {
  const mars = flightsFor("mars");
  const moonFirst = new Set(flightsFor("moon").slice(0, 3).map((f) => f.id));
  const lateRow: Record<BaseId, number> = { moon: 0, mars: 0 };
  const lateLines = bookings.flatMap((b) => {
    const st = statusOf(b, plan);
    if (st.kind !== "late" || !st.flight || lateRow[b.dest] >= 5) return [];
    return [{ b, arrive: st.arrive!, y: LANE[b.dest] + 21 + lateRow[b.dest]++ * 7 }];
  });

  return (
    <Card className="gap-3 pb-4">
      <CardHeader>
        <CardTitle className="label-caps text-sm">Launch windows, May 2035 to May 2038</CardTitle>
        <CardDescription>
          Flights to the Moon leave every four weeks. To Mars, the planets only line up about every 26 months. Click a launch to open its manifest.
        </CardDescription>
      </CardHeader>
      <div className="overflow-x-auto px-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[720px] font-mono" role="img" aria-label="Launch timeline from May 2035 to May 2038. Moon flights every four weeks; Mars flights in June 2035 and August 2037.">
          <defs>
            <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="2" height="7" className="fill-border" />
            </pattern>
          </defs>
          {[2036, 2037, 2038].map((y) => {
            const gx = x(d(`${y}-01-01`));
            return (
              <g key={y}>
                <line x1={gx} x2={gx} y1={30} y2={H - 4} className="stroke-border" />
                <text x={gx + 5} y={24} className="fill-muted-foreground text-[11px]">{y}</text>
              </g>
            );
          })}
          <line x1={x(MISSION_DATE)} x2={x(MISSION_DATE)} y1={30} y2={H - 4} className="stroke-primary" strokeDasharray="3 3" />
          <text x={x(MISSION_DATE) + 5} y={24} className="fill-primary text-[10.5px] tracking-widest">TODAY</text>
          {(Object.keys(LANE) as BaseId[]).map((base) => (
            <g key={base}>
              <text x={2} y={LANE[base] - 3} className="fill-foreground text-[12px] font-medium tracking-wider">EARTH → {BASES[base].body.toUpperCase()}</text>
              <text x={2} y={LANE[base] + 12} className="fill-muted-foreground text-[10.5px]">{BASES[base].transitDays}-DAY TRIP</text>
              <line x1={X0} x2={X1} y1={LANE[base]} y2={LANE[base]} className="stroke-input" strokeWidth={1.5} />
            </g>
          ))}
          {mars.slice(0, -1).map((f, i) => {
            const a = x(f.launch);
            const b = x(mars[i + 1].launch);
            return (
              <g key={f.id}>
                <rect x={a} y={LANE.mars - 13} width={b - a} height={26} fill="url(#hatch)" />
                <text x={(a + b) / 2} y={LANE.mars - 20} textAnchor="middle" className="fill-muted-foreground text-[11px] tracking-wider">
                  NO MARS LAUNCH POSSIBLE FOR {gapText(mars[i + 1].launch - f.launch).toUpperCase()}
                </text>
              </g>
            );
          })}
          {mars.map((f) => (
            <rect key={f.id} x={x(f.launch)} y={LANE.mars - 3} width={x(arrival(f)) - x(f.launch)} height={6} className="fill-mission opacity-50" />
          ))}
          {FLIGHTS.map((f) => {
            const big = f.dest === "mars";
            const r = big ? 6.5 : 3.5;
            const cx = x(f.launch);
            const cy = LANE[f.dest];
            const loaded = plan.manifests.get(f.id)!.loaded.length > 0;
            const focusable = big || moonFirst.has(f.id);
            return (
              <g
                key={f.id}
                role="button"
                tabIndex={focusable ? 0 : undefined}
                aria-label={`Flight ${f.id}, launches ${fmtDate(f.launch)}`}
                className="group cursor-pointer outline-none"
                onClick={() => onSelect(f.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(f.id);
                  }
                }}
              >
                <circle cx={cx} cy={cy} r={r + 5} className={cn("fill-transparent stroke-2", f.id === selected ? "stroke-primary" : "stroke-transparent group-focus-visible:stroke-primary")} />
                <circle cx={cx} cy={cy} r={r} strokeWidth={1.5} className={cn(loaded ? "fill-life stroke-life" : "fill-background stroke-mission", "group-hover:stroke-primary")} />
                {big && (
                  <text x={cx} y={cy - 20} textAnchor="middle" className="fill-foreground text-[11px] tracking-wider">{f.id}</text>
                )}
              </g>
            );
          })}
          {lateLines.map(({ b, arrive, y }) => (
            <g key={b.id}>
              <line x1={x(b.neededBy)} x2={x(arrive)} y1={y} y2={y} className="stroke-late" strokeWidth={2} />
              <circle cx={x(b.neededBy)} cy={y} r={3} strokeWidth={1.5} className="fill-background stroke-late" />
              <circle cx={x(arrive)} cy={y} r={3} className="fill-late" />
            </g>
          ))}
        </svg>
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 px-4 font-mono text-xs text-muted-foreground">
        <li className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-life" /> Launch with cargo</li>
        <li className="flex items-center gap-2"><span className="h-1.5 w-5 bg-mission/50" /> In transit to Mars</li>
        <li className="flex items-center gap-2"><span className="h-2.5 w-5 bg-[repeating-linear-gradient(45deg,var(--border)_0_2px,transparent_2px_5px)]" /> No launch possible</li>
        <li className="flex items-center gap-2"><span className="h-0.5 w-5 bg-late" /> Late load: needed, then arrives</li>
      </ul>
    </Card>
  );
}

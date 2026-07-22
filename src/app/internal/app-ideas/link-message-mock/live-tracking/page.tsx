import Link from "next/link";

import {
  liveTrackingEvents,
  liveTrackingRoute,
  liveTrackingSummary,
  type RoutePoint,
} from "../mockOfficeData";

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  alertCount?: number;
  active?: boolean;
};

type MapCoordinate = {
  x: number;
  y: number;
};

const sidebarItems: SidebarItem[] = [
  { label: "Duty Execution", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Planning", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Vehicle view", icon: "🚛", href: "/internal/app-ideas/link-message-mock" },
  { label: "Trailer view", icon: "▰", href: "/internal/app-ideas/link-message-mock" },
  { label: "Fleet view", icon: "▱", href: "/internal/app-ideas/link-message-mock" },
  { label: "Comms", icon: "💬", href: "/internal/app-ideas/link-message-mock/comms", alertCount: 16 },
  { label: "Debrief", icon: "🧾", href: "/internal/app-ideas/link-message-mock/debrief" },
  { label: "RHC Team", icon: "RHC", href: "/internal/app-ideas/link-message-mock/rhc-team" },
  { label: "Live Tracking", icon: "GPS", href: "/internal/app-ideas/link-message-mock/live-tracking", active: true },
  { label: "Reports", icon: "REP", href: "/internal/app-ideas/link-message-mock/reports" },
  { label: "A&D Dashboard", icon: "A&D", href: "/internal/app-ideas/link-message-mock/arrivals-departures" },
];

const landscapeMapPath = "M38 182 C 72 172, 94 154, 112 142 C 135 126, 151 106, 174 94 C 203 79, 226 74, 247 56 C 266 40, 286 34, 309 28";

const landscapeCoordinates: Record<string, MapCoordinate> = {
  "Warrington MC": { x: 38, y: 182 },
  "North West Hub": { x: 112, y: 142 },
  Skelmersdale: { x: 174, y: 94 },
  "Current position": { x: 247, y: 56 },
  "Preston VOC": { x: 309, y: 28 },
};

export default function LiveTrackingPage() {
  const currentEvent = liveTrackingEvents.find((event) => event.status === "Current") || liveTrackingEvents[0];

  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#111827]">
      <OfficeHeader title="MOCK UP" subtitle="Live Tracking" />
      <div className="flex min-w-0">
        <OfficeSidebar />

        <main className="min-w-0 flex-1 p-3 sm:p-4 xl:p-5">
          <section className="rounded-[22px] border border-[#d6dde8] bg-white p-4 shadow-sm xl:p-5">
            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.72fr)] xl:items-start">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Vehicle tracking mockup</p>
                <h1 className="mt-1 text-2xl font-black text-[#10203a] xl:text-3xl">{liveTrackingSummary.title}</h1>
                <p className="mt-2 max-w-4xl text-sm font-bold leading-5 text-[#4b5563]">
                  Vehicle, trailer, duty, current movement and event history in one responsive office view.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
                <SummaryCard label="Resource" value={liveTrackingSummary.resource} />
                <SummaryCard label="Duty" value={liveTrackingSummary.duty} />
                <SummaryCard label="Vehicle" value={liveTrackingSummary.vehicle} />
                <SummaryCard label="Trailer" value={liveTrackingSummary.trailer} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
              <MetricCard label="Driver" value={liveTrackingSummary.driver} detail="Assigned driver" />
              <MetricCard label="Last updated" value={liveTrackingSummary.latestUpdate} detail="GPS refresh" />
              <MetricCard label="Speed" value={liveTrackingSummary.speed} detail="Current speed" />
              <MetricCard label="ETA" value={liveTrackingSummary.eta} detail="Next point" />
            </div>
          </section>

          <section className="mt-4 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)] 2xl:grid-cols-[minmax(480px,1.2fr)_minmax(350px,0.86fr)_minmax(270px,0.56fr)]">
            <RouteMapCard />
            <MovementListCard />
            <CurrentEventCard currentEvent={currentEvent} />
          </section>

          <section className="mt-4 rounded-[22px] border border-[#d6dde8] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Event history</p>
                <h2 className="mt-1 text-2xl font-black text-[#10203a]">Movement and place history</h2>
              </div>
              <div className="rounded-full bg-[#10203a] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
                Showing {liveTrackingEvents.length} mock entries
              </div>
            </div>

            <div className="mt-3 overflow-x-auto rounded-[18px] border border-[#d7dee9]">
              <table className="min-w-[980px] w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#e6f0fb] text-left text-xs font-black uppercase tracking-[0.14em] text-[#10203a]">
                    <th className="border-b border-[#d7dee9] px-3 py-3">Time</th>
                    <th className="border-b border-[#d7dee9] px-3 py-3">Duration</th>
                    <th className="border-b border-[#d7dee9] px-3 py-3">Place type</th>
                    <th className="border-b border-[#d7dee9] px-3 py-3">Place</th>
                    <th className="border-b border-[#d7dee9] px-3 py-3">GIS details</th>
                    <th className="border-b border-[#d7dee9] px-3 py-3">Traffic</th>
                    <th className="border-b border-[#d7dee9] px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liveTrackingEvents.map((event, index) => (
                    <tr key={`${event.time}-${event.place}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                      <td className="border-b border-[#e5ebf3] px-3 py-3 text-base font-black text-[#10203a]">{event.time}</td>
                      <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#4b5563]">{event.duration}</td>
                      <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#10203a]">{event.placeType}</td>
                      <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#10203a]">{event.place}</td>
                      <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#4b5563]">{event.gisDetails}</td>
                      <td className="border-b border-[#e5ebf3] px-3 py-3 text-[#10203a]">
                        <TrafficChip traffic={event.traffic} />
                      </td>
                      <td className="border-b border-[#e5ebf3] px-3 py-3">
                        <StatusChip status={event.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function RouteMapCard() {
  return (
    <section className="min-w-0 rounded-[22px] border border-[#d6dde8] bg-white p-3 shadow-sm xl:p-4">
      <div className="flex flex-col gap-2 rounded-[16px] border border-[#dce6c6] bg-[#f5f8e9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f3a6d]">Current route</p>
          <h2 className="mt-1 truncate text-lg font-black text-[#10203a] xl:text-xl">{liveTrackingSummary.route}</h2>
        </div>
        <div className="shrink-0 rounded-full bg-[#10203a] px-3 py-2 text-xs font-black text-white">
          {liveTrackingSummary.currentStatus}
        </div>
      </div>

      <div className="relative mt-3 min-h-[330px] overflow-hidden rounded-[18px] border border-[#c9d5c1] bg-[linear-gradient(180deg,#95bdd9_0%,#95bdd9_42%,#dbe8b1_42%,#dbe8b1_100%)] sm:min-h-[380px] 2xl:min-h-[420px]">
        <div className="absolute left-0 top-[42%] h-px w-full border-t border-dashed border-white/70" />
        <div className="absolute left-[12%] top-[54%] h-[90px] w-[90px] rounded-full border border-white/45" />
        <div className="absolute right-[14%] top-[16%] h-[120px] w-[120px] rounded-full border border-white/35" />
        <div className="absolute left-3 top-3 rounded-lg bg-white/85 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#10203a] shadow-sm">
          North West route view
        </div>

        <svg viewBox="0 0 350 215" className="absolute inset-0 h-full w-full p-4 pt-12">
          <path d={landscapeMapPath} fill="none" stroke="#ffbf00" strokeWidth="15" strokeLinecap="round" />
          <path d={landscapeMapPath} fill="none" stroke="#d91313" strokeWidth="6" strokeLinecap="round" strokeDasharray="12 8" />

          {liveTrackingRoute.map((point) => (
            <LandscapeMapPoint key={point.name} point={point} />
          ))}
        </svg>
      </div>
    </section>
  );
}

function LandscapeMapPoint({ point }: { point: RoutePoint }) {
  const coordinate = landscapeCoordinates[point.name] || { x: point.x, y: point.y };
  const fill = point.kind === "current" ? "#0f3a6d" : point.kind === "destination" ? "#f59e0b" : point.kind === "start" ? "#ef4444" : "#15803d";
  const ring = point.kind === "current" ? "#bfdbfe" : "white";
  const labelWidth = point.kind === "current" ? 100 : 88;
  const labelX = Math.min(Math.max(coordinate.x - labelWidth / 2, 5), 345 - labelWidth);
  const labelY = coordinate.y > 125 ? coordinate.y - 40 : coordinate.y + 18;

  return (
    <g>
      <circle cx={coordinate.x} cy={coordinate.y} r={point.kind === "current" ? 13 : 10} fill={fill} stroke={ring} strokeWidth="4" />
      <text x={coordinate.x} y={coordinate.y + 4} textAnchor="middle" fontSize="7" fontWeight="700" fill="white">
        {point.shortLabel}
      </text>
      <rect x={labelX} y={labelY} rx="7" ry="7" width={labelWidth} height={point.kind === "current" ? 34 : 25} fill="rgba(255,255,255,0.94)" stroke="#cfd8e3" />
      <text x={labelX + labelWidth / 2} y={labelY + 16} textAnchor="middle" fontSize="9" fontWeight="700" fill="#10203a">
        {point.name}
      </text>
      {point.kind === "current" ? (
        <text x={labelX + labelWidth / 2} y={labelY + 28} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#4b5563">
          {point.eta} • {point.mph} mph
        </text>
      ) : null}
    </g>
  );
}

function MovementListCard() {
  return (
    <section className="min-w-0 rounded-[22px] border border-[#d6dde8] bg-white p-3 shadow-sm xl:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Route event list</p>
          <h2 className="mt-1 text-xl font-black text-[#10203a]">Today&apos;s movements</h2>
        </div>
        <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-black text-[#0f3a6d] ring-1 ring-[#bfdbfe]">
          {liveTrackingEvents.length} events
        </span>
      </div>

      <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1 xl:max-h-[465px] 2xl:max-h-[500px]">
        {liveTrackingEvents.map((event, index) => (
          <div key={`${event.time}-${index}`} className="rounded-[14px] border border-[#d7e0ec] bg-[#fbfdff] p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#10203a]">{event.time} • {event.place}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6b7280]">
                  {event.placeType} • {event.duration}
                </p>
              </div>
              <StatusChip status={event.status} compact />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-[#4b5563]">{event.gisDetails}</p>
              <TrafficChip traffic={event.traffic} compact />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CurrentEventCard({ currentEvent }: { currentEvent: (typeof liveTrackingEvents)[number] }) {
  return (
    <aside className="min-w-0 rounded-[22px] border border-[#d6dde8] bg-white p-4 shadow-sm xl:col-span-2 2xl:col-span-1">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(250px,0.75fr)_minmax(0,1.25fr)] 2xl:grid-cols-1">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Current event</p>
          <h2 className="mt-1 text-xl font-black text-[#10203a]">{currentEvent.place}</h2>
          <p className="mt-2 text-sm font-bold leading-5 text-[#4b5563]">
            {currentEvent.gisDetails}. Current traffic is <span className="text-[#10203a]">{currentEvent.traffic}</span>.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-2 xl:grid-cols-4 2xl:grid-cols-1">
          <DetailRow label="Place type" value={currentEvent.placeType} />
          <DetailRow label="Event time" value={currentEvent.time} />
          <DetailRow label="Duration" value={currentEvent.duration} />
          <DetailRow label="Last known place" value={liveTrackingSummary.lastKnownPlace} />
        </dl>
      </div>

      <div className="mt-3 rounded-[16px] border border-[#bfdbfe] bg-[#eff6ff] p-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f3a6d]">Office note</p>
        <p className="mt-1 text-sm font-bold leading-5 text-[#1e3a5f]">
          Compact monitor layout with the map, current event and movement list visible without leaving a large unused area.
        </p>
      </div>
    </aside>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#d7dee9] bg-[#f8fafc] px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6b7280]">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-[#10203a]" title={value}>{value}</p>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#d7dee9] bg-[#f8fafc] px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6b7280]">{label}</p>
      <p className="mt-1 truncate text-base font-black text-[#10203a]" title={value}>{value}</p>
      <p className="mt-0.5 text-xs font-bold text-[#4b5563]">{detail}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#d7dee9] bg-[#f8fafc] px-3 py-2.5">
      <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">{label}</dt>
      <dd className="mt-1 break-words text-sm font-black text-[#10203a]">{value}</dd>
    </div>
  );
}

function TrafficChip({ traffic, compact = false }: { traffic: string; compact?: boolean }) {
  return (
    <span className={`inline-flex rounded-full bg-[#ecf5ff] font-black uppercase tracking-[0.1em] text-[#0f3a6d] ring-1 ring-[#bfdbfe] ${compact ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-xs"}`}>
      {traffic}
    </span>
  );
}

function StatusChip({ status, compact = false }: { status: "Completed" | "Current" | "Planned"; compact?: boolean }) {
  const tone =
    status === "Completed"
      ? "border-[#15803d] bg-[#eaf7ef] text-[#166534]"
      : status === "Current"
        ? "border-[#0f3a6d] bg-[#eff6ff] text-[#0f3a6d]"
        : "border-[#d97706] bg-[#fff7ed] text-[#b45309]";

  return (
    <span className={`inline-flex shrink-0 rounded-full border font-black uppercase tracking-[0.12em] ${tone} ${compact ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-xs"}`}>
      {status}
    </span>
  );
}

function OfficeHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex min-h-[64px] items-center justify-between bg-[#e40000] text-white shadow-sm">
      <div className="flex h-full items-center">
        <Link
          href="/internal/app-ideas/link-message-mock"
          className="flex h-[64px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black text-white no-underline transition hover:bg-white/10"
          aria-label="Back to Duty Execution"
        >
          ≡
        </Link>
        <div className="px-5">
          <p className="text-2xl font-black uppercase tracking-wide">{title}</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4">
        <Link
          href="/internal/app-ideas"
          className="hidden rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-white/15 sm:block"
        >
          ← Back to PDA Home
        </Link>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-[#e40000]">●</div>
        <div className="hidden text-right sm:block">
          <p className="text-base font-black">Andrew Cannon</p>
          <p className="text-xs font-bold text-white/80">Mock dashboard user</p>
        </div>
      </div>
    </header>
  );
}

function OfficeSidebar() {
  return (
    <aside className="flex min-h-[calc(100vh-64px)] w-[68px] shrink-0 flex-col bg-[#252c33] text-white">
      {sidebarItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-label={item.label}
          title={item.label}
          className={`relative flex h-[64px] items-center justify-center border-b border-white/10 no-underline transition ${
            item.icon.length > 2 ? "text-sm font-black" : "text-3xl"
          } ${item.active ? "bg-[#11171d] text-white" : "text-white/75 hover:bg-[#11171d] hover:text-white"}`}
        >
          <span>{item.icon}</span>
          {item.alertCount ? (
            <span className="absolute bottom-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e40000] px-1 text-[11px] font-black leading-none text-white ring-2 ring-[#252c33]">
              {item.alertCount}
            </span>
          ) : null}
        </Link>
      ))}
    </aside>
  );
}

import Link from "next/link";

import {
  liveTrackingEvents,
  liveTrackingRoute,
  liveTrackingSummary,
} from "../mockOfficeData";

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  alertCount?: number;
  active?: boolean;
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

const mapPath = "M84 248 C 98 232, 110 220, 112 200 C 114 170, 78 162, 72 136 C 68 118, 96 110, 108 96 C 115 86, 106 64, 92 44";

export default function LiveTrackingPage() {
  const currentEvent = liveTrackingEvents.find((event) => event.status === "Current") || liveTrackingEvents[0];

  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#111827]">
      <OfficeHeader title="MOCK UP" subtitle="Live Tracking" />
      <div className="flex">
        <OfficeSidebar />

        <main className="flex-1 p-4 sm:p-6">
          <section className="rounded-[24px] border border-[#d6dde8] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Vehicle tracking mockup</p>
                <h1 className="mt-2 text-3xl font-black text-[#10203a]">{liveTrackingSummary.title}</h1>
                <p className="mt-3 max-w-4xl text-sm font-bold leading-6 text-[#4b5563]">
                  Use this page to follow a vehicle, trailer and duty in one view. The layout below is a cleaner office mockup inspired by vehicle history screens, showing a simplified route view, current status and event history.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[340px]">
                <SummaryCard label="Resource" value={liveTrackingSummary.resource} />
                <SummaryCard label="Duty" value={liveTrackingSummary.duty} />
                <SummaryCard label="Vehicle" value={liveTrackingSummary.vehicle} />
                <SummaryCard label="Trailer" value={liveTrackingSummary.trailer} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-4">
              <MetricCard label="Driver" value={liveTrackingSummary.driver} detail="Current assigned driver" />
              <MetricCard label="Last updated" value={liveTrackingSummary.latestUpdate} detail="Mock GPS refresh time" />
              <MetricCard label="Speed" value={liveTrackingSummary.speed} detail="Current road speed" />
              <MetricCard label="ETA" value={liveTrackingSummary.eta} detail="Planned arrival to next point" />
            </div>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 2xl:grid-cols-[1.4fr_0.9fr]">
            <div className="rounded-[24px] border border-[#d6dde8] bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="min-h-[540px] flex-1 rounded-[22px] border border-[#d9e3ef] bg-[#eef4dc] p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-white/70 bg-white/70 px-4 py-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f3a6d]">Current route</p>
                      <h2 className="mt-1 text-2xl font-black text-[#10203a]">{liveTrackingSummary.route}</h2>
                    </div>
                    <div className="rounded-full bg-[#10203a] px-4 py-2 text-sm font-black text-white">{liveTrackingSummary.currentStatus}</div>
                  </div>

                  <div className="grid h-[440px] grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="relative overflow-hidden rounded-[20px] border border-[#c9d5c1] bg-[linear-gradient(180deg,#95bdd9_0%,#95bdd9_37%,#dbe8b1_37%,#dbe8b1_100%)] p-4">
                      <div className="absolute left-0 top-[32%] h-px w-full border-t border-dashed border-white/70" />
                      <div className="absolute left-[18%] top-[40%] h-[120px] w-[120px] rounded-full border border-white/50" />
                      <div className="absolute left-[58%] top-[18%] h-[160px] w-[160px] rounded-full border border-white/40" />
                      <div className="absolute left-4 top-4 rounded-lg bg-white/80 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#10203a] shadow-sm">
                        North West route view
                      </div>

                      <svg viewBox="0 0 220 320" className="relative z-10 h-full w-full">
                        <path d={mapPath} fill="none" stroke="#ffbf00" strokeWidth="15" strokeLinecap="round" />
                        <path d={mapPath} fill="none" stroke="#d91313" strokeWidth="6" strokeLinecap="round" strokeDasharray="12 8" />

                        {liveTrackingRoute.map((point) => {
                          const fill = point.kind === "current" ? "#0f3a6d" : point.kind === "destination" ? "#f59e0b" : point.kind === "start" ? "#ef4444" : "#15803d";
                          const ring = point.kind === "current" ? "#bfdbfe" : "white";

                          return (
                            <g key={point.name}>
                              <circle cx={point.x} cy={point.y} r={point.kind === "current" ? 13 : 9} fill={fill} stroke={ring} strokeWidth="4" />
                              <text x={point.x} y={point.y + 4} textAnchor="middle" fontSize="7" fontWeight="700" fill="white">
                                {point.shortLabel}
                              </text>
                              <rect
                                x={point.x - (point.kind === "destination" ? 10 : 2)}
                                y={point.y - 32}
                                rx="6"
                                ry="6"
                                width={point.kind === "current" ? 90 : 84}
                                height={24}
                                fill="rgba(255,255,255,0.92)"
                                stroke="#cfd8e3"
                              />
                              <text x={point.x + (point.kind === "current" ? 33 : 36)} y={point.y - 16} textAnchor="middle" fontSize="8" fontWeight="700" fill="#10203a">
                                {point.name}
                              </text>
                              {point.kind === "current" ? (
                                <text x={point.x + 42} y={point.y - 4} textAnchor="middle" fontSize="7" fontWeight="700" fill="#4b5563">
                                  {point.eta} • {point.mph} mph
                                </text>
                              ) : null}
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    <div className="rounded-[20px] border border-[#d6dde8] bg-[#f8fafc] p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Route event list</p>
                      <h3 className="mt-2 text-xl font-black text-[#10203a]">Today&apos;s tracked movements</h3>
                      <div className="mt-4 space-y-3">
                        {liveTrackingEvents.map((event, index) => (
                          <div key={`${event.time}-${index}`} className="rounded-2xl border border-[#d7e0ec] bg-white p-3 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-black text-[#10203a]">{event.time} • {event.place}</p>
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7280]">{event.placeType} • {event.duration}</p>
                              </div>
                              <StatusChip status={event.status} />
                            </div>
                            <p className="mt-2 text-sm font-bold text-[#4b5563]">{event.gisDetails}</p>
                            <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#0f3a6d]">Traffic: {event.traffic}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="w-full rounded-[22px] border border-[#d6dde8] bg-[#f8fafc] p-4 lg:w-[360px]">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Current event</p>
                  <h2 className="mt-2 text-2xl font-black text-[#10203a]">{currentEvent.place}</h2>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#4b5563]">{currentEvent.gisDetails}. The load currently linked to this movement is <span className="text-[#10203a]">{currentEvent.traffic}</span>.</p>

                  <dl className="mt-5 space-y-3">
                    <DetailRow label="Place type" value={currentEvent.placeType} />
                    <DetailRow label="Event time" value={currentEvent.time} />
                    <DetailRow label="Duration" value={currentEvent.duration} />
                    <DetailRow label="Last known place" value={liveTrackingSummary.lastKnownPlace} />
                  </dl>

                  <div className="mt-6 rounded-[18px] border border-[#bfdbfe] bg-[#eff6ff] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f3a6d]">Office note</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#1e3a5f]">
                      This mock page is intended to give planners and transport offices a simple vehicle view without relying on the original telematics screen design.
                    </p>
                  </div>
                </aside>
              </div>
            </div>

            <section className="rounded-[24px] border border-[#d6dde8] bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Event history</p>
                  <h2 className="mt-2 text-2xl font-black text-[#10203a]">Movement and place history</h2>
                </div>
                <div className="rounded-full bg-[#10203a] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
                  Showing {liveTrackingEvents.length} mock entries
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-[18px] border border-[#d7dee9]">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#e6f0fb] text-left text-xs font-black uppercase tracking-[0.16em] text-[#10203a]">
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
                        <td className="border-b border-[#e5ebf3] px-3 py-3 font-black text-[#10203a]">{event.time}</td>
                        <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#4b5563]">{event.duration}</td>
                        <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#10203a]">{event.placeType}</td>
                        <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#10203a]">{event.place}</td>
                        <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#4b5563]">{event.gisDetails}</td>
                        <td className="border-b border-[#e5ebf3] px-3 py-3 text-[#10203a]">
                          <span className="inline-flex rounded-full bg-[#ecf5ff] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0f3a6d]">
                            {event.traffic}
                          </span>
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
          </section>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d7dee9] bg-[#f8fafc] px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b7280]">{label}</p>
      <p className="mt-2 text-lg font-black text-[#10203a]">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-[#d7dee9] bg-[#f8fafc] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b7280]">{label}</p>
      <p className="mt-2 text-xl font-black text-[#10203a]">{value}</p>
      <p className="mt-1 text-sm font-bold text-[#4b5563]">{detail}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-[#d7dee9] bg-white px-4 py-3">
      <dt className="text-xs font-black uppercase tracking-[0.16em] text-[#6b7280]">{label}</dt>
      <dd className="text-right text-sm font-black text-[#10203a]">{value}</dd>
    </div>
  );
}

function StatusChip({ status }: { status: "Completed" | "Current" | "Planned" }) {
  const tone =
    status === "Completed"
      ? "border-[#15803d] bg-[#eaf7ef] text-[#166534]"
      : status === "Current"
        ? "border-[#0f3a6d] bg-[#eff6ff] text-[#0f3a6d]"
        : "border-[#d97706] bg-[#fff7ed] text-[#b45309]";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${tone}`}>{status}</span>;
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
    <aside className="flex min-h-[calc(100vh-64px)] w-[68px] flex-col bg-[#252c33] text-white">
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

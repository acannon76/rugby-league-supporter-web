"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { arrivalDepartureRows, trafficOptions, type ArrivalDepartureRow, type MovementStatus } from "../mockOfficeData";

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
  { label: "Live Tracking", icon: "GPS", href: "/internal/app-ideas/link-message-mock/live-tracking" },
  { label: "Reports", icon: "REP", href: "/internal/app-ideas/link-message-mock/reports" },
  { label: "A&D Dashboard", icon: "A&D", href: "/internal/app-ideas/link-message-mock/arrivals-departures", active: true },
];

export default function ArrivalsDeparturesPage() {
  const [search, setSearch] = useState("");
  const [trafficFilter, setTrafficFilter] = useState<ArrivalDepartureRow["traffic"] | "All">("All");
  const [statusFilter, setStatusFilter] = useState<MovementStatus | "All">("All");

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return arrivalDepartureRows.filter((row) => {
      if (trafficFilter !== "All" && row.traffic !== trafficFilter) {
        return false;
      }

      if (statusFilter !== "All" && row.departureStatus !== statusFilter && row.arrivalStatus !== statusFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [
        row.departing,
        row.destination,
        row.jobReference,
        row.resources,
        row.traffic,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [search, trafficFilter, statusFilter]);

  const actualCount = filteredRows.filter((row) => row.departureStatus === "Actual" || row.arrivalStatus === "Actual").length;
  const etaCount = filteredRows.filter((row) => row.departureStatus === "ETD" || row.arrivalStatus === "ETA").length;
  const plannedCount = filteredRows.filter((row) => row.departureStatus === "Planned" && row.arrivalStatus === "Planned").length;
  const delayedCount = filteredRows.filter((row) => row.delay.startsWith("+")).length;

  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#111827]">
      <OfficeHeader title="MOCK UP" subtitle="Arrival & Departure Dashboard" />
      <div className="flex">
        <OfficeSidebar />

        <main className="flex-1 p-4 sm:p-6">
          <section className="rounded-[24px] border border-[#d6dde8] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Arrivals and departures mockup</p>
                <h1 className="mt-2 text-3xl font-black text-[#10203a]">Arrival & Departure Dashboard</h1>
                <p className="mt-3 max-w-4xl text-sm font-bold leading-6 text-[#4b5563]">
                  A cleaner dashboard view for monitoring departures, arrivals, ETA movements and the traffic being carried. Traffic values are populated with the requested mock examples for demo use.
                </p>
              </div>

              <div className="rounded-[20px] border border-[#f1c8c8] bg-[#fff4f4] px-4 py-3 text-sm font-black text-[#b42318]">
                Last updated: 22/07/2026 11:26
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="Rows shown" value={String(filteredRows.length)} />
              <MetricCard label="Actual movements" value={String(actualCount)} />
              <MetricCard label="ETA / ETD" value={String(etaCount)} />
              <MetricCard label="Planned only" value={String(plannedCount)} />
              <MetricCard label="Delayed" value={String(delayedCount)} />
            </div>
          </section>

          <section className="mt-5 rounded-[24px] border border-[#d6dde8] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Board filters</p>
                <h2 className="mt-2 text-2xl font-black text-[#10203a]">Filter the dashboard</h2>
              </div>

              <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3 lg:max-w-[920px]">
                <label className="text-sm font-black text-[#10203a]">
                  Search
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Route, resource, traffic or job reference"
                    className="mt-2 w-full rounded-xl border border-[#cfd8e3] px-4 py-3 font-bold text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]"
                  />
                </label>

                <label className="text-sm font-black text-[#10203a]">
                  Traffic
                  <select
                    value={trafficFilter}
                    onChange={(event) => setTrafficFilter(event.target.value as ArrivalDepartureRow["traffic"] | "All")}
                    className="mt-2 w-full rounded-xl border border-[#cfd8e3] px-4 py-3 font-bold text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]"
                  >
                    <option value="All">All traffic</option>
                    {trafficOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-black text-[#10203a]">
                  Status
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as MovementStatus | "All")}
                    className="mt-2 w-full rounded-xl border border-[#cfd8e3] px-4 py-3 font-bold text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]"
                  >
                    <option value="All">All statuses</option>
                    <option value="Actual">Actual</option>
                    <option value="Planned">Planned</option>
                    <option value="ETD">ETD</option>
                    <option value="ETA">ETA</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <LegendChip label="Green = Actual / ETA / ETD on track" tone="green" />
              <LegendChip label="Amber = Planned" tone="amber" />
              <LegendChip label="Red = Delayed" tone="red" />
            </div>

            <div className="mt-5 overflow-x-auto rounded-[20px] border border-[#d7dee9]">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#e40000] text-left text-xs font-black uppercase tracking-[0.16em] text-white">
                    <th className="px-3 py-3">Departing</th>
                    <th className="px-3 py-3">Departure date / time</th>
                    <th className="px-3 py-3">Destination</th>
                    <th className="px-3 py-3">Arrival date / time</th>
                    <th className="px-3 py-3">Job reference</th>
                    <th className="px-3 py-3">Resources</th>
                    <th className="px-3 py-3">Traffic</th>
                    <th className="px-3 py-3">Delay</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => (
                    <tr key={`${row.jobReference}-${index}`} className={index % 2 === 0 ? "bg-[#fff8f8]" : "bg-[#fff1f1]"}>
                      <td className="border-t border-[#f2d1d1] px-3 py-3 font-bold text-[#10203a]">{row.departing}</td>
                      <td className="border-t border-[#f2d1d1] px-3 py-3">
                        <DateTimeBadge dateTime={row.departureDateTime} status={row.departureStatus} delay={row.delay} />
                      </td>
                      <td className="border-t border-[#f2d1d1] px-3 py-3 font-bold text-[#10203a]">{row.destination}</td>
                      <td className="border-t border-[#f2d1d1] px-3 py-3">
                        <DateTimeBadge dateTime={row.arrivalDateTime} status={row.arrivalStatus} delay={row.delay} />
                      </td>
                      <td className="border-t border-[#f2d1d1] px-3 py-3 font-bold text-[#10203a]">{row.jobReference}</td>
                      <td className="border-t border-[#f2d1d1] px-3 py-3 font-bold text-[#10203a]">{row.resources}</td>
                      <td className="border-t border-[#f2d1d1] px-3 py-3">
                        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0f3a6d] ring-1 ring-[#bfdbfe]">
                          {row.traffic}
                        </span>
                      </td>
                      <td className="border-t border-[#f2d1d1] px-3 py-3 font-black text-[#10203a]">{row.delay}</td>
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d7dee9] bg-[#f8fafc] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b7280]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#10203a]">{value}</p>
    </div>
  );
}

function LegendChip({ label, tone }: { label: string; tone: "green" | "amber" | "red" }) {
  const colour = tone === "green" ? "bg-[#eaf7ef] text-[#166534] border-[#15803d]" : tone === "amber" ? "bg-[#fff7ed] text-[#b45309] border-[#d97706]" : "bg-[#fff1f2] text-[#b42318] border-[#ef4444]";

  return <span className={`inline-flex rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${colour}`}>{label}</span>;
}

function DateTimeBadge({ dateTime, status, delay }: { dateTime: string; status: MovementStatus; delay: string }) {
  const isDelayed = delay.startsWith("+") && (status === "Actual" || status === "ETA" || status === "ETD");
  const tone =
    isDelayed
      ? "bg-[#ef4444] text-white"
      : status === "Planned"
        ? "bg-[#f59e0b] text-white"
        : "bg-[#16a34a] text-white";

  return (
    <span className={`inline-flex rounded-md px-3 py-2 text-sm font-black ${tone}`}>
      {dateTime} ({status})
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

"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import {
  arrivalBoardRows,
  arrivalDepartureRows,
  trafficOptions,
  type ArrivalDepartureRow,
  type MovementStatus,
} from "../mockOfficeData";

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  alertCount?: number;
  active?: boolean;
};

type BoardView = "Overview" | "Departures" | "Arrivals";
type BoardMode = "Departures" | "Arrivals";

type SiteOption =
  | "Midlands Super Hub"
  | "North West Super Hub"
  | "Warrington MC"
  | "Leeds MC"
  | "Birmingham MC"
  | "East Midlands Airport"
  | "Scottish Parcel Hub"
  | "Liverpool LD"
  | "Chester MC"
  | "Sheffield MC";

const siteOptions: SiteOption[] = [
  "Midlands Super Hub",
  "North West Super Hub",
  "Warrington MC",
  "Leeds MC",
  "Birmingham MC",
  "East Midlands Airport",
  "Scottish Parcel Hub",
  "Liverpool LD",
  "Chester MC",
  "Sheffield MC",
];

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

const departureOffsets = [-24, -10, 6, 22, 38, 54, 72, 89, 104, 118, 134, 149];
const arrivalOffsets = [-28, -18, -6, 9, 24, 39, 57, 74, 93, 111];

export default function ArrivalsDeparturesPage() {
  const [boardView, setBoardView] = useState<BoardView>("Overview");
  const [selectedSite, setSelectedSite] = useState<SiteOption>("Midlands Super Hub");
  const [search, setSearch] = useState("");
  const [trafficFilter, setTrafficFilter] = useState<ArrivalDepartureRow["traffic"] | "All">("All");
  const [statusFilter, setStatusFilter] = useState<MovementStatus | "All">("All");
  const [refreshTime, setRefreshTime] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRefreshTime(new Date());
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  const selectedDepartureRows = useMemo(
    () => buildDynamicRows(arrivalDepartureRows, "Departures", selectedSite, refreshTime),
    [selectedSite, refreshTime],
  );

  const selectedArrivalRows = useMemo(
    () => buildDynamicRows(arrivalBoardRows, "Arrivals", selectedSite, refreshTime),
    [selectedSite, refreshTime],
  );

  const departureRows = useMemo(
    () => filterRows(selectedDepartureRows, search, trafficFilter, statusFilter, "Departures", refreshTime),
    [selectedDepartureRows, search, trafficFilter, statusFilter, refreshTime],
  );
  const arrivalRows = useMemo(
    () => filterRows(selectedArrivalRows, search, trafficFilter, statusFilter, "Arrivals", refreshTime),
    [selectedArrivalRows, search, trafficFilter, statusFilter, refreshTime],
  );

  const combinedRows = [...departureRows, ...arrivalRows];
  const delayedCount = combinedRows.filter((row) => row.delay.startsWith("+")).length;
  const activeCount = combinedRows.filter(
    (row) =>
      row.departureStatus === "Actual" ||
      row.departureStatus === "ETD" ||
      row.arrivalStatus === "Actual" ||
      row.arrivalStatus === "ETA",
  ).length;
  const trafficCount = new Set(combinedRows.map((row) => row.traffic)).size;

  return (
    <div className="min-h-screen bg-[#edf3f8] text-[#111827]">
      <OfficeHeader title="MOCK UP" subtitle="Arrival & Departure Dashboard" />
      <div className="flex">
        <OfficeSidebar />

        <main className="flex-1 p-4 sm:p-6">
          <section className="overflow-hidden rounded-[28px] border border-[#d9e3ee] bg-white shadow-sm">
            <div className="bg-[#e40000] px-6 py-7 text-white sm:px-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-4xl">
                  <h1 className="text-3xl font-black sm:text-4xl">Arrival & Departure Control Centre</h1>
                  <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-white/90">
                    Select a site and switch between Overview, Departures and Arrivals. Arrivals now show anything arrived in the last 30 minutes plus ETA movements in the next 2 hours, and departures drop off 30 minutes after departure.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:min-w-[880px]">
                  <HeroStat label="Total board rows" value={String(combinedRows.length)} />
                  <HeroStat label="Live / ETA / ETD" value={String(activeCount)} />
                  <HeroStat label="Delayed" value={String(delayedCount)} />
                  <HeroStat label="Traffic types" value={String(trafficCount)} />
                </div>
              </div>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[auto_minmax(260px,340px)_auto] xl:items-center xl:justify-between">
                <div className="inline-flex flex-wrap gap-2 rounded-2xl bg-[#f3f7fb] p-2">
                  {(["Overview", "Departures", "Arrivals"] as BoardView[]).map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setBoardView(view)}
                      className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                        boardView === view ? "bg-[#10203a] text-white shadow-sm" : "text-[#10203a] hover:bg-white"
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>

                <FilterField label="Site">
                  <select
                    value={selectedSite}
                    onChange={(event) => setSelectedSite(event.target.value as SiteOption)}
                    className="w-full rounded-xl border border-[#cfdae7] bg-white px-4 py-3 font-bold text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]"
                  >
                    {siteOptions.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </select>
                </FilterField>

                <div className="rounded-2xl border border-[#c7d4e5] bg-[#f8fbfe] px-4 py-3 text-base font-black text-[#10203a] xl:justify-self-end">
                  Last updated: <span className="text-[#e40000]">{formatDateTime(refreshTime)}</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <FilterField label="Search">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Route, resource, traffic or job reference"
                    className="w-full rounded-xl border border-[#cfdae7] px-4 py-3 font-bold text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]"
                  />
                </FilterField>

                <FilterField label="Traffic">
                  <select
                    value={trafficFilter}
                    onChange={(event) => setTrafficFilter(event.target.value as ArrivalDepartureRow["traffic"] | "All")}
                    className="w-full rounded-xl border border-[#cfdae7] px-4 py-3 font-bold text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]"
                  >
                    <option value="All">All traffic</option>
                    {trafficOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FilterField>

                <FilterField label="Status">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as MovementStatus | "All")}
                    className="w-full rounded-xl border border-[#cfdae7] px-4 py-3 font-bold text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]"
                  >
                    <option value="All">All statuses</option>
                    <option value="Actual">Actual</option>
                    <option value="Planned">Planned</option>
                    <option value="ETD">ETD</option>
                    <option value="ETA">ETA</option>
                  </select>
                </FilterField>

                <FilterStat label="Departure rows" value={String(departureRows.length)} />
                <FilterStat label="Arrival rows" value={String(arrivalRows.length)} />
              </div>
            </div>
          </section>

          {boardView === "Overview" ? (
            <section className="mt-5 grid grid-cols-1 gap-5 2xl:grid-cols-2">
              <BoardCard title={`${selectedSite} Departure Board`} subtitle="Planned departure time order" count={departureRows.length} accent="blue">
                <CompactBoardList rows={departureRows.slice(0, 6)} mode="Departures" emptyText="No departures match the current filters." />
              </BoardCard>

              <BoardCard title={`${selectedSite} Arrival Board`} subtitle="Planned arrival time order" count={arrivalRows.length} accent="green">
                <CompactBoardList rows={arrivalRows.slice(0, 6)} mode="Arrivals" emptyText="No arrivals match the current filters." />
              </BoardCard>
            </section>
          ) : null}

          {boardView === "Departures" || boardView === "Overview" ? (
            <section className="mt-5">
              <DepartureBoardTable site={selectedSite} rows={departureRows} hidden={boardView !== "Departures"} />
            </section>
          ) : null}

          {boardView === "Arrivals" || boardView === "Overview" ? (
            <section className="mt-5">
              <ArrivalBoardTable site={selectedSite} rows={arrivalRows} hidden={boardView !== "Arrivals"} />
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function buildDynamicRows(rows: ArrivalDepartureRow[], mode: BoardMode, selectedSite: string, now: Date) {
  const offsets = mode === "Departures" ? departureOffsets : arrivalOffsets;

  return rows.map((row, index) => {
    const offset = offsets[index % offsets.length];
    const primaryDate = addMinutes(now, offset);
    const primaryTime = formatDateTime(primaryDate);

    if (mode === "Departures") {
      return {
        ...row,
        departing: selectedSite,
        departureDateTime: primaryTime,
        departureStatus: (offset < 0 ? "Actual" : offset <= 45 ? "ETD" : "Planned") as MovementStatus,
      };
    }

    return {
      ...row,
      destination: selectedSite,
      arrivalDateTime: primaryTime,
      arrivalStatus: (offset <= 0 ? "Actual" : "ETA") as MovementStatus,
    };
  });
}

function filterRows(
  rows: ArrivalDepartureRow[],
  search: string,
  trafficFilter: ArrivalDepartureRow["traffic"] | "All",
  statusFilter: MovementStatus | "All",
  mode: BoardMode,
  now: Date,
) {
  const term = search.trim().toLowerCase();
  const nowMs = now.getTime();
  const lowerDepartureWindow = nowMs - 30 * 60 * 1000;
  const lowerArrivalWindow = nowMs - 30 * 60 * 1000;
  const upperArrivalWindow = nowMs + 120 * 60 * 1000;

  return [...rows]
    .filter((row) => {
      const primaryTimeMs = parseDateTime(getPrimaryTimeForMode(row, mode));

      if (mode === "Departures" && primaryTimeMs < lowerDepartureWindow) {
        return false;
      }

      if (mode === "Arrivals" && (primaryTimeMs < lowerArrivalWindow || primaryTimeMs > upperArrivalWindow)) {
        return false;
      }

      if (trafficFilter !== "All" && row.traffic !== trafficFilter) {
        return false;
      }

      const relevantStatus = getStatusForMode(row, mode);
      if (statusFilter !== "All" && relevantStatus !== statusFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [row.departing, row.destination, row.jobReference, row.resources, row.traffic, row.delay]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    })
    .sort((a, b) => parseDateTime(getPrimaryTimeForMode(a, mode)) - parseDateTime(getPrimaryTimeForMode(b, mode)));
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateTime(date: Date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseDateTime(dateTime: string) {
  const [datePart, timePart] = dateTime.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute).getTime();
}

function getStatusForMode(row: ArrivalDepartureRow, mode: BoardMode) {
  return mode === "Departures" ? row.departureStatus : row.arrivalStatus;
}

function getPrimaryTimeForMode(row: ArrivalDepartureRow, mode: BoardMode) {
  return mode === "Departures" ? row.departureDateTime : row.arrivalDateTime;
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#bfdbfe]">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-sm font-black text-[#10203a]">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function FilterStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d8e3ef] bg-[#f7fbff] px-4 py-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b7280]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#10203a]">{value}</p>
    </div>
  );
}

function BoardCard({
  title,
  subtitle,
  count,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  count: number;
  accent: "blue" | "green";
  children: ReactNode;
}) {
  const accentClasses =
    accent === "blue" ? "from-[#eff6ff] to-[#f8fbff] border-[#bfdbfe]" : "from-[#ecfdf3] to-[#f7fffa] border-[#bbf7d0]";

  return (
    <section className={`rounded-[26px] border bg-gradient-to-br ${accentClasses} p-5 shadow-sm`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Overview panel</p>
          <h2 className="mt-2 text-2xl font-black text-[#10203a]">{title}</h2>
          <p className="mt-2 text-sm font-bold text-[#4b5563]">{subtitle}</p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b7280]">Rows</p>
          <p className="mt-2 text-2xl font-black text-[#10203a]">{count}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CompactBoardList({ rows, mode, emptyText }: { rows: ArrivalDepartureRow[]; mode: BoardMode; emptyText: string }) {
  if (!rows.length) {
    return <p className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-4 py-5 text-base font-bold text-[#6b7280]">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row, index) => {
        const status = getStatusForMode(row, mode);
        const time = getPrimaryTimeForMode(row, mode);
        const route = mode === "Departures" ? row.destination : row.departing;

        return (
          <div key={`${row.jobReference}-${index}`} className="rounded-2xl border border-white/70 bg-white px-4 py-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[250px_1fr_auto] lg:items-center">
              <div>
                <p className="text-xl font-black text-[#10203a]">{time}</p>
                <p className="mt-1 text-base font-black text-[#e40000]">{row.jobReference}</p>
              </div>
              <div>
                <p className="text-lg font-black text-[#10203a]">{mode === "Departures" ? `Destination: ${route}` : `Origin: ${route}`}</p>
                <p className="mt-1 text-base font-bold text-[#4b5563]">{row.resources}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <TrafficBadge value={row.traffic} />
                <StatusBadge status={status} delay={row.delay} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DepartureBoardTable({ site, rows, hidden }: { site: string; rows: ArrivalDepartureRow[]; hidden?: boolean }) {
  return (
    <section className={`rounded-[28px] border border-[#d9e3ee] bg-white p-5 shadow-sm ${hidden ? "hidden" : "block"}`}>
      <BoardHeader title={`${site} Departure Board`} subtitle="Planned departure time order" rowCount={rows.length} />

      <div className="mt-5 overflow-x-auto rounded-[24px] border border-[#dbe5f0] bg-[#f8fbff] p-2">
        <table className="min-w-full border-separate border-spacing-y-2 text-base">
          <thead>
            <tr className="text-left text-[12px] font-black uppercase tracking-[0.18em] text-[#6b7280]">
              <th className="px-4 py-4">Planned departure time</th>
              <th className="px-4 py-4">Destination</th>
              <th className="px-4 py-4">Job reference</th>
              <th className="px-4 py-4">Resources</th>
              <th className="px-4 py-4">Traffic</th>
              <th className="px-4 py-4">Delay</th>
              <th className="px-4 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={`${row.jobReference}-${index}`}>
                  <td className="rounded-l-2xl border-y border-l border-[#e2e8f0] bg-white px-4 py-5">
                    <DateTimePill dateTime={row.departureDateTime} status={row.departureStatus} delay={row.delay} />
                  </td>
                  <td className="border-y border-[#e2e8f0] bg-white px-4 py-5 text-lg font-black text-[#10203a]">{row.destination}</td>
                  <td className="border-y border-[#e2e8f0] bg-white px-4 py-5 text-lg font-black text-[#10203a]">{row.jobReference}</td>
                  <td className="border-y border-[#e2e8f0] bg-white px-4 py-5 text-base font-bold text-[#4b5563]">{row.resources}</td>
                  <td className="border-y border-[#e2e8f0] bg-white px-4 py-5"><TrafficBadge value={row.traffic} /></td>
                  <td className="border-y border-[#e2e8f0] bg-white px-4 py-5 text-lg font-black text-[#10203a]">{row.delay}</td>
                  <td className="rounded-r-2xl border-y border-r border-[#e2e8f0] bg-white px-4 py-5"><StatusBadge status={row.departureStatus} delay={row.delay} /></td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={7} />
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ArrivalBoardTable({ site, rows, hidden }: { site: string; rows: ArrivalDepartureRow[]; hidden?: boolean }) {
  return (
    <section className={`rounded-[28px] border border-[#d9e3ee] bg-white p-5 shadow-sm ${hidden ? "hidden" : "block"}`}>
      <BoardHeader title={`${site} Arrival Board`} subtitle="Planned arrival time order" rowCount={rows.length} />

      <div className="mt-5 overflow-x-auto rounded-[24px] border border-[#dbe5f0] bg-[#f8fbff] p-2">
        <table className="min-w-full border-separate border-spacing-y-2 text-base">
          <thead>
            <tr className="text-left text-[12px] font-black uppercase tracking-[0.18em] text-[#6b7280]">
              <th className="px-4 py-4">Planned arrival time</th>
              <th className="px-4 py-4">Origin</th>
              <th className="px-4 py-4">Job reference</th>
              <th className="px-4 py-4">Traffic</th>
              <th className="px-4 py-4">Resources</th>
              <th className="px-4 py-4">Delay</th>
              <th className="px-4 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={`${row.jobReference}-${index}`}>
                  <td className="rounded-l-2xl border-y border-l border-[#e2e8f0] bg-white px-4 py-5">
                    <DateTimePill dateTime={row.arrivalDateTime} status={row.arrivalStatus} delay={row.delay} />
                  </td>
                  <td className="border-y border-[#e2e8f0] bg-white px-4 py-5 text-lg font-black text-[#10203a]">{row.departing}</td>
                  <td className="border-y border-[#e2e8f0] bg-white px-4 py-5 text-lg font-black text-[#10203a]">{row.jobReference}</td>
                  <td className="border-y border-[#e2e8f0] bg-white px-4 py-5"><TrafficBadge value={row.traffic} /></td>
                  <td className="border-y border-[#e2e8f0] bg-white px-4 py-5 text-base font-bold text-[#4b5563]">{row.resources}</td>
                  <td className="border-y border-[#e2e8f0] bg-white px-4 py-5 text-lg font-black text-[#10203a]">{row.delay}</td>
                  <td className="rounded-r-2xl border-y border-r border-[#e2e8f0] bg-white px-4 py-5"><StatusBadge status={row.arrivalStatus} delay={row.delay} /></td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={7} />
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BoardHeader({ title, subtitle, rowCount }: { title: string; subtitle: string; rowCount: number }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Detailed board</p>
        <h2 className="mt-2 text-4xl font-black text-[#10203a]">{title}</h2>
        <p className="mt-2 text-base font-bold text-[#4b5563]">{subtitle}</p>
      </div>
      <div className="rounded-2xl border border-[#d7e2ef] bg-[#f8fbfe] px-4 py-3 text-base font-black text-[#10203a]">
        Showing {rowCount} row(s)
      </div>
    </div>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="rounded-2xl bg-white px-4 py-10 text-center text-base font-bold text-[#6b7280]">
        No rows match the current filters.
      </td>
    </tr>
  );
}

function TrafficBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#ecf5ff] px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[#0f3a6d] ring-1 ring-[#bfdbfe]">
      {value}
    </span>
  );
}

function StatusBadge({ status, delay }: { status: MovementStatus; delay: string }) {
  const isDelayed = delay.startsWith("+") && (status === "Actual" || status === "ETA" || status === "ETD");
  const classes = isDelayed
    ? "border-[#ef4444] bg-[#fff1f2] text-[#b42318]"
    : status === "Planned"
      ? "border-[#f59e0b] bg-[#fff7ed] text-[#b45309]"
      : "border-[#16a34a] bg-[#edfdf1] text-[#166534]";

  return <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-black uppercase tracking-[0.14em] ${classes}`}>{status}</span>;
}

function DateTimePill({ dateTime, status, delay }: { dateTime: string; status: MovementStatus; delay: string }) {
  const isDelayed = delay.startsWith("+") && (status === "Actual" || status === "ETA" || status === "ETD");
  const classes = isDelayed
    ? "bg-[#ef4444] text-white"
    : status === "Planned"
      ? "bg-[#f59e0b] text-white"
      : "bg-[#16a34a] text-white";

  return <span className={`inline-flex rounded-xl px-4 py-3 text-base font-black ${classes}`}>{dateTime}</span>;
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

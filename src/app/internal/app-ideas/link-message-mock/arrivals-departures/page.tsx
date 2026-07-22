"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";

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
  const [boardView, setBoardView] = useState<BoardView>("Overview");
  const [search, setSearch] = useState("");
  const [trafficFilter, setTrafficFilter] = useState<ArrivalDepartureRow["traffic"] | "All">("All");
  const [statusFilter, setStatusFilter] = useState<MovementStatus | "All">("All");

  const departureRows = useMemo(() => filterRows(arrivalDepartureRows, search, trafficFilter, statusFilter, "Departures"), [search, trafficFilter, statusFilter]);
  const arrivalRows = useMemo(() => filterRows(arrivalBoardRows, search, trafficFilter, statusFilter, "Arrivals"), [search, trafficFilter, statusFilter]);

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
            <div className="bg-[radial-gradient(circle_at_top_left,#0f3a6d_0%,#10203a_42%,#172d4f_100%)] px-6 py-7 text-white sm:px-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-4xl">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#bfdbfe]">Modern board concept</p>
                  <h1 className="mt-3 text-3xl font-black sm:text-4xl">Arrival & Departure Control Centre</h1>
                  <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-[#dbe7f5]">
                    This updated mockup uses a more modern operations-dashboard style. It now includes a dedicated arrival board as well as a departure board, with an overview mode for quick monitoring of both.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[380px]">
                  <HeroStat label="Total board rows" value={String(combinedRows.length)} />
                  <HeroStat label="Live / ETA / ETD" value={String(activeCount)} />
                  <HeroStat label="Delayed" value={String(delayedCount)} />
                  <HeroStat label="Traffic types" value={String(trafficCount)} />
                </div>
              </div>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
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

                <div className="rounded-2xl border border-[#c7d4e5] bg-[#f8fbfe] px-4 py-3 text-sm font-black text-[#10203a]">
                  Last updated: <span className="text-[#e40000]">22/07/2026 11:26</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
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
              <BoardCard
                title="Departure board"
                subtitle="Outgoing duties from Midlands Super Hub"
                count={departureRows.length}
                accent="blue"
              >
                <CompactBoardList rows={departureRows.slice(0, 6)} mode="Departures" emptyText="No departures match the current filters." />
              </BoardCard>

              <BoardCard
                title="Arrival board"
                subtitle="Incoming duties arriving into Midlands Super Hub"
                count={arrivalRows.length}
                accent="green"
              >
                <CompactBoardList rows={arrivalRows.slice(0, 6)} mode="Arrivals" emptyText="No arrivals match the current filters." />
              </BoardCard>
            </section>
          ) : null}

          {boardView === "Departures" || boardView === "Overview" ? (
            <section className="mt-5">
              <ModernBoardTable
                title="Departure board"
                subtitle="Modern outbound monitoring board"
                rows={departureRows}
                mode="Departures"
                hidden={boardView !== "Departures"}
              />
            </section>
          ) : null}

          {boardView === "Arrivals" || boardView === "Overview" ? (
            <section className="mt-5">
              <ModernBoardTable
                title="Arrival board"
                subtitle="Modern inbound monitoring board"
                rows={arrivalRows}
                mode="Arrivals"
                hidden={boardView !== "Arrivals"}
              />
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function filterRows(
  rows: ArrivalDepartureRow[],
  search: string,
  trafficFilter: ArrivalDepartureRow["traffic"] | "All",
  statusFilter: MovementStatus | "All",
  mode: BoardMode,
) {
  const term = search.trim().toLowerCase();

  return rows.filter((row) => {
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

    const haystack = [row.departing, row.destination, row.jobReference, row.resources, row.traffic, row.delay].join(" ").toLowerCase();
    return haystack.includes(term);
  });
}

function getStatusForMode(row: ArrivalDepartureRow, mode: BoardMode) {
  return mode === "Departures" ? row.departureStatus : row.arrivalStatus;
}

function getPrimaryTimeForMode(row: ArrivalDepartureRow, mode: BoardMode) {
  return mode === "Departures" ? row.departureDateTime : row.arrivalDateTime;
}

function getPrimaryLabelForMode(mode: BoardMode) {
  return mode === "Departures" ? "Departure" : "Arrival";
}

function getPrimaryLocationForMode(row: ArrivalDepartureRow, mode: BoardMode) {
  return mode === "Departures" ? row.departing : row.destination;
}

function getSecondaryLocationForMode(row: ArrivalDepartureRow, mode: BoardMode) {
  return mode === "Departures" ? row.destination : row.departing;
}

function getSecondaryLabelForMode(mode: BoardMode) {
  return mode === "Departures" ? "Destination" : "Origin";
}

function getLocationCaption(row: ArrivalDepartureRow, mode: BoardMode) {
  return mode === "Departures" ? `${row.departing} → ${row.destination}` : `${row.departing} → ${row.destination}`;
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
  const accentClasses = accent === "blue" ? "from-[#eff6ff] to-[#f8fbff] border-[#bfdbfe]" : "from-[#ecfdf3] to-[#f7fffa] border-[#bbf7d0]";

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
    return <p className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-4 py-5 text-sm font-bold text-[#6b7280]">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row, index) => {
        const status = getStatusForMode(row, mode);
        return (
          <div key={`${row.jobReference}-${index}`} className="rounded-2xl border border-white/70 bg-white px-4 py-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-black text-[#10203a]">{getLocationCaption(row, mode)}</p>
                <p className="mt-1 text-sm font-bold text-[#4b5563]">{getPrimaryLabelForMode(mode)}: {getPrimaryTimeForMode(row, mode)} • {row.jobReference}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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

function ModernBoardTable({
  title,
  subtitle,
  rows,
  mode,
  hidden,
}: {
  title: string;
  subtitle: string;
  rows: ArrivalDepartureRow[];
  mode: BoardMode;
  hidden?: boolean;
}) {
  return (
    <section className={`rounded-[28px] border border-[#d9e3ee] bg-white p-5 shadow-sm ${hidden ? "hidden" : "block"}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Detailed board</p>
          <h2 className="mt-2 text-3xl font-black text-[#10203a]">{title}</h2>
          <p className="mt-2 text-sm font-bold text-[#4b5563]">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-[#d7e2ef] bg-[#f8fbfe] px-4 py-3 text-sm font-black text-[#10203a]">
          Showing {rows.length} row(s)
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-[24px] border border-[#dbe5f0] bg-[#f8fbff] p-2">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-[11px] font-black uppercase tracking-[0.18em] text-[#6b7280]">
              <th className="px-4 py-3">{mode === "Departures" ? "Departing" : "Arriving"}</th>
              <th className="px-4 py-3">{getPrimaryLabelForMode(mode)} time</th>
              <th className="px-4 py-3">{getSecondaryLabelForMode(mode)}</th>
              <th className="px-4 py-3">Job reference</th>
              <th className="px-4 py-3">Traffic</th>
              <th className="px-4 py-3">Resources</th>
              <th className="px-4 py-3">Delay</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => {
                const status = getStatusForMode(row, mode);
                return (
                  <tr key={`${row.jobReference}-${index}`}>
                    <td className="rounded-l-2xl border-y border-l border-[#e2e8f0] bg-white px-4 py-4 font-black text-[#10203a]">
                      <div>{getPrimaryLocationForMode(row, mode)}</div>
                      <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#6b7280]">{mode === "Departures" ? "Outbound" : "Inbound"}</div>
                    </td>
                    <td className="border-y border-[#e2e8f0] bg-white px-4 py-4">
                      <DateTimePill dateTime={getPrimaryTimeForMode(row, mode)} status={status} delay={row.delay} />
                    </td>
                    <td className="border-y border-[#e2e8f0] bg-white px-4 py-4 font-bold text-[#10203a]">{getSecondaryLocationForMode(row, mode)}</td>
                    <td className="border-y border-[#e2e8f0] bg-white px-4 py-4 font-black text-[#10203a]">{row.jobReference}</td>
                    <td className="border-y border-[#e2e8f0] bg-white px-4 py-4"><TrafficBadge value={row.traffic} /></td>
                    <td className="border-y border-[#e2e8f0] bg-white px-4 py-4 font-bold text-[#4b5563]">{row.resources}</td>
                    <td className="border-y border-[#e2e8f0] bg-white px-4 py-4 font-black text-[#10203a]">{row.delay}</td>
                    <td className="rounded-r-2xl border-y border-r border-[#e2e8f0] bg-white px-4 py-4"><StatusBadge status={status} delay={row.delay} /></td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="rounded-2xl bg-white px-4 py-10 text-center text-sm font-bold text-[#6b7280]">
                  No rows match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TrafficBadge({ value }: { value: string }) {
  return <span className="inline-flex rounded-full bg-[#ecf5ff] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0f3a6d] ring-1 ring-[#bfdbfe]">{value}</span>;
}

function StatusBadge({ status, delay }: { status: MovementStatus; delay: string }) {
  const isDelayed = delay.startsWith("+") && (status === "Actual" || status === "ETA" || status === "ETD");
  const classes = isDelayed
    ? "border-[#ef4444] bg-[#fff1f2] text-[#b42318]"
    : status === "Planned"
      ? "border-[#f59e0b] bg-[#fff7ed] text-[#b45309]"
      : "border-[#16a34a] bg-[#edfdf1] text-[#166534]";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${classes}`}>{status}</span>;
}

function DateTimePill({ dateTime, status, delay }: { dateTime: string; status: MovementStatus; delay: string }) {
  const isDelayed = delay.startsWith("+") && (status === "Actual" || status === "ETA" || status === "ETD");
  const classes = isDelayed
    ? "bg-[#ef4444] text-white"
    : status === "Planned"
      ? "bg-[#f59e0b] text-white"
      : "bg-[#16a34a] text-white";

  return <span className={`inline-flex rounded-xl px-3 py-2 text-sm font-black ${classes}`}>{dateTime}</span>;
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

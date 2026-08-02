"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  exportExcelWorkbook,
  exportTabularData,
  type ExportFormat,
} from "../../../exportData";

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  alertCount?: number;
  active?: boolean;
};

type ComplianceStatus = "Compliant" | "Non-compliant";

type JourneyRow = {
  id: string;
  date: string;
  operatingSite: string;
  linkUser: string;
  vehicle: string;
  from: string;
  to: string;
  journeyStart: string;
  journeyEnd: string;
  intermediateEvent: string;
  linkDuty: string;
  linkLegAdded: boolean;
  complianceStatus: ComplianceStatus;
  complianceReason: string;
};

type SiteSummary = {
  site: string;
  total: number;
  compliant: number;
  nonCompliant: number;
  plannedIntermediateEvents: number;
  compliancePercent: number;
  nonCompliancePercent: number;
};

type TrendBucket = {
  label: string;
  fullLabel: string;
  compliant: number;
  nonCompliant: number;
  total: number;
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
  { label: "Reports", icon: "REP", href: "/internal/app-ideas/link-message-mock/reports", active: true },
  { label: "A&D Dashboard", icon: "A&D", href: "/internal/app-ideas/link-message-mock/arrivals-departures" },
  { label: "System Configurations", icon: "⚙", href: "/internal/app-ideas/link-message-mock/configurations" },
];

const operatingSites = [
  "ABERDEEN VOC",
  "BELFAST VOC",
  "BIRMINGHAM VOC",
  "CHELMSFORD VOC",
  "COVENTRY NATIONAL HUB VOC",
  "CROYDON VOC",
  "EDINBURGH VOC",
  "GLASGOW VOC",
  "MANCHESTER VOC",
  "MIDLANDS SUPER HUB VOC",
  "NORTH WEST SUPER HUB VOC",
  "PRINCESS ROYAL DC VOC",
  "SOUTH EAST DC VOC",
  "SOUTH WEST DC VOC",
  "WARRINGTON VOC",
  "YORKSHIRE DC VOC",
] as const;

const linkUsers = [
  "Andrew Cannon",
  "Chris Morgan",
  "Daniel Hughes",
  "Emma Williams",
  "James Carter",
  "Lisa Thompson",
  "Mark Davies",
  "Rachel Evans",
] as const;

const vehicles = [
  "PE68UHD",
  "PN70BUA",
  "PJ24SNN",
  "PE18MDN",
  "PF68UVW",
  "PK19VJV",
  "PJ67WJA",
  "PE17HNW",
  "PN74CDY",
  "MX73BWW",
  "PN25MHS",
  "MX21DCT",
] as const;

const routes = [
  ["NORTH WEST SUPER HUB VOC", "MANCHESTER VOC"],
  ["MANCHESTER VOC", "NORTH WEST SUPER HUB VOC"],
  ["MIDLANDS SUPER HUB VOC", "BIRMINGHAM VOC"],
  ["BIRMINGHAM VOC", "MIDLANDS SUPER HUB VOC"],
  ["PRINCESS ROYAL DC VOC", "CROYDON VOC"],
  ["SOUTH EAST DC VOC", "CHELMSFORD VOC"],
  ["YORKSHIRE DC VOC", "WARRINGTON VOC"],
  ["GLASGOW VOC", "EDINBURGH VOC"],
] as const;

const intermediateLocations = [
  "Charnock Richard Services",
  "Knutsford Services",
  "Keele Services",
  "Sandbach Services",
  "Stafford Services",
] as const;

const nonComplianceReasons = [
  "Vehicle movement not entered in LINK",
  "Journey added after the vehicle departed",
  "Incorrect operating site selected",
  "Return leg missing from the duty",
] as const;

const defaultRange = getDefaultRange();

export function JourneyComplianceDashboard() {
  const allRows = useMemo(() => buildMockJourneyRows(), []);

  const [period, setPeriod] = useState("7");
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [selectedSite, setSelectedSite] = useState("All sites");
  const [selectedUser, setSelectedUser] = useState("All users");
  const [selectedStatus, setSelectedStatus] = useState("All journeys");
  const [tableSearch, setTableSearch] = useState("");
  const [downloadOpen, setDownloadOpen] = useState(false);

  const filteredRows = useMemo(() => {
    const search = tableSearch.trim().toLowerCase();

    return allRows.filter((row) => {
      if (row.date < startDate || row.date > endDate) return false;
      if (selectedSite !== "All sites" && row.operatingSite !== selectedSite) return false;
      if (selectedUser !== "All users" && row.linkUser !== selectedUser) return false;
      if (selectedStatus !== "All journeys" && row.complianceStatus !== selectedStatus) return false;
      if (!search) return true;

      return [
        row.operatingSite,
        row.linkUser,
        row.vehicle,
        row.from,
        row.to,
        row.linkDuty,
        row.complianceReason,
      ].some((value) => value.toLowerCase().includes(search));
    });
  }, [allRows, endDate, selectedSite, selectedStatus, selectedUser, startDate, tableSearch]);

  const dashboardRows = useMemo(
    () => allRows.filter((row) => {
      if (row.date < startDate || row.date > endDate) return false;
      if (selectedSite !== "All sites" && row.operatingSite !== selectedSite) return false;
      if (selectedUser !== "All users" && row.linkUser !== selectedUser) return false;
      if (selectedStatus !== "All journeys" && row.complianceStatus !== selectedStatus) return false;
      return true;
    }),
    [allRows, endDate, selectedSite, selectedStatus, selectedUser, startDate],
  );

  const totals = useMemo(() => calculateTotals(dashboardRows), [dashboardRows]);
  const siteSummary = useMemo(() => buildSiteSummary(dashboardRows), [dashboardRows]);
  const trend = useMemo(() => buildTrendBuckets(dashboardRows), [dashboardRows]);
  const reasonBreakdown = useMemo(() => buildReasonBreakdown(dashboardRows), [dashboardRows]);

  const changePeriod = (value: string) => {
    setPeriod(value);
    if (value === "custom") return;

    const numberOfDays = Number(value);
    const range = getDateRange(numberOfDays);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const changeDate = (target: "start" | "end", value: string) => {
    setPeriod("custom");
    if (target === "start") setStartDate(value);
    else setEndDate(value);
  };

  const resetFilters = () => {
    const range = getDateRange(7);
    setPeriod("7");
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setSelectedSite("All sites");
    setSelectedUser("All users");
    setSelectedStatus("All journeys");
    setTableSearch("");
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#111827]">
      <OfficeHeader />
      <div className="flex min-w-0">
        <OfficeSidebar />

        <main className="min-w-0 flex-1 p-3 sm:p-5">
          <section className="rounded-[22px] border border-[#d6dde8] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Alternative report design</p>
                <h1 className="mt-2 text-3xl font-black text-[#10203a]">Site &amp; User Journey Compliance Dashboard</h1>
                <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-[#4b5563]">
                  Compare tracked vehicle movements against LINK journey legs, identify missing journeys and investigate compliance by date, operating site and LINK user.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Link
                  href="/internal/app-ideas/link-message-mock/reports"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#c7d2df] bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-[#10203a] no-underline transition hover:bg-[#f8fafc]"
                >
                  ← Back to report options
                </Link>
                <button
                  type="button"
                  onClick={() => setDownloadOpen(true)}
                  className="min-h-11 rounded-xl bg-[#10203a] px-5 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-white shadow-sm transition hover:bg-[#1e3558]"
                >
                  Select dates and site download
                </button>
              </div>
            </div>

            <section className="mt-5 overflow-hidden rounded-[18px] border border-[#273b52] bg-[#31485f] shadow-sm">
              <div className="border-b border-white/15 px-4 py-2.5">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-white">Dashboard filters</p>
              </div>
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
                <FilterSelect label="Reporting period" value={period} onChange={changePeriod}>
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="custom">Custom dates</option>
                </FilterSelect>
                <FilterDate label="Start date" value={startDate} onChange={(value) => changeDate("start", value)} />
                <FilterDate label="End date" value={endDate} onChange={(value) => changeDate("end", value)} />
                <FilterSelect label="Operating site / VOC" value={selectedSite} onChange={setSelectedSite}>
                  <option>All sites</option>
                  {operatingSites.map((site) => <option key={site}>{site}</option>)}
                </FilterSelect>
                <FilterSelect label="LINK user" value={selectedUser} onChange={setSelectedUser}>
                  <option>All users</option>
                  {linkUsers.map((user) => <option key={user}>{user}</option>)}
                </FilterSelect>
                <FilterSelect label="Compliance status" value={selectedStatus} onChange={setSelectedStatus}>
                  <option>All journeys</option>
                  <option>Compliant</option>
                  <option>Non-compliant</option>
                </FilterSelect>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="h-[42px] w-full rounded-lg border border-white/35 bg-white/10 px-3 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-white/20"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            </section>

            {startDate > endDate ? (
              <div className="mt-4 rounded-xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-black text-[#b91c1c]">
                The start date must be before the end date.
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <KpiCard label="Tracked journeys" value={formatNumber(totals.total)} helper="Vehicle movements reviewed" icon="↔" />
              <KpiCard label="Compliant journeys" value={formatNumber(totals.compliant)} helper={`${totals.compliancePercent}% of selected journeys`} tone="success" icon="✓" />
              <KpiCard label="Non-compliant" value={formatNumber(totals.nonCompliant)} helper={`${totals.nonCompliancePercent}% require investigation`} tone="danger" icon="!" />
              <KpiCard label="Planned intermediate events" value={formatNumber(totals.intermediateEvents)} helper="Not treated as destinations" tone="info" icon="◆" />
              <KpiCard label="Sites below 95%" value={formatNumber(siteSummary.filter((site) => site.compliancePercent < 95).length)} helper="Operating sites requiring review" tone="warning" icon="△" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1.6fr_1.1fr]">
              <ComplianceDonut totals={totals} />
              <DailyTrendChart buckets={trend} />
              <SiteRiskChart sites={siteSummary} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_0.85fr]">
              <SitePerformanceTable rows={siteSummary} />
              <ReasonBreakdown reasons={reasonBreakdown} total={totals.nonCompliant} />
            </div>

            <section className="mt-4 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-white">
              <div className="flex flex-col gap-3 border-b border-[#d7dee9] bg-[#f8fafc] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-base font-black text-[#10203a]">Journey investigation data</p>
                  <p className="mt-1 text-xs font-bold text-[#64748b]">
                    {formatNumber(filteredRows.length)} journeys match the selected dashboard filters and table search.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                  <input
                    value={tableSearch}
                    onChange={(event) => setTableSearch(event.target.value)}
                    placeholder="Search site, user, vehicle or duty"
                    className="min-h-10 w-full rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm font-bold text-[#10203a] outline-none focus:border-[#0f3a6d] sm:w-[310px]"
                  />
                  <button
                    type="button"
                    onClick={() => setDownloadOpen(true)}
                    className="min-h-10 rounded-lg border border-[#0f3a6d] bg-white px-4 text-xs font-black uppercase tracking-[0.07em] text-[#0f3a6d] transition hover:bg-[#eff6ff]"
                  >
                    Download data
                  </button>
                </div>
              </div>

              <div className="max-h-[480px] overflow-auto">
                <table className="min-w-[1450px] w-full border-collapse text-xs">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#31485f] text-left font-black uppercase tracking-[0.06em] text-white">
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Operating site / VOC</th>
                      <th className="px-3 py-3">LINK user</th>
                      <th className="px-3 py-3">Vehicle</th>
                      <th className="px-3 py-3">From</th>
                      <th className="px-3 py-3">To</th>
                      <th className="px-3 py-3">Journey start</th>
                      <th className="px-3 py-3">Journey end</th>
                      <th className="px-3 py-3">Intermediate event</th>
                      <th className="px-3 py-3">LINK duty</th>
                      <th className="px-3 py-3">LINK leg</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="px-5 py-12 text-center text-sm font-black text-[#64748b]">
                          No journey data matches the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.slice(0, 120).map((row, index) => (
                        <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-black text-[#10203a]">{formatDisplayDate(row.date)}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#10203a]">{row.operatingSite}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#334155]">{row.linkUser}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-black text-[#10203a]">{row.vehicle}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#334155]">{row.from}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#334155]">{row.to}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#334155]">{row.journeyStart}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#334155]">{row.journeyEnd}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#334155]">{row.intermediateEvent || "—"}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-black text-[#10203a]">{row.linkDuty}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${row.linkLegAdded ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>
                              {row.linkLegAdded ? "Added" : "Missing"}
                            </span>
                          </td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5"><StatusPill status={row.complianceStatus} /></td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#475569]">{row.complianceReason}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {filteredRows.length > 120 ? (
                <div className="border-t border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-xs font-bold text-[#64748b]">
                  Showing the first 120 of {formatNumber(filteredRows.length)} matching journeys. Use the download button for the complete data set.
                </div>
              ) : null}
            </section>

            <div className="mt-4 rounded-[16px] border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3">
              <p className="text-sm font-black text-[#0f3a6d]">Compliance logic used by this dashboard</p>
              <p className="mt-1 text-sm font-bold leading-6 text-[#1e3a5f]">
                Every tracked departure from an operational site should have a corresponding LINK leg. Motorway services, fuel stops, workshops and planned trailer swaps are treated as intermediate events. A scheduled trailer swap is matched to the existing LINK journey and does not create an additional missing leg.
              </p>
            </div>
          </section>
        </main>
      </div>

      {downloadOpen ? (
        <DownloadModal
          allRows={allRows}
          defaultStartDate={startDate}
          defaultEndDate={endDate}
          defaultSite={selectedSite}
          onClose={() => setDownloadOpen(false)}
        />
      ) : null}
    </div>
  );
}

function OfficeHeader() {
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
          <p className="text-2xl font-black uppercase tracking-wide">MOCK UP</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Reports Option 2</p>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4">
        <Link
          href="/internal/app-ideas"
          className="hidden rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-white/15 sm:block"
        >
          ← Back to DriverOS Home
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

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/75">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[42px] w-full rounded-lg border border-white/30 bg-white px-3 text-xs font-black text-[#10203a] outline-none focus:border-[#93c5fd]"
      >
        {children}
      </select>
    </label>
  );
}

function FilterDate({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/75">{label}</span>
      <input
        type="date"
        value={value}
        min={defaultRange.minimumDate}
        max={defaultRange.maximumDate}
        onChange={(event) => onChange(event.target.value)}
        className="h-[42px] w-full rounded-lg border border-white/30 bg-white px-3 text-xs font-black text-[#10203a] outline-none focus:border-[#93c5fd]"
      />
    </label>
  );
}

function KpiCard({
  label,
  value,
  helper,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  helper: string;
  icon: string;
  tone?: "default" | "success" | "danger" | "warning" | "info";
}) {
  const toneClasses = {
    default: "border-[#cfd8e3] bg-white text-[#10203a]",
    success: "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]",
    danger: "border-[#fecaca] bg-[#fff1f2] text-[#b91c1c]",
    warning: "border-[#fde68a] bg-[#fffbeb] text-[#a16207]",
    info: "border-[#bae6fd] bg-[#f0f9ff] text-[#075985]",
  }[tone];

  return (
    <article className={`min-h-[118px] rounded-[16px] border p-4 shadow-sm ${toneClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.11em] opacity-80">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-base font-black shadow-sm">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-black leading-none">{value}</p>
      <p className="mt-2 text-xs font-bold opacity-75">{helper}</p>
    </article>
  );
}

function ComplianceDonut({ totals }: { totals: ReturnType<typeof calculateTotals> }) {
  const compliance = totals.total ? totals.compliancePercent : 0;
  return (
    <article className="rounded-[18px] border border-[#d7dee9] bg-white p-4 shadow-sm">
      <div>
        <p className="text-base font-black text-[#10203a]">Compliance split</p>
        <p className="mt-1 text-xs font-bold text-[#64748b]">Compliant versus non-compliant journeys</p>
      </div>
      <div className="mt-4 flex items-center justify-center">
        <div
          className="relative flex h-48 w-48 items-center justify-center rounded-full"
          style={{ background: `conic-gradient(#16a34a 0 ${compliance}%, #dc2626 ${compliance}% 100%)` }}
          aria-label={`${compliance}% compliant`}
        >
          <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">
            <span className="text-4xl font-black text-[#10203a]">{compliance}%</span>
            <span className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-[#64748b]">Compliant</span>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <LegendBox label="Compliant" value={totals.compliant} markerClass="bg-[#16a34a]" />
        <LegendBox label="Non-compliant" value={totals.nonCompliant} markerClass="bg-[#dc2626]" />
      </div>
    </article>
  );
}

function LegendBox({ label, value, markerClass }: { label: string; value: number; markerClass: string }) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-sm ${markerClass}`} />
        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#64748b]">{label}</span>
      </div>
      <p className="mt-1 text-xl font-black text-[#10203a]">{formatNumber(value)}</p>
    </div>
  );
}

function DailyTrendChart({ buckets }: { buckets: TrendBucket[] }) {
  const maximum = Math.max(1, ...buckets.map((bucket) => bucket.total));

  return (
    <article className="min-w-0 rounded-[18px] border border-[#d7dee9] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-black text-[#10203a]">Daily journey compliance trend</p>
          <p className="mt-1 text-xs font-bold text-[#64748b]">Selected date range, grouped into a maximum of 14 periods</p>
        </div>
        <div className="flex gap-3 text-[10px] font-black uppercase tracking-[0.08em] text-[#64748b]">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#16a34a]" />Compliant</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#dc2626]" />Non-compliant</span>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto pb-1">
        <div className="flex min-w-[620px] items-end gap-2 border-b border-[#cbd5e1] px-1 pt-4">
          {buckets.length === 0 ? (
            <div className="flex h-[220px] w-full items-center justify-center text-sm font-black text-[#64748b]">No trend data available</div>
          ) : buckets.map((bucket) => {
            const compliantHeight = (bucket.compliant / maximum) * 190;
            const nonCompliantHeight = (bucket.nonCompliant / maximum) * 190;
            return (
              <div key={bucket.fullLabel} className="flex min-w-0 flex-1 flex-col items-center" title={`${bucket.fullLabel}: ${bucket.compliant} compliant, ${bucket.nonCompliant} non-compliant`}>
                <div className="mb-1 text-[9px] font-black text-[#475569]">{bucket.total}</div>
                <div className="flex h-[190px] w-full max-w-[42px] flex-col justify-end overflow-hidden rounded-t-md bg-[#e2e8f0]">
                  <div className="w-full bg-[#dc2626]" style={{ height: `${nonCompliantHeight}px` }} />
                  <div className="w-full bg-[#16a34a]" style={{ height: `${compliantHeight}px` }} />
                </div>
                <div className="mt-2 min-h-[28px] text-center text-[9px] font-black leading-3 text-[#64748b]">{bucket.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function SiteRiskChart({ sites }: { sites: SiteSummary[] }) {
  const topSites = [...sites].sort((a, b) => b.nonCompliancePercent - a.nonCompliancePercent).slice(0, 6);
  const maximumRate = Math.max(1, ...topSites.map((site) => site.nonCompliancePercent));

  return (
    <article className="rounded-[18px] border border-[#d7dee9] bg-white p-4 shadow-sm">
      <div>
        <p className="text-base font-black text-[#10203a]">Highest non-compliance</p>
        <p className="mt-1 text-xs font-bold text-[#64748b]">Sites ranked by non-compliance percentage</p>
      </div>
      <div className="mt-4 space-y-3">
        {topSites.length === 0 ? (
          <div className="py-16 text-center text-sm font-black text-[#64748b]">No site data available</div>
        ) : topSites.map((site) => (
          <div key={site.site}>
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-[10px] font-black text-[#334155]" title={site.site}>{site.site}</p>
              <p className="shrink-0 text-xs font-black text-[#b91c1c]">{site.nonCompliancePercent}%</p>
            </div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-[#e2e8f0]">
              <div className="h-full rounded-full bg-[#dc2626]" style={{ width: `${Math.max(3, (site.nonCompliancePercent / maximumRate) * 100)}%` }} />
            </div>
            <p className="mt-1 text-[9px] font-bold text-[#64748b]">{site.nonCompliant} of {site.total} journeys</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function SitePerformanceTable({ rows }: { rows: SiteSummary[] }) {
  return (
    <article className="overflow-hidden rounded-[18px] border border-[#d7dee9] bg-white shadow-sm">
      <div className="border-b border-[#d7dee9] bg-[#f8fafc] px-4 py-3">
        <p className="text-base font-black text-[#10203a]">VOC compliance comparison</p>
        <p className="mt-1 text-xs font-bold text-[#64748b]">One summary line per operating site, shown alphabetically</p>
      </div>
      <div className="max-h-[390px] overflow-auto">
        <table className="min-w-[820px] w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#31485f] text-left font-black uppercase tracking-[0.06em] text-white">
              <th className="px-3 py-3">Operating site / VOC</th>
              <th className="px-3 py-3 text-right">Tracked journeys</th>
              <th className="px-3 py-3 text-right">LINK legs added</th>
              <th className="px-3 py-3 text-right">Intermediate events</th>
              <th className="px-3 py-3 text-right">Missing legs</th>
              <th className="px-3 py-3 text-right">Compliance</th>
              <th className="px-3 py-3">Performance</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-sm font-black text-[#64748b]">No site summary is available for the selected filters.</td></tr>
            ) : rows.map((row, index) => (
              <tr key={row.site} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-black text-[#10203a]">{row.site}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-right font-bold text-[#334155]">{formatNumber(row.total)}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-right font-bold text-[#166534]">{formatNumber(row.compliant)}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-right font-bold text-[#075985]">{formatNumber(row.plannedIntermediateEvents)}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-right font-black text-[#b91c1c]">{formatNumber(row.nonCompliant)}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-right font-black text-[#10203a]">{row.compliancePercent}%</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5">
                  <div className="h-3 w-28 overflow-hidden rounded-full bg-[#fee2e2]">
                    <div className="h-full rounded-full bg-[#16a34a]" style={{ width: `${row.compliancePercent}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function ReasonBreakdown({ reasons, total }: { reasons: { reason: string; count: number }[]; total: number }) {
  const maximum = Math.max(1, ...reasons.map((item) => item.count));
  return (
    <article className="rounded-[18px] border border-[#d7dee9] bg-white p-4 shadow-sm">
      <div>
        <p className="text-base font-black text-[#10203a]">Non-compliance reasons</p>
        <p className="mt-1 text-xs font-bold text-[#64748b]">Why LINK legs are missing or incomplete</p>
      </div>
      <div className="mt-5 space-y-5">
        {reasons.length === 0 ? (
          <div className="py-20 text-center text-sm font-black text-[#166534]">No non-compliant journeys in the selected filters.</div>
        ) : reasons.map((item) => {
          const percent = total ? Number(((item.count / total) * 100).toFixed(1)) : 0;
          return (
            <div key={item.reason}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-black leading-4 text-[#334155]">{item.reason}</p>
                <p className="shrink-0 text-sm font-black text-[#b91c1c]">{item.count}</p>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e2e8f0]">
                <div className="h-full rounded-full bg-[#dc2626]" style={{ width: `${Math.max(3, (item.count / maximum) * 100)}%` }} />
              </div>
              <p className="mt-1 text-[10px] font-bold text-[#64748b]">{percent}% of all non-compliant journeys</p>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: ComplianceStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.06em] ${status === "Compliant" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>
      {status}
    </span>
  );
}

function DownloadModal({
  allRows,
  defaultStartDate,
  defaultEndDate,
  defaultSite,
  onClose,
}: {
  allRows: JourneyRow[];
  defaultStartDate: string;
  defaultEndDate: string;
  defaultSite: string;
  onClose: () => void;
}) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [selectedSites, setSelectedSites] = useState<string[]>(
    defaultSite === "All sites" ? [...operatingSites] : [defaultSite],
  );
  const [siteSearch, setSiteSearch] = useState("");
  const [error, setError] = useState("");

  const visibleSites = operatingSites.filter((site) => site.toLowerCase().includes(siteSearch.trim().toLowerCase()));
  const exportRows = useMemo(
    () => allRows.filter((row) => row.date >= startDate && row.date <= endDate && selectedSites.includes(row.operatingSite)),
    [allRows, endDate, selectedSites, startDate],
  );
  const exportSummary = useMemo(() => buildSiteSummary(exportRows), [exportRows]);

  const download = async (format: ExportFormat) => {
    if (startDate > endDate) {
      setError("The start date must be before the end date.");
      return;
    }
    if (selectedSites.length === 0) {
      setError("Select at least one operating site before downloading.");
      return;
    }
    if (exportRows.length === 0) {
      setError("No journey data is available for the selected dates and sites.");
      return;
    }

    setError("");
    const totals = calculateTotals(exportRows);
    const summaryHeaders = [
      "Operating Site / VOC",
      "Tracked Vehicle Journeys",
      "LINK Legs Added",
      "Planned Intermediate Events",
      "Missing LINK Legs",
      "Compliance %",
      "Non-Compliance %",
    ];
    const summaryRows: (string | number)[][] = exportSummary.map((row) => [
      row.site,
      row.total,
      row.compliant,
      row.plannedIntermediateEvents,
      row.nonCompliant,
      `${row.compliancePercent}%`,
      `${row.nonCompliancePercent}%`,
    ]);
    summaryRows.push([
      "REPORT TOTAL",
      totals.total,
      totals.compliant,
      totals.intermediateEvents,
      totals.nonCompliant,
      `${totals.compliancePercent}%`,
      `${totals.nonCompliancePercent}%`,
    ]);

    if (format === "excel") {
      await exportExcelWorkbook({
        fileName: `site-user-journey-compliance-${startDate}-to-${endDate}`,
        sheets: [
          { name: "VOC Summary", headers: summaryHeaders, rows: summaryRows },
          {
            name: "Raw Journey Data",
            headers: [
              "Date",
              "Operating Site / VOC",
              "Vehicle",
              "From",
              "To",
              "Journey Started",
              "Journey Ended",
              "LINK Duty",
              "LINK User",
              "Intermediate Event",
              "LINK Leg Added",
              "Compliance Status",
              "Compliance Reason",
            ],
            rows: exportRows.map((row) => [
              row.date,
              row.operatingSite,
              row.vehicle,
              row.from,
              row.to,
              row.journeyStart,
              row.journeyEnd,
              row.linkDuty,
              row.linkUser,
              row.intermediateEvent,
              row.linkLegAdded ? "Yes" : "No",
              row.complianceStatus,
              row.complianceReason,
            ]),
          },
        ],
      });
      return;
    }

    exportTabularData({
      format,
      headers: summaryHeaders,
      rows: summaryRows,
      fileName: `site-user-journey-compliance-${startDate}-to-${endDate}`,
      title: "Site & User Journey Compliance Report",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07101f]/65 p-4" role="dialog" aria-modal="true" aria-labelledby="dashboard-download-title">
      <div className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-[24px] border border-[#cfd8e3] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-[#10203a] px-5 py-4 text-white sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Report download</p>
            <h2 id="dashboard-download-title" className="mt-1 text-2xl font-black">Site &amp; User Journey Compliance Report</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 text-xl font-black text-white transition hover:bg-white/10"
            aria-label="Close report download"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(94vh-82px)] overflow-y-auto p-5 sm:p-6">
          <div className="rounded-[16px] border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3">
            <p className="text-sm font-black text-[#0f3a6d]">Download contents</p>
            <p className="mt-1 text-sm font-bold leading-6 text-[#1e3a5f]">
              Excel contains a VOC Summary tab and a Raw Journey Data tab. CSV and PDF contain the VOC summary for the selected date range and operating sites.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ModalDateBox label="Start date" value={startDate} onChange={setStartDate} />
            <ModalDateBox label="End date" value={endDate} onChange={setEndDate} />
          </div>

          <section className="mt-5 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-[#f8fafc]">
            <div className="flex flex-col gap-3 border-b border-[#d7dee9] bg-[#e9eef9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#10203a]">Operating sites</p>
                <p className="mt-1 text-xs font-bold text-[#4b5563]">{selectedSites.length} of {operatingSites.length} sites selected</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSelectedSites([...operatingSites])} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#0f3a6d] ring-1 ring-[#c7d2df]">Select all</button>
                <button type="button" onClick={() => setSelectedSites([])} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#10203a] ring-1 ring-[#c7d2df]">Clear all</button>
              </div>
            </div>
            <div className="p-3">
              <input
                value={siteSearch}
                onChange={(event) => setSiteSearch(event.target.value)}
                placeholder="Search by operating site"
                className="w-full rounded-xl border border-[#cfd8e3] bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#0f3a6d]"
              />
              <div className="mt-3 grid max-h-56 grid-cols-1 overflow-y-auto rounded-xl border border-[#d7dee9] sm:grid-cols-2">
                {visibleSites.map((site) => (
                  <label key={site} className="flex cursor-pointer items-center justify-between border-b border-r border-[#e2e8f0] bg-white px-4 py-2.5 text-xs font-black text-[#10203a]">
                    <span>{site}</span>
                    <input
                      type="checkbox"
                      checked={selectedSites.includes(site)}
                      onChange={() => setSelectedSites((current) => current.includes(site) ? current.filter((value) => value !== site) : [...current, site])}
                      className="h-4 w-4 accent-[#0f3a6d]"
                    />
                  </label>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniMetric label="Journeys" value={exportRows.length} />
            <MiniMetric label="Compliant" value={exportRows.filter((row) => row.complianceStatus === "Compliant").length} />
            <MiniMetric label="Non-compliant" value={exportRows.filter((row) => row.complianceStatus === "Non-compliant").length} alert />
            <MiniMetric label="Sites" value={exportSummary.length} />
          </div>

          {error ? <div className="mt-4 rounded-xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-black text-[#b91c1c]">{error}</div> : null}

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <DownloadButton label="Download Excel" helper="Summary + raw data" onClick={() => download("excel")} />
            <DownloadButton label="Download CSV" helper="VOC summary" onClick={() => download("csv")} />
            <DownloadButton label="Download PDF" helper="VOC summary" onClick={() => download("pdf")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalDateBox({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="rounded-[16px] border border-[#d7dee9] bg-[#f8fafc] p-4">
      <span className="block text-xs font-black uppercase tracking-[0.13em] text-[#64748b]">{label}</span>
      <input
        type="date"
        value={value}
        min={defaultRange.minimumDate}
        max={defaultRange.maximumDate}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm font-black text-[#10203a] outline-none focus:border-[#0f3a6d]"
      />
    </label>
  );
}

function MiniMetric({ label, value, alert = false }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-3 ${alert ? "border-[#fecaca] bg-[#fff1f2]" : "border-[#d7dee9] bg-[#f8fafc]"}`}>
      <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${alert ? "text-[#b91c1c]" : "text-[#64748b]"}`}>{label}</p>
      <p className={`mt-1 text-2xl font-black ${alert ? "text-[#b91c1c]" : "text-[#10203a]"}`}>{formatNumber(value)}</p>
    </div>
  );
}

function DownloadButton({ label, helper, onClick }: { label: string; helper: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-[14px] bg-[#10203a] px-4 py-4 text-left text-white transition hover:bg-[#1e3558]">
      <span className="block text-sm font-black uppercase tracking-[0.07em]">{label}</span>
      <span className="mt-1 block text-xs font-bold text-white/70">{helper}</span>
    </button>
  );
}

function buildMockJourneyRows(): JourneyRow[] {
  const rows: JourneyRow[] = [];
  const end = parseDate(defaultRange.maximumDate);
  let rowNumber = 0;

  for (let dayOffset = 44; dayOffset >= 0; dayOffset -= 1) {
    const date = new Date(end);
    date.setDate(end.getDate() - dayOffset);
    const dateString = formatDateInput(date);
    const dayIndex = 44 - dayOffset;

    operatingSites.forEach((site, siteIndex) => {
      const numberOfJourneys = 2 + ((dayIndex + siteIndex) % 4);

      for (let journeyIndex = 0; journeyIndex < numberOfJourneys; journeyIndex += 1) {
        rowNumber += 1;
        const route = routes[(siteIndex + journeyIndex + dayIndex) % routes.length];
        const vehicle = vehicles[(siteIndex * 2 + journeyIndex + dayIndex) % vehicles.length];
        const user = linkUsers[(siteIndex + journeyIndex * 2 + dayIndex) % linkUsers.length];
        const hour = 4 + ((siteIndex * 3 + journeyIndex * 4 + dayIndex) % 18);
        const minute = ((journeyIndex * 17 + siteIndex * 7) % 4) * 15;
        const duration = 48 + ((siteIndex + journeyIndex * 11 + dayIndex) % 95);
        const start = new Date(date);
        start.setHours(hour, minute, 0, 0);
        const finish = new Date(start);
        finish.setMinutes(finish.getMinutes() + duration);

        const hasIntermediate = (rowNumber + siteIndex) % 9 === 0;
        const isPlannedTrailerSwap = hasIntermediate && (rowNumber + dayIndex) % 3 === 0;
        const nonCompliantSeed = (dayIndex * 13 + siteIndex * 17 + journeyIndex * 19) % 100;
        const siteRiskAdjustment = [0, 2, 4, 1, 7, 3, 0, 2, 6, 1, 5, 0, 3, 8, 4, 2][siteIndex];
        const isNonCompliant = !isPlannedTrailerSwap && nonCompliantSeed < 8 + siteRiskAdjustment;
        const reason = isNonCompliant
          ? nonComplianceReasons[(siteIndex + journeyIndex + dayIndex) % nonComplianceReasons.length]
          : isPlannedTrailerSwap
            ? "Planned trailer swap matched to the existing LINK journey"
            : hasIntermediate
              ? "Intermediate service or fuel stop retained within the existing LINK journey"
              : "Tracked journey matched to a LINK leg";

        rows.push({
          id: `JRN-${String(rowNumber).padStart(5, "0")}`,
          date: dateString,
          operatingSite: site,
          linkUser: user,
          vehicle,
          from: journeyIndex % 3 === 0 ? site : route[0],
          to: journeyIndex % 3 === 0 ? route[1] : site,
          journeyStart: formatDateTime(start),
          journeyEnd: formatDateTime(finish),
          intermediateEvent: hasIntermediate ? intermediateLocations[(siteIndex + journeyIndex) % intermediateLocations.length] : "",
          linkDuty: isNonCompliant && reason === "Vehicle movement not entered in LINK" ? "Not entered" : `${site.slice(0, 3)}${String(500 + ((dayIndex * 9 + siteIndex * 5 + journeyIndex) % 480)).padStart(3, "0")}`,
          linkLegAdded: !isNonCompliant,
          complianceStatus: isNonCompliant ? "Non-compliant" : "Compliant",
          complianceReason: reason,
        });
      }
    });
  }

  return rows.sort((left, right) => `${right.date}${right.journeyStart}`.localeCompare(`${left.date}${left.journeyStart}`));
}

function calculateTotals(rows: JourneyRow[]) {
  const total = rows.length;
  const compliant = rows.filter((row) => row.complianceStatus === "Compliant").length;
  const nonCompliant = total - compliant;
  const intermediateEvents = rows.filter((row) => row.intermediateEvent).length;
  return {
    total,
    compliant,
    nonCompliant,
    intermediateEvents,
    compliancePercent: total ? Number(((compliant / total) * 100).toFixed(1)) : 0,
    nonCompliancePercent: total ? Number(((nonCompliant / total) * 100).toFixed(1)) : 0,
  };
}

function buildSiteSummary(rows: JourneyRow[]): SiteSummary[] {
  const grouped = new Map<string, JourneyRow[]>();
  rows.forEach((row) => grouped.set(row.operatingSite, [...(grouped.get(row.operatingSite) ?? []), row]));

  return [...grouped.entries()]
    .map(([site, siteRows]) => {
      const totals = calculateTotals(siteRows);
      return {
        site,
        total: totals.total,
        compliant: totals.compliant,
        nonCompliant: totals.nonCompliant,
        plannedIntermediateEvents: totals.intermediateEvents,
        compliancePercent: totals.compliancePercent,
        nonCompliancePercent: totals.nonCompliancePercent,
      };
    })
    .sort((left, right) => left.site.localeCompare(right.site));
}

function buildTrendBuckets(rows: JourneyRow[]): TrendBucket[] {
  if (rows.length === 0) return [];
  const byDate = new Map<string, JourneyRow[]>();
  rows.forEach((row) => byDate.set(row.date, [...(byDate.get(row.date) ?? []), row]));
  const dates = [...byDate.keys()].sort();
  const groupSize = Math.max(1, Math.ceil(dates.length / 14));
  const buckets: TrendBucket[] = [];

  for (let index = 0; index < dates.length; index += groupSize) {
    const groupDates = dates.slice(index, index + groupSize);
    const groupRows = groupDates.flatMap((date) => byDate.get(date) ?? []);
    const totals = calculateTotals(groupRows);
    const first = formatShortDate(groupDates[0]);
    const last = formatShortDate(groupDates[groupDates.length - 1]);
    buckets.push({
      label: groupDates.length === 1 ? first : `${first}–${last}`,
      fullLabel: groupDates.length === 1 ? formatDisplayDate(groupDates[0]) : `${formatDisplayDate(groupDates[0])} to ${formatDisplayDate(groupDates[groupDates.length - 1])}`,
      compliant: totals.compliant,
      nonCompliant: totals.nonCompliant,
      total: totals.total,
    });
  }

  return buckets;
}

function buildReasonBreakdown(rows: JourneyRow[]) {
  const counts = new Map<string, number>();
  rows.filter((row) => row.complianceStatus === "Non-compliant").forEach((row) => counts.set(row.complianceReason, (counts.get(row.complianceReason) ?? 0) + 1));
  return [...counts.entries()].map(([reason, count]) => ({ reason, count })).sort((left, right) => right.count - left.count);
}

function getDefaultRange() {
  const maximumDate = formatDateInput(new Date());
  const minimum = new Date();
  minimum.setDate(minimum.getDate() - 44);
  const minimumDate = formatDateInput(minimum);
  const range = getDateRange(7);
  return { ...range, minimumDate, maximumDate };
}

function getDateRange(numberOfDays: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (numberOfDays - 1));
  return { startDate: formatDateInput(start), endDate: formatDateInput(end) };
}

function formatDateInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value).replace(",", "");
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(parseDate(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(parseDate(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

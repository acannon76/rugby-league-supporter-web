"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  exportExcelWorkbook,
  exportTabularData,
  type ExportFormat,
} from "../../../exportData";
import {
  downloadNationalLocalPlanDashboardPdf,
  type NationalLocalPlanDashboardPdfFilters,
} from "../nationalLocalPlanDashboardPdf";
import {
  ScheduledReportsManager,
  type ScheduledReport,
} from "../ScheduledReportsManager";
import {
  addDays,
  availableLocations,
  buildNationalLocalPlanRows,
  formatDate,
  getCompletedDateRange,
  regionOrder,
  roundOne,
  timingCodes,
  timingColours,
  timingLabels,
  type ChangeBand,
  type NationalLocalPlanRow,
  type TimingCode,
  type TimingCounts,
  type TimingProfile,
  type VolumeBand,
} from "./nationalLocalPlanDashboardData";

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  alertCount?: number;
  active?: boolean;
};

type DashboardTotals = {
  national: number;
  local: number;
  adjusted: number;
  retainedPercent: number;
  adjustedPercent: number;
  siteCount: number;
  rowCount: number;
  timingCounts: TimingCounts;
  timingPercentages: TimingCounts;
  earlyPercent: number;
  lateRiskPercent: number;
};

type DailySummary = DashboardTotals & {
  date: string;
  dayLabel: string;
};

type SiteSummary = DashboardTotals & {
  site: string;
  region: string;
  activeDays: number;
  changeBand: ChangeBand;
  timingProfile: TimingProfile;
};

type ChangeSummary = {
  label: ChangeBand;
  rows: number;
  adjustedDuties: number;
  percentage: number;
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

const changeBands: ChangeBand[] = ["No change", "Low change", "Moderate change", "High change"];
const volumeBands: VolumeBand[] = ["Under 25", "25 to 74", "75 to 149", "150 and over"];
const timingProfiles: TimingProfile[] = ["On-time led", "Early weighted", "Balanced", "Late risk", "Failed risk"];
const SCHEDULED_REPORTS_STORAGE_KEY = "driveros-mock-scheduled-reports";

export function NationalLocalPlanDashboard() {
  const [sourceRange] = useState(() => getCompletedDateRange(7));
  const allRows = useMemo(() => buildNationalLocalPlanRows(sourceRange.dates), [sourceRange.dates]);

  const [period, setPeriod] = useState("7");
  const [startDate, setStartDate] = useState(sourceRange.startDate);
  const [endDate, setEndDate] = useState(sourceRange.endDate);
  const [selectedRegion, setSelectedRegion] = useState("All regions");
  const [selectedSite, setSelectedSite] = useState("All sites");
  const [selectedChangeBand, setSelectedChangeBand] = useState("All change levels");
  const [selectedVolumeBand, setSelectedVolumeBand] = useState("All volumes");
  const [selectedTimingProfile, setSelectedTimingProfile] = useState("All timing profiles");
  const [tableSearch, setTableSearch] = useState("");
  const [siteSort, setSiteSort] = useState("Adjusted duties");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [scheduledReportsLoaded, setScheduledReportsLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedSchedules = window.localStorage.getItem(SCHEDULED_REPORTS_STORAGE_KEY);
        if (savedSchedules) {
          const parsed = JSON.parse(savedSchedules) as ScheduledReport[];
          if (Array.isArray(parsed)) setScheduledReports(parsed.slice(0, 10));
        }
      } catch {
        setScheduledReports([]);
      } finally {
        setScheduledReportsLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!scheduledReportsLoaded) return;
    window.localStorage.setItem(SCHEDULED_REPORTS_STORAGE_KEY, JSON.stringify(scheduledReports));
  }, [scheduledReports, scheduledReportsLoaded]);

  const sitesForRegion = useMemo(() => {
    if (selectedRegion === "All regions") return [...availableLocations];
    return [...new Set(allRows.filter((row) => row.region === selectedRegion).map((row) => row.site))].sort((a, b) => a.localeCompare(b));
  }, [allRows, selectedRegion]);

  const filteredRows = useMemo(() => allRows.filter((row) => {
    if (row.date < startDate || row.date > endDate) return false;
    if (selectedRegion !== "All regions" && row.region !== selectedRegion) return false;
    if (selectedSite !== "All sites" && row.site !== selectedSite) return false;
    if (selectedChangeBand !== "All change levels" && row.changeBand !== selectedChangeBand) return false;
    if (selectedVolumeBand !== "All volumes" && row.volumeBand !== selectedVolumeBand) return false;
    if (selectedTimingProfile !== "All timing profiles" && row.timingProfile !== selectedTimingProfile) return false;
    return true;
  }), [allRows, endDate, selectedChangeBand, selectedRegion, selectedSite, selectedTimingProfile, selectedVolumeBand, startDate]);

  const detailRows = useMemo(() => {
    const search = tableSearch.trim().toLowerCase();
    if (!search) return filteredRows;
    return filteredRows.filter((row) => [row.site, row.region, row.dayLabel, row.changeBand, row.timingProfile]
      .some((value) => value.toLowerCase().includes(search)));
  }, [filteredRows, tableSearch]);

  const totals = useMemo(() => calculateTotals(filteredRows), [filteredRows]);
  const dailySummary = useMemo(() => buildDailySummary(filteredRows), [filteredRows]);
  const siteSummary = useMemo(() => sortSiteSummary(buildSiteSummary(filteredRows), siteSort), [filteredRows, siteSort]);
  const changeSummary = useMemo(() => buildChangeSummary(filteredRows), [filteredRows]);
  const scheduledCount = scheduledReports.filter((schedule) => schedule.source === "national-local").length;
  const invalidRange = !startDate || !endDate || startDate > endDate || startDate < sourceRange.startDate || endDate > sourceRange.endDate;

  const changePeriod = (value: string) => {
    setPeriod(value);
    if (value === "custom") return;
    const days = Number(value);
    setStartDate(addDays(sourceRange.endDate, -(days - 1)));
    setEndDate(sourceRange.endDate);
  };

  const changeDate = (target: "start" | "end", value: string) => {
    setPeriod("custom");
    if (target === "start") setStartDate(value);
    else setEndDate(value);
  };

  const changeRegion = (value: string) => {
    setSelectedRegion(value);
    setSelectedSite("All sites");
  };

  const resetFilters = () => {
    setPeriod("7");
    setStartDate(sourceRange.startDate);
    setEndDate(sourceRange.endDate);
    setSelectedRegion("All regions");
    setSelectedSite("All sites");
    setSelectedChangeBand("All change levels");
    setSelectedVolumeBand("All volumes");
    setSelectedTimingProfile("All timing profiles");
    setTableSearch("");
    setSiteSort("Adjusted duties");
  };

  const saveScheduledReport = (schedule: ScheduledReport) => {
    setScheduledReports((current) => {
      const exists = current.some((item) => item.id === schedule.id);
      if (exists) return current.map((item) => item.id === schedule.id ? schedule : item);
      return current.length < 10 ? [...current, schedule] : current;
    });
  };

  const removeScheduledReport = (id: string) => {
    setScheduledReports((current) => current.filter((schedule) => schedule.id !== id));
  };

  const filters: NationalLocalPlanDashboardPdfFilters = {
    startDate,
    endDate,
    region: selectedRegion,
    site: selectedSite,
    changeBand: selectedChangeBand,
    volumeBand: selectedVolumeBand,
    timingProfile: selectedTimingProfile,
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
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d97706]">National planning dashboard</p>
                  {scheduledCount > 0 ? <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#166534]">{scheduledCount} scheduled</span> : null}
                </div>
                <h1 className="mt-2 text-3xl font-black text-[#10203a]">National vs Local Plan Dashboard</h1>
                <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-[#4b5563]">
                  Compare National Duties Planned with the Local Agreed Plan, quantify local adjustments and review VE, E, OT, L, VL and F performance across the same seven completed days used by the original report.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap xl:justify-end">
                <Link href="/internal/app-ideas/link-message-mock/reports" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#c7d2df] bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-[#10203a] no-underline transition hover:bg-[#f8fafc]">← Back to reports</Link>
                <button type="button" onClick={() => setDownloadOpen(true)} disabled={!filteredRows.length || invalidRange} className="min-h-11 rounded-xl bg-[#10203a] px-5 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-white shadow-sm transition hover:bg-[#1e3558] disabled:cursor-not-allowed disabled:bg-[#94a3b8]">Download selected report</button>
                <button type="button" onClick={() => setSchedulerOpen(true)} className="min-h-11 rounded-xl border-2 border-[#0f3a6d] bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-[#0f3a6d] transition hover:bg-[#eff6ff]">Schedule email</button>
              </div>
            </div>

            <section className="mt-5 overflow-hidden rounded-[18px] border border-[#273b52] bg-[#31485f] shadow-sm">
              <div className="flex flex-col gap-1 border-b border-white/15 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-white">Dashboard filters</p>
                <p className="text-xs font-bold text-white/70">Every KPI, chart, table and download responds to this selection</p>
              </div>
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
                <FilterSelect label="Reporting period" value={period} onChange={changePeriod}>
                  <option value="3">Last 3 completed days</option>
                  <option value="5">Last 5 completed days</option>
                  <option value="7">Last 7 completed days</option>
                  <option value="custom">Custom dates</option>
                </FilterSelect>
                <FilterDate label="Start date" value={startDate} min={sourceRange.startDate} max={sourceRange.endDate} onChange={(value) => changeDate("start", value)} />
                <FilterDate label="End date" value={endDate} min={sourceRange.startDate} max={sourceRange.endDate} onChange={(value) => changeDate("end", value)} />
                <FilterSelect label="Region" value={selectedRegion} onChange={changeRegion}>
                  <option>All regions</option>
                  {regionOrder.map((region) => <option key={region}>{region}</option>)}
                </FilterSelect>
                <FilterSelect label="Reporting site" value={selectedSite} onChange={setSelectedSite}>
                  <option>All sites</option>
                  {sitesForRegion.map((site) => <option key={site}>{site}</option>)}
                </FilterSelect>
                <FilterSelect label="Plan change" value={selectedChangeBand} onChange={setSelectedChangeBand}>
                  <option>All change levels</option>
                  {changeBands.map((band) => <option key={band}>{band}</option>)}
                </FilterSelect>
                <FilterSelect label="National volume" value={selectedVolumeBand} onChange={setSelectedVolumeBand}>
                  <option>All volumes</option>
                  {volumeBands.map((band) => <option key={band}>{band}</option>)}
                </FilterSelect>
                <FilterSelect label="Timing profile" value={selectedTimingProfile} onChange={setSelectedTimingProfile}>
                  <option>All timing profiles</option>
                  {timingProfiles.map((profile) => <option key={profile}>{profile}</option>)}
                </FilterSelect>
              </div>
              <div className="flex flex-col gap-2 border-t border-white/15 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-bold text-white/70">Source coverage: {formatDate(sourceRange.startDate)} to {formatDate(sourceRange.endDate)} — the latest seven completed days.</p>
                <button type="button" onClick={resetFilters} className="rounded-lg border border-white/35 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-white/20">Reset filters</button>
              </div>
            </section>

            {invalidRange ? <div className="mt-4 rounded-xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-black text-[#b91c1c]">Select a valid date range within the latest seven completed days.</div> : null}

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
              <KpiCard label="National duties planned" value={formatNumber(totals.national)} helper={`${totals.siteCount} reporting sites`} icon="N" tone="navy" />
              <KpiCard label="Local agreed plan" value={formatNumber(totals.local)} helper={`${formatNumber(totals.adjusted)} duties adjusted`} icon="L" tone="info" />
              <KpiCard label="Plan retained" value={`${totals.retainedPercent}%`} helper={`${totals.adjustedPercent}% changed locally`} icon="✓" tone="success" />
              <KpiCard label="On time / OT" value={`${totals.timingPercentages.OT}%`} helper={`${formatNumber(totals.timingCounts.OT)} duties`} icon="OT" tone="success" />
              <KpiCard label="Early profile" value={`${totals.earlyPercent}%`} helper="VE and E combined" icon="↙" tone="purple" />
              <KpiCard label="Late / failed risk" value={`${totals.lateRiskPercent}%`} helper="L, VL and F combined" icon="!" tone="warning" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.9fr_0.9fr]">
              <PlanTrendChart rows={dailySummary} />
              <TimingMixPanel totals={totals} />
              <ChangeDistribution rows={changeSummary} totalRows={filteredRows.length} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.85fr]">
              <SitePerformanceTable rows={siteSummary} sort={siteSort} onSortChange={setSiteSort} />
              <SiteAttentionChart rows={siteSummary} />
            </div>

            <section className="mt-4 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-white">
              <div className="flex flex-col gap-3 border-b border-[#d7dee9] bg-[#f8fafc] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-base font-black text-[#10203a]">Daily site plan detail</p>
                  <p className="mt-1 text-xs font-bold text-[#64748b]">{formatNumber(detailRows.length)} rows match the dashboard filters and table search.</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                  <input value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} placeholder="Search date, region, site or profile" className="min-h-10 w-full rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm font-bold text-[#10203a] outline-none focus:border-[#0f3a6d] sm:w-[310px]" />
                  <button type="button" onClick={() => setDownloadOpen(true)} disabled={!filteredRows.length} className="min-h-10 rounded-lg border border-[#0f3a6d] bg-white px-4 text-xs font-black uppercase tracking-[0.07em] text-[#0f3a6d] transition hover:bg-[#eff6ff] disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:text-[#94a3b8]">Download selected data</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[1510px] w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#10203a] text-left font-black uppercase tracking-[0.06em] text-white">
                      <th className="px-3 py-3">Date</th><th className="px-3 py-3">Region</th><th className="px-3 py-3">Reporting site</th>
                      <th className="px-3 py-3 text-center">National</th><th className="px-3 py-3 text-center">Local agreed</th><th className="px-3 py-3 text-center">Adjusted</th>
                      <th className="px-3 py-3 text-center">Retained</th><th className="px-3 py-3 text-center">VE</th><th className="px-3 py-3 text-center">E</th><th className="px-3 py-3 text-center">OT</th><th className="px-3 py-3 text-center">L</th><th className="px-3 py-3 text-center">VL</th><th className="px-3 py-3 text-center">F</th><th className="px-3 py-3">Timing profile</th><th className="px-3 py-3">Change level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailRows.length === 0 ? (
                      <tr><td colSpan={15} className="px-4 py-12 text-center text-sm font-bold text-[#64748b]">No National vs Local Plan rows match the selected filters.</td></tr>
                    ) : detailRows.map((row) => (
                      <tr key={row.id} className="odd:bg-white even:bg-[#f8fafc] hover:bg-[#eef5ff]">
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#334155]">{formatDate(row.date)}</td>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#475569]">{row.region}</td>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-black text-[#10203a]">{row.site}</td>
                        <NumberCell value={row.nationalDuties} /><NumberCell value={row.localAgreedDuties} /><NumberCell value={row.adjustedDuties} />
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-black"><PlanRetainedPill value={row.planRetainedPercent} /></td>
                        {timingCodes.map((code) => <td key={code} className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-black"><TimingPercent code={code} value={row.timingPercentages[code]} /></td>)}
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5"><ProfilePill value={row.timingProfile} /></td>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5"><ChangePill value={row.changeBand} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
              <InsightNote title="Plan comparison" icon="N/L">National Duties Planned is the source plan. Local Agreed Plan is the retained local plan after adjustments. Adjusted duties are the difference between the two.</InsightNote>
              <InsightNote title="Timing calculation" icon="OT">VE, E, OT, L, VL and F counts use the same percentages and calculation logic as the original National vs Local Plan Report in Report 1.</InsightNote>
              <InsightNote title="Selection-based exports" icon="PDF">Excel includes summary, daily trend, site performance and detailed-data tabs. CSV contains the complete filtered detail. PDF provides a management summary followed by site and daily detail.</InsightNote>
            </div>
          </section>
        </main>
      </div>

      {downloadOpen ? <DownloadModal rows={filteredRows} totals={totals} dailySummary={dailySummary} siteSummary={siteSummary} filters={filters} onClose={() => setDownloadOpen(false)} /> : null}

      <ScheduledReportsManager open={schedulerOpen} initialSource="national-local" schedules={scheduledReports} onClose={() => setSchedulerOpen(false)} onSave={saveScheduledReport} onRemove={removeScheduledReport} />
    </div>
  );
}

function DownloadModal({ rows, totals, dailySummary, siteSummary, filters, onClose }: {
  rows: NationalLocalPlanRow[];
  totals: DashboardTotals;
  dailySummary: DailySummary[];
  siteSummary: SiteSummary[];
  filters: NationalLocalPlanDashboardPdfFilters;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);

  const download = async (format: ExportFormat) => {
    if (!rows.length) return;
    setDownloading(format);
    const fileName = `national-vs-local-plan-dashboard-${filters.startDate}-to-${filters.endDate}`;
    try {
      if (format === "pdf") {
        downloadNationalLocalPlanDashboardPdf({ rows, filters, fileName });
        return;
      }

      const detailHeaders = getDetailHeaders();
      const detailExportRows = buildDetailExportRows(rows);
      if (format === "excel") {
        await exportExcelWorkbook({
          fileName,
          sheets: [
            {
              name: "Dashboard Summary",
              headers: ["Metric", "Value"],
              rows: [
                ["Report", "National vs Local Plan Dashboard"],
                ["Start Date", formatDate(filters.startDate)],
                ["End Date", formatDate(filters.endDate)],
                ["Region", filters.region],
                ["Reporting Site", filters.site],
                ["Plan Change Filter", filters.changeBand],
                ["Volume Filter", filters.volumeBand],
                ["Timing Profile Filter", filters.timingProfile],
                ["Selected Rows", rows.length],
                ["Reporting Sites", totals.siteCount],
                ["National Duties Planned", totals.national],
                ["Local Agreed Plan", totals.local],
                ["Duties Adjusted", totals.adjusted],
                ["Plan Retained %", totals.retainedPercent],
                ["Adjusted %", totals.adjustedPercent],
                ...timingCodes.flatMap((code) => [[`${code} - ${timingLabels[code]} Count`, totals.timingCounts[code]], [`${code} - ${timingLabels[code]} %`, totals.timingPercentages[code]]]),
              ],
            },
            {
              name: "Daily Trend",
              headers: ["Date", "Day", "National Duties Planned", "Local Agreed Plan", "Duties Adjusted", "Plan Retained %", "Adjusted %", ...timingCodes.map((code) => `${code} Count`), ...timingCodes.map((code) => `${code} %`)],
              rows: dailySummary.map((day) => [formatDate(day.date), day.dayLabel, day.national, day.local, day.adjusted, day.retainedPercent, day.adjustedPercent, ...timingCodes.map((code) => day.timingCounts[code]), ...timingCodes.map((code) => day.timingPercentages[code])]),
            },
            {
              name: "Site Performance",
              headers: ["Region", "Reporting Site", "Active Days", "National Duties Planned", "Local Agreed Plan", "Duties Adjusted", "Plan Retained %", "Adjusted %", ...timingCodes.map((code) => `${code} Count`), ...timingCodes.map((code) => `${code} %`), "Timing Profile", "Change Level"],
              rows: siteSummary.map((site) => [site.region, site.site, site.activeDays, site.national, site.local, site.adjusted, site.retainedPercent, site.adjustedPercent, ...timingCodes.map((code) => site.timingCounts[code]), ...timingCodes.map((code) => site.timingPercentages[code]), site.timingProfile, site.changeBand]),
            },
            { name: "Selected Detail", headers: detailHeaders, rows: detailExportRows },
          ],
        });
        return;
      }

      exportTabularData({ format: "csv", headers: detailHeaders, rows: detailExportRows, fileName, title: "National vs Local Plan Dashboard" });
    } finally {
      window.setTimeout(() => setDownloading(null), 250);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07101f]/65 p-4" role="dialog" aria-modal="true" aria-labelledby="national-local-download-title">
      <div className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-[24px] border border-[#cfd8e3] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-[#10203a] px-5 py-4 text-white sm:px-6">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Selection-based download</p><h2 id="national-local-download-title" className="mt-1 text-2xl font-black">National vs Local Plan Dashboard</h2><p className="mt-1 text-sm font-bold text-white/75">Choose a format for the current dashboard selection.</p></div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 text-xl font-black text-white transition hover:bg-white/10" aria-label="Close download options">×</button>
        </div>
        <div className="max-h-[calc(94vh-96px)] overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SelectionDetail label="Date range" value={`${formatDate(filters.startDate)} to ${formatDate(filters.endDate)}`} />
            <SelectionDetail label="Region / site" value={`${filters.region} | ${filters.site}`} />
            <SelectionDetail label="Plan filters" value={`${filters.changeBand} | ${filters.volumeBand}`} />
            <SelectionDetail label="Rows selected" value={formatNumber(rows.length)} emphasis />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <DownloadFormatCard title="Excel workbook" badge="4 worksheets" description="Dashboard summary, daily trend, site performance and complete selected detail." detail="Best for management review and further analysis." icon="XLSX" featured loading={downloading === "excel"} disabled={downloading !== null} onClick={() => download("excel")} />
            <DownloadFormatCard title="CSV data" badge="Complete detail" description="Clear column headings with every filtered daily site row and all timing counts and percentages." detail="Best for importing into Power BI, databases or other systems." icon="CSV" loading={downloading === "csv"} disabled={downloading !== null} onClick={() => download("csv")} />
            <DownloadFormatCard title="Management PDF" badge="Multi-page" description="Executive summary, KPI position, timing mix, daily trend, site table and full selected detail." detail="Best for email circulation and management meetings." icon="PDF" featured loading={downloading === "pdf"} disabled={downloading !== null} onClick={() => download("pdf")} />
          </div>
          <div className="mt-5 rounded-[16px] border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3"><p className="text-sm font-black text-[#0f3a6d]">The original Report 1 screen is unchanged</p><p className="mt-1 text-sm font-bold leading-6 text-[#1e3a5f]">This download is generated from the separate Report 4 dashboard and uses only the active Report 4 filters.</p></div>
        </div>
      </div>
    </div>
  );
}

function PlanTrendChart({ rows }: { rows: DailySummary[] }) {
  const maxValue = Math.max(1, ...rows.map((row) => row.national));
  const chartWidth = 720;
  const chartHeight = 250;
  const plotTop = 24;
  const plotBottom = 198;
  const plotHeight = plotBottom - plotTop;
  const groupWidth = rows.length ? 650 / rows.length : 80;
  return (
    <section className="rounded-[18px] border border-[#d7dee9] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-base font-black text-[#10203a]">National vs Local daily trend</p><p className="mt-1 text-xs font-bold text-[#64748b]">Planned national duties compared with the retained Local Agreed Plan.</p></div><div className="flex gap-3 text-[10px] font-black uppercase tracking-[0.06em]"><LegendDot colour="#10203a" label="National" /><LegendDot colour="#16a34a" label="Local agreed" /></div></div>
      {rows.length ? (
        <div className="mt-3 overflow-x-auto"><svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[620px] w-full" role="img" aria-label="National and Local Agreed Plan daily bar chart">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => { const y = plotBottom - ratio * plotHeight; return <g key={ratio}><line x1="48" y1={y} x2="704" y2={y} stroke="#e2e8f0" strokeWidth="1" /><text x="42" y={y + 4} textAnchor="end" fontSize="10" fill="#64748b" fontWeight="700">{Math.round(maxValue * ratio)}</text></g>; })}
          {rows.map((row, index) => { const center = 68 + index * groupWidth + groupWidth / 2; const nationalHeight = (row.national / maxValue) * plotHeight; const localHeight = (row.local / maxValue) * plotHeight; return <g key={row.date}><rect x={center - 19} y={plotBottom - nationalHeight} width="17" height={nationalHeight} rx="3" fill="#10203a" /><rect x={center + 2} y={plotBottom - localHeight} width="17" height={localHeight} rx="3" fill="#16a34a" /><text x={center} y="219" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="800">{formatShortDay(row.date)}</text><text x={center} y="235" textAnchor="middle" fontSize="9" fill="#64748b">{row.retainedPercent}%</text></g>; })}
        </svg></div>
      ) : <EmptyPanel message="No daily trend is available for the selected filters." />}
    </section>
  );
}

function TimingMixPanel({ totals }: { totals: DashboardTotals }) {
  return (
    <section className="rounded-[18px] border border-[#d7dee9] bg-white p-4">
      <p className="text-base font-black text-[#10203a]">VE/E/OT/L/VL/F timing mix</p><p className="mt-1 text-xs font-bold text-[#64748b]">Distribution of the selected National Duties Planned.</p>
      <div className="mt-5 flex h-8 overflow-hidden rounded-lg bg-[#e2e8f0]">{timingCodes.map((code) => <div key={code} title={`${timingLabels[code]}: ${totals.timingPercentages[code]}%`} style={{ width: `${totals.timingPercentages[code]}%`, backgroundColor: timingColours[code] }} className="flex min-w-0 items-center justify-center text-[9px] font-black text-white">{totals.timingPercentages[code] >= 9 ? code : ""}</div>)}</div>
      <div className="mt-4 space-y-2">{timingCodes.map((code) => <div key={code} className="grid grid-cols-[14px_1fr_auto_auto] items-center gap-2 text-xs"><span className="h-3 w-3 rounded-sm" style={{ backgroundColor: timingColours[code] }} /><span className="font-black text-[#334155]">{code} — {timingLabels[code]}</span><span className="font-bold text-[#64748b]">{formatNumber(totals.timingCounts[code])}</span><span className="min-w-12 text-right font-black text-[#10203a]">{totals.timingPercentages[code]}%</span></div>)}</div>
    </section>
  );
}

function ChangeDistribution({ rows, totalRows }: { rows: ChangeSummary[]; totalRows: number }) {
  const tones: Record<ChangeBand, string> = { "No change": "bg-[#dcfce7] text-[#166534]", "Low change": "bg-[#dbeafe] text-[#1d4ed8]", "Moderate change": "bg-[#fef3c7] text-[#a16207]", "High change": "bg-[#fee2e2] text-[#b91c1c]" };
  return (
    <section className="rounded-[18px] border border-[#d7dee9] bg-white p-4">
      <p className="text-base font-black text-[#10203a]">Local plan change distribution</p><p className="mt-1 text-xs font-bold text-[#64748b]">Daily site rows grouped by the proportion adjusted.</p>
      <div className="mt-4 space-y-3">{rows.map((row) => <div key={row.label} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3"><div className="flex items-center justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${tones[row.label]}`}>{row.label}</span><span className="text-sm font-black text-[#10203a]">{row.percentage}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e2e8f0]"><div className="h-full rounded-full bg-[#d97706]" style={{ width: `${row.percentage}%` }} /></div><p className="mt-2 text-[11px] font-bold text-[#64748b]">{row.rows} of {totalRows} rows · {formatNumber(row.adjustedDuties)} duties adjusted</p></div>)}</div>
    </section>
  );
}

function SitePerformanceTable({ rows, sort, onSortChange }: { rows: SiteSummary[]; sort: string; onSortChange: (value: string) => void }) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#d7dee9] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#d7dee9] bg-[#f8fafc] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-base font-black text-[#10203a]">Site performance summary</p><p className="mt-1 text-xs font-bold text-[#64748b]">Aggregated across the selected dates and filters.</p></div><label className="flex items-center gap-2 text-xs font-black text-[#475569]">Sort by<select value={sort} onChange={(event) => onSortChange(event.target.value)} className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-black text-[#10203a]"><option>Adjusted duties</option><option>Plan retained</option><option>National volume</option><option>OT performance</option><option>Late risk</option><option>Site name</option></select></label></div>
      <div className="max-h-[470px] overflow-auto"><table className="min-w-[980px] w-full border-collapse text-xs"><thead className="sticky top-0 z-10"><tr className="bg-[#10203a] text-left font-black uppercase tracking-[0.05em] text-white"><th className="px-3 py-3">Region / site</th><th className="px-3 py-3 text-center">Nat</th><th className="px-3 py-3 text-center">Local</th><th className="px-3 py-3 text-center">Adjusted</th><th className="px-3 py-3 text-center">Retained</th><th className="px-3 py-3 text-center">OT</th><th className="px-3 py-3 text-center">Late risk</th><th className="px-3 py-3">Profile</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.site} className="odd:bg-white even:bg-[#f8fafc] hover:bg-[#eef5ff]"><td className="border-b border-[#e2e8f0] px-3 py-2.5"><p className="font-black text-[#10203a]">{row.site}</p><p className="mt-0.5 text-[10px] font-bold text-[#64748b]">{row.region} · {row.activeDays} active days</p></td><NumberCell value={row.national} /><NumberCell value={row.local} /><NumberCell value={row.adjusted} /><td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center"><PlanRetainedPill value={row.retainedPercent} /></td><td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center"><TimingPercent code="OT" value={row.timingPercentages.OT} /></td><td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-black text-[#b45309]">{row.lateRiskPercent}%</td><td className="border-b border-[#e2e8f0] px-3 py-2.5"><ProfilePill value={row.timingProfile} /></td></tr>) : <tr><td colSpan={8} className="px-4 py-12 text-center text-sm font-bold text-[#64748b]">No site summary is available for this selection.</td></tr>}</tbody></table></div>
    </section>
  );
}

function SiteAttentionChart({ rows }: { rows: SiteSummary[] }) {
  const attentionRows = [...rows].sort((a, b) => b.adjustedPercent - a.adjustedPercent || b.lateRiskPercent - a.lateRiskPercent).slice(0, 10);
  const max = Math.max(1, ...attentionRows.map((row) => row.adjustedPercent));
  return (
    <section className="rounded-[18px] border border-[#d7dee9] bg-white p-4"><p className="text-base font-black text-[#10203a]">Sites requiring attention</p><p className="mt-1 text-xs font-bold text-[#64748b]">Highest local adjustment rate within the active selection.</p><div className="mt-4 space-y-3">{attentionRows.length ? attentionRows.map((row, index) => <div key={row.site}><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs font-black text-[#10203a]">{index + 1}. {row.site}</p><p className="mt-0.5 text-[10px] font-bold text-[#64748b]">{row.region} · {row.adjusted} duties adjusted</p></div><span className="shrink-0 text-sm font-black text-[#b45309]">{row.adjustedPercent}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#e2e8f0]"><div className="h-full rounded-full bg-[#d97706]" style={{ width: `${(row.adjustedPercent / max) * 100}%` }} /></div></div>) : <EmptyPanel message="No site attention ranking is available." />}</div></section>
  );
}

function SelectionDetail({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <div className={`rounded-[16px] border px-4 py-3 ${emphasis ? "border-[#86efac] bg-[#f0fdf4]" : "border-[#d7dee9] bg-[#f8fafc]"}`}><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#64748b]">{label}</p><p className={`mt-1 text-sm font-black ${emphasis ? "text-[#166534]" : "text-[#10203a]"}`}>{value}</p></div>;
}

function DownloadFormatCard({ title, badge, description, detail, icon, featured = false, loading, disabled, onClick }: { title: string; badge: string; description: string; detail: string; icon: string; featured?: boolean; loading: boolean; disabled: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`group rounded-[20px] border p-5 text-left transition disabled:cursor-wait ${featured ? "border-[#93c5fd] bg-[#f8fbff] hover:border-[#2563eb]" : "border-[#d7dee9] bg-white hover:border-[#94a3b8]"}`}><div className="flex items-start justify-between gap-3"><span className={`flex h-12 min-w-12 items-center justify-center rounded-xl px-2 text-xs font-black text-white ${featured ? "bg-[#0f3a6d]" : "bg-[#475569]"}`}>{icon}</span><span className="rounded-full bg-[#e9eef9] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#334155]">{badge}</span></div><p className="mt-4 text-lg font-black text-[#10203a]">{title}</p><p className="mt-2 text-sm font-bold leading-6 text-[#4b5563]">{description}</p><p className="mt-3 text-xs font-bold leading-5 text-[#64748b]">{detail}</p><span className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[#10203a] px-4 text-xs font-black uppercase tracking-[0.07em] text-white group-hover:bg-[#1e3558]">{loading ? "Preparing…" : `Download ${icon}`}</span></button>;
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return <label className="block min-w-0"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/75">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-[42px] w-full rounded-lg border border-[#b8c6d5] bg-white px-3 text-sm font-black text-[#10203a] outline-none focus:border-[#86b7ee]">{children}</select></label>;
}

function FilterDate({ label, value, min, max, onChange }: { label: string; value: string; min: string; max: string; onChange: (value: string) => void }) {
  return <label className="block min-w-0"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/75">{label}</span><input type="date" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} className="h-[42px] w-full rounded-lg border border-[#b8c6d5] bg-white px-3 text-sm font-black text-[#10203a] outline-none focus:border-[#86b7ee]" /></label>;
}

function KpiCard({ label, value, helper, icon, tone }: { label: string; value: string; helper: string; icon: string; tone: "navy" | "info" | "success" | "purple" | "warning" }) {
  const tones = { navy: "bg-[#10203a] text-white", info: "bg-[#dbeafe] text-[#1d4ed8]", success: "bg-[#dcfce7] text-[#166534]", purple: "bg-[#ede9fe] text-[#6d28d9]", warning: "bg-[#fef3c7] text-[#a16207]" };
  return <div className="rounded-[18px] border border-[#d7dee9] bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><span className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-1 text-xs font-black ${tones[tone]}`}>{icon}</span><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.11em] text-[#64748b]">{label}</p><p className="mt-1 text-2xl font-black text-[#10203a]">{value}</p><p className="mt-1 text-[11px] font-bold leading-4 text-[#64748b]">{helper}</p></div></div></div>;
}

function InsightNote({ title, icon, children }: { title: string; icon: string; children: string }) {
  return <div className="rounded-[16px] border border-[#fde68a] bg-[#fffbeb] px-4 py-3"><div className="flex items-start gap-3"><span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#d97706] px-1 text-[9px] font-black text-white">{icon}</span><div><p className="text-sm font-black text-[#92400e]">{title}</p><p className="mt-1 text-xs font-bold leading-5 text-[#78350f]">{children}</p></div></div></div>;
}

function NumberCell({ value }: { value: number }) { return <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-black text-[#334155]">{formatNumber(value)}</td>; }
function PlanRetainedPill({ value }: { value: number }) { const classes = value >= 98 ? "bg-[#dcfce7] text-[#166534]" : value >= 95 ? "bg-[#fef3c7] text-[#a16207]" : "bg-[#fee2e2] text-[#b91c1c]"; return <span className={`inline-flex min-w-14 justify-center rounded-full px-2 py-1 text-[10px] font-black ${classes}`}>{value}%</span>; }
function TimingPercent({ code, value }: { code: TimingCode; value: number }) { return <span className="inline-flex min-w-10 justify-center rounded-full px-2 py-1 text-[10px] font-black text-white" style={{ backgroundColor: timingColours[code] }}>{value}%</span>; }
function ProfilePill({ value }: { value: TimingProfile }) { const classes: Record<TimingProfile, string> = { "On-time led": "bg-[#dcfce7] text-[#166534]", "Early weighted": "bg-[#dbeafe] text-[#1d4ed8]", Balanced: "bg-[#e2e8f0] text-[#475569]", "Late risk": "bg-[#fef3c7] text-[#a16207]", "Failed risk": "bg-[#fee2e2] text-[#b91c1c]" }; return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black ${classes[value]}`}>{value}</span>; }
function ChangePill({ value }: { value: ChangeBand }) { const classes: Record<ChangeBand, string> = { "No change": "bg-[#dcfce7] text-[#166534]", "Low change": "bg-[#dbeafe] text-[#1d4ed8]", "Moderate change": "bg-[#fef3c7] text-[#a16207]", "High change": "bg-[#fee2e2] text-[#b91c1c]" }; return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black ${classes[value]}`}>{value}</span>; }
function LegendDot({ colour, label }: { colour: string; label: string }) { return <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colour }} />{label}</span>; }
function EmptyPanel({ message }: { message: string }) { return <div className="mt-4 rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-8 text-center text-sm font-bold text-[#64748b]">{message}</div>; }

function OfficeHeader() {
  return <header className="flex min-h-[64px] items-center justify-between bg-[#e40000] text-white shadow-sm"><div className="flex h-full items-center"><Link href="/internal/app-ideas/link-message-mock" className="flex h-[64px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black text-white no-underline transition hover:bg-white/10" aria-label="Back to Duty Execution">≡</Link><div className="px-5"><p className="text-2xl font-black uppercase tracking-wide">MOCK UP</p><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Report 4</p></div></div><div className="flex items-center gap-4 px-4"><Link href="/internal/app-ideas" className="hidden rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-white/15 sm:block">← Back to DriverOS Home</Link><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-[#e40000]">●</div><div className="hidden text-right sm:block"><p className="text-base font-black">Andrew Cannon</p><p className="text-xs font-bold text-white/80">Mock dashboard user</p></div></div></header>;
}

function OfficeSidebar() {
  return <aside className="flex min-h-[calc(100vh-64px)] w-[68px] shrink-0 flex-col bg-[#252c33] text-white">{sidebarItems.map((item) => <Link key={item.label} href={item.href} aria-label={item.label} title={item.label} className={`relative flex h-[64px] items-center justify-center border-b border-white/10 no-underline transition ${item.icon.length > 2 ? "text-sm font-black" : "text-3xl"} ${item.active ? "bg-[#11171d] text-white" : "text-white/75 hover:bg-[#11171d] hover:text-white"}`}><span>{item.icon}</span>{item.alertCount ? <span className="absolute bottom-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e40000] px-1 text-[11px] font-black leading-none text-white ring-2 ring-[#252c33]">{item.alertCount}</span> : null}</Link>)}</aside>;
}

function calculateTotals(rows: NationalLocalPlanRow[]): DashboardTotals {
  const national = rows.reduce((sum, row) => sum + row.nationalDuties, 0);
  const local = rows.reduce((sum, row) => sum + row.localAgreedDuties, 0);
  const adjusted = national - local;
  const timingCounts = emptyTimingCounts();
  rows.forEach((row) => timingCodes.forEach((code) => { timingCounts[code] += row.timingCounts[code]; }));
  const timingPercentages = percentagesFromCounts(timingCounts, national);
  return { national, local, adjusted, retainedPercent: national ? roundOne((local / national) * 100) : 0, adjustedPercent: national ? roundOne((adjusted / national) * 100) : 0, siteCount: new Set(rows.map((row) => row.site)).size, rowCount: rows.length, timingCounts, timingPercentages, earlyPercent: roundOne(timingPercentages.VE + timingPercentages.E), lateRiskPercent: roundOne(timingPercentages.L + timingPercentages.VL + timingPercentages.F) };
}

function buildDailySummary(rows: NationalLocalPlanRow[]): DailySummary[] {
  const grouped = new Map<string, NationalLocalPlanRow[]>();
  rows.forEach((row) => grouped.set(row.date, [...(grouped.get(row.date) ?? []), row]));
  return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, dayRows]) => ({ date, dayLabel: dayRows[0]?.dayLabel ?? date, ...calculateTotals(dayRows) }));
}

function buildSiteSummary(rows: NationalLocalPlanRow[]): SiteSummary[] {
  const grouped = new Map<string, NationalLocalPlanRow[]>();
  rows.forEach((row) => grouped.set(row.site, [...(grouped.get(row.site) ?? []), row]));
  return [...grouped.entries()].map(([site, siteRows]) => { const totals = calculateTotals(siteRows); const dominantProfile = mostCommon(siteRows.map((row) => row.timingProfile)) as TimingProfile; const adjustedPercent = totals.adjustedPercent; const changeBand: ChangeBand = adjustedPercent === 0 ? "No change" : adjustedPercent <= 2 ? "Low change" : adjustedPercent <= 5 ? "Moderate change" : "High change"; return { site, region: siteRows[0]?.region ?? "", activeDays: new Set(siteRows.map((row) => row.date)).size, timingProfile: dominantProfile, changeBand, ...totals }; });
}

function sortSiteSummary(rows: SiteSummary[], sort: string) {
  return [...rows].sort((a, b) => {
    if (sort === "Plan retained") return a.retainedPercent - b.retainedPercent || b.national - a.national;
    if (sort === "National volume") return b.national - a.national || a.site.localeCompare(b.site);
    if (sort === "OT performance") return a.timingPercentages.OT - b.timingPercentages.OT || b.national - a.national;
    if (sort === "Late risk") return b.lateRiskPercent - a.lateRiskPercent || b.national - a.national;
    if (sort === "Site name") return a.site.localeCompare(b.site);
    return b.adjusted - a.adjusted || b.adjustedPercent - a.adjustedPercent || a.site.localeCompare(b.site);
  });
}

function buildChangeSummary(rows: NationalLocalPlanRow[]): ChangeSummary[] {
  return changeBands.map((label) => { const bandRows = rows.filter((row) => row.changeBand === label); return { label, rows: bandRows.length, adjustedDuties: bandRows.reduce((sum, row) => sum + row.adjustedDuties, 0), percentage: rows.length ? roundOne((bandRows.length / rows.length) * 100) : 0 }; });
}

function emptyTimingCounts(): TimingCounts { return { VE: 0, E: 0, OT: 0, L: 0, VL: 0, F: 0 }; }
function percentagesFromCounts(counts: TimingCounts, total: number): TimingCounts { const percentages = emptyTimingCounts(); timingCodes.forEach((code) => { percentages[code] = total ? roundOne((counts[code] / total) * 100) : 0; }); return percentages; }
function mostCommon(values: string[]) { const counts = new Map<string, number>(); values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1)); return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? "Balanced"; }
function formatNumber(value: number) { return new Intl.NumberFormat("en-GB").format(value); }
function formatShortDay(value: string) { return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
function getDetailHeaders() { return ["Date", "Day", "Region", "Reporting Site", "National Duties Planned", "Local Agreed Plan", "Duties Adjusted", "Plan Retained %", "Adjusted %", ...timingCodes.map((code) => `${code} Count`), ...timingCodes.map((code) => `${code} %`), "Timing Profile", "Change Level", "Volume Band"]; }
function buildDetailExportRows(rows: NationalLocalPlanRow[]) { return rows.map((row) => [formatDate(row.date), row.dayLabel, row.region, row.site, row.nationalDuties, row.localAgreedDuties, row.adjustedDuties, row.planRetainedPercent, row.adjustedPercent, ...timingCodes.map((code) => row.timingCounts[code]), ...timingCodes.map((code) => row.timingPercentages[code]), row.timingProfile, row.changeBand, row.volumeBand]); }

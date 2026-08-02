"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  exportExcelWorkbook,
  exportTabularData,
  type ExportFormat,
} from "../../../exportData";
import {
  downloadNetworkPerformanceDashboardPdf,
  type NetworkPerformanceDashboardPdfRow,
} from "../networkPerformanceDashboardPdf";
import {
  ScheduledReportsManager,
  type ScheduledReport,
} from "../ScheduledReportsManager";

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  alertCount?: number;
  active?: boolean;
};

type TimingCode = "VE" | "E" | "OT" | "L" | "VL" | "F";

type NetworkPerformanceRow = NetworkPerformanceDashboardPdfRow & {
  id: string;
  debriefStatus: "Debriefed";
  legState: "Complete";
  weekNumber: number;
  division: "Network";
};

type SiteSummary = {
  site: string;
  completed: number;
  dttOt: number;
  attOt: number;
  ve: number;
  e: number;
  ot: number;
  l: number;
  vl: number;
  f: number;
  partComplete: number;
  attOnTimePercent: number;
  dttOnTimePercent: number;
};

type DailySummary = {
  date: string;
  completed: number;
  dttOt: number;
  attOt: number;
  dttOnTimePercent: number;
  attOnTimePercent: number;
};

type IssueSummary = {
  label: string;
  count: number;
  percentage: number;
};

type DutyPerformanceSummary = {
  key: string;
  duty: string;
  reportingSite: string;
  totalLegs: number;
  dttOnTime: number;
  attOnTime: number;
  lateArrivals: number;
  partComplete: number;
  exceptionRows: number;
  dttOnTimePercent: number;
  attOnTimePercent: number;
  exceptionPercent: number;
  activeDays: number;
  vehicles: number;
  topIssue: string;
  lastSeen: string;
};

type TimingCounts = Record<TimingCode, number>;

type DateRange = {
  startDate: string;
  endDate: string;
  dates: string[];
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

const availableLocations = [
  "Aberdeen MC",
  "ABERDEEN VOC",
  "Atherstone VOC",
  "Belfast MC",
  "BELFAST VOC",
  "Birmingham MC (VOC)",
  "BIRMINGHAM VOC",
  "Bridgend VOC",
  "Bristol Mini VOC",
  "Carlisle VOC",
  "Chelmsford (SEAMAC) MC",
  "CHELMSFORD VOC",
  "CHORLEY NORTHERN HUB VOC",
  "Chorley VOC",
  "Coventry National Hub",
  "COVENTRY NATIONAL HUB VOC",
  "Croydon MC (VOC)",
  "CROYDON VOC",
  "Doncaster MC",
  "East London DC",
  "East Mids VOC",
  "Edinburgh MC (VOC)",
  "EDINBURGH VOC",
  "ELDCVOC",
  "Exeter VOC",
  "Gatwick MC (VOC)",
  "GATWICK VOC",
  "Glasgow MC",
  "GLASGOW VOC",
  "Greenford MC/VOC",
  "GREENFORD VOC",
  "HATFIELD PROCESSING CENTRE VOC",
  "HEATHROW WORLDWIDE DC VOC",
  "HWDC",
  "Inverness MC",
  "INVERNESS VOC",
  "Manchester VOC",
  "MIDLANDS SUPER HUB VOC",
  "NATIONAL DC VOC",
  "NDC",
  "NEDC",
  "NHCDC",
  "North West Hub",
  "NORTH WEST SUPER HUB VOC",
  "Norwich MC (VOC)",
  "NORWICH VOC",
  "Perth LD",
  "Peterborough MC (VOC)",
  "PETERBOROUGH VOC",
  "PRDC",
  "PRINCESS ROYAL DC VOC",
  "PRVOC",
  "Roborough VOC",
  "SCOTTISH DC VOC",
  "SDC",
  "Sheffield MC",
  "SOUTH EAST DC VOC",
  "South East WBC (Rochester)",
  "SOUTH WEST DC VOC",
  "Southampton VOC",
  "SWDC",
  "Swindon VOC",
  "Warrington VOC",
  "WOKING DC VOC",
  "Woking VOC",
  "Wolverhampton MC",
  "YDC",
  "YDC Stourton VOC",
  "YORKSHIRE DC VOC",
  "YPC VOC",
] as const;

const dueToConveyOptions = [
  "1C 24 Mail",
  "2C 48 Mail",
  "Collection",
  "Container Repatriation",
  "D2D",
  "Delievery",
  "Empty",
  "Flex",
  "HV Returns",
  "International",
  "PF 24Parcels",
  "PF 48 Parcels",
  "RDC 24 Tracked",
  "RDC 48 Tracked",
  "RDC Presort",
  "RDC Tracked",
  "RM Relay",
  "Shunting",
  "Tracked",
  "TRacked Collection",
  "ULD Repatriation",
  "Unit Only",
] as const;

const drivers = [
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
  "PN74CDY",
  "MX73BWW",
  "PN25MHS",
  "MX21DCT",
  "PX25HUB",
  "PN70BUA",
  "MX74FDN",
] as const;

const trailers = [
  "7338014",
  "24316007",
  "4318005",
  "24160021",
  "20316087",
  "7338015",
  "5320233",
  "24163445",
] as const;

const nationalPartnerLocations = [
  "National Distribution Centre",
  "Midlands Super Hub",
  "North West Hub",
  "Princess Royal Distribution Centre",
  "Yorkshire Distribution Centre",
  "South East Distribution Centre",
] as const;

const startOffsetPattern = [-4, 2, 11, -7, 18, 5, 0, -12, 7, 14, -2, 4, 9, -5, 22, 3, -8, 6, 12, 1, -3, 8, -6, 16, 4, -1, 10, -9, 5, 13];
const finishOffsetPattern = [3, -2, 16, -5, 24, 7, 1, -8, 11, 19, -4, 6, 13, -3, 28, 4, -7, 9, 15, 2, -1, 12, -4, 21, 5, 0, 14, -6, 8, 18];
const timingOrder: TimingCode[] = ["VE", "E", "OT", "L", "VL", "F"];
const timingLabels: Record<TimingCode, string> = {
  VE: "Very Early",
  E: "Early",
  OT: "On Time",
  L: "Late",
  VL: "Very Late",
  F: "Failed",
};
const timingColours: Record<TimingCode, string> = {
  VE: "#2563eb",
  E: "#7c3aed",
  OT: "#16a34a",
  L: "#f59e0b",
  VL: "#ea580c",
  F: "#991b1b",
};
const timingPillClasses: Record<TimingCode, string> = {
  VE: "bg-[#dbeafe] text-[#1d4ed8]",
  E: "bg-[#ede9fe] text-[#6d28d9]",
  OT: "bg-[#dcfce7] text-[#166534]",
  L: "bg-[#fef3c7] text-[#a16207]",
  VL: "bg-[#ffedd5] text-[#c2410c]",
  F: "bg-[#fee2e2] text-[#991b1b]",
};
const SCHEDULED_REPORTS_STORAGE_KEY = "driveros-mock-scheduled-reports";
const defaultRange = getDateRange(5);

export function NetworkPerformanceDashboard() {
  const allRows = useMemo(() => buildNetworkPerformanceRows(getDateRange(30).dates), []);

  const [period, setPeriod] = useState("5");
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [selectedSite, setSelectedSite] = useState("All sites");
  const [selectedTiming, setSelectedTiming] = useState("All timing");
  const [selectedTraffic, setSelectedTraffic] = useState("All Due to Convey");
  const [tableSearch, setTableSearch] = useState("");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [scheduledReportsLoaded, setScheduledReportsLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedSchedules = window.localStorage.getItem(SCHEDULED_REPORTS_STORAGE_KEY);
        if (savedSchedules) {
          const parsedSchedules = JSON.parse(savedSchedules) as ScheduledReport[];
          if (Array.isArray(parsedSchedules)) setScheduledReports(parsedSchedules.slice(0, 10));
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

  const dashboardRows = useMemo(
    () => filterRows(allRows, {
      startDate,
      startTime,
      endDate,
      endTime,
      selectedSite,
      selectedTiming,
      selectedTraffic,
    }),
    [allRows, endDate, endTime, selectedSite, selectedTiming, selectedTraffic, startDate, startTime],
  );

  const tableRows = useMemo(() => {
    const search = tableSearch.trim().toLowerCase();
    if (!search) return dashboardRows;
    return dashboardRows.filter((row) => [
      row.reportingSite,
      row.dutyNumber,
      row.driver,
      row.vehicle,
      row.trailerNumber,
      row.traffic,
      row.departureLocation,
      row.finalDestination,
      row.issueCategory,
      row.driverNotes,
    ].some((value) => value.toLowerCase().includes(search)));
  }, [dashboardRows, tableSearch]);

  const timingCounts = useMemo(() => countTimingCodes(dashboardRows, "att"), [dashboardRows]);
  const siteSummary = useMemo(() => buildSiteSummary(dashboardRows), [dashboardRows]);
  const dutySummary = useMemo(() => buildDutyPerformanceSummary(dashboardRows), [dashboardRows]);
  const dailySummary = useMemo(() => buildDailySummary(dashboardRows), [dashboardRows]);
  const issueSummary = useMemo(() => buildIssueSummary(dashboardRows), [dashboardRows]);
  const totals = useMemo(() => calculateTotals(dashboardRows), [dashboardRows]);

  const changePeriod = (value: string) => {
    setPeriod(value);
    if (value === "custom") return;
    const range = getDateRange(Number(value));
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const changeDate = (target: "start" | "end", value: string) => {
    setPeriod("custom");
    if (target === "start") setStartDate(value);
    else setEndDate(value);
  };

  const resetFilters = () => {
    const range = getDateRange(5);
    setPeriod("5");
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setStartTime("00:00");
    setEndTime("23:59");
    setSelectedSite("All sites");
    setSelectedTiming("All timing");
    setSelectedTraffic("All Due to Convey");
    setTableSearch("");
  };

  const saveScheduledReport = (schedule: ScheduledReport) => {
    setScheduledReports((current) => {
      const existingIndex = current.findIndex((item) => item.id === schedule.id);
      if (existingIndex >= 0) return current.map((item) => item.id === schedule.id ? schedule : item);
      return current.length < 10 ? [...current, schedule] : current;
    });
  };

  const removeScheduledReport = (id: string) => {
    setScheduledReports((current) => current.filter((schedule) => schedule.id !== id));
  };

  const invalidRange = !startDate || !endDate || `${startDate}T${startTime}` > `${endDate}T${endTime}`;

  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#111827]">
      <OfficeHeader />
      <div className="flex min-w-0">
        <OfficeSidebar />

        <main className="min-w-0 flex-1 p-3 sm:p-5">
          <section className="rounded-[22px] border border-[#d6dde8] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Network reporting dashboard</p>
                <h1 className="mt-2 text-3xl font-black text-[#10203a]">Network Performance Dashboard</h1>
                <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-[#4b5563]">
                  Review completed debrief performance across national sites, compare departure and arrival timing, investigate exceptions and download the selected operational data.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap xl:justify-end">
                <Link
                  href="/internal/app-ideas/link-message-mock/reports"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#c7d2df] bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-[#10203a] no-underline transition hover:bg-[#f8fafc]"
                >
                  ← Back to reports
                </Link>
                <button
                  type="button"
                  onClick={() => setDownloadOpen(true)}
                  className="min-h-11 rounded-xl bg-[#10203a] px-5 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-white shadow-sm transition hover:bg-[#1e3558]"
                >
                  Select dates and site download
                </button>
                <button
                  type="button"
                  onClick={() => setSchedulerOpen(true)}
                  className="min-h-11 rounded-xl border-2 border-[#0f3a6d] bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-[#0f3a6d] transition hover:bg-[#eff6ff]"
                >
                  Schedule email
                </button>
              </div>
            </div>

            <section className="mt-5 overflow-hidden rounded-[18px] border border-[#273b52] bg-[#31485f] shadow-sm">
              <div className="flex flex-col gap-1 border-b border-white/15 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-white">Dashboard filters</p>
                <p className="text-xs font-bold text-white/70">All metrics, charts, tables and downloads respond to this selection</p>
              </div>
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
                <FilterSelect label="Reporting period" value={period} onChange={changePeriod}>
                  <option value="5">Last 5 completed days</option>
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="custom">Custom dates</option>
                </FilterSelect>
                <FilterDate label="Start date" value={startDate} onChange={(value) => changeDate("start", value)} />
                <FilterTime label="Start time" value={startTime} onChange={setStartTime} />
                <FilterDate label="End date" value={endDate} onChange={(value) => changeDate("end", value)} />
                <FilterTime label="End time" value={endTime} onChange={setEndTime} />
                <FilterSelect label="Reporting site" value={selectedSite} onChange={setSelectedSite}>
                  <option>All sites</option>
                  {availableLocations.map((site) => <option key={site}>{site}</option>)}
                </FilterSelect>
                <FilterSelect label="Arrival timing / ATT" value={selectedTiming} onChange={setSelectedTiming}>
                  <option>All timing</option>
                  {timingOrder.map((code) => <option key={code} value={code}>{code} – {timingLabels[code]}</option>)}
                </FilterSelect>
                <FilterSelect label="Due to Convey" value={selectedTraffic} onChange={setSelectedTraffic}>
                  <option>All Due to Convey</option>
                  {dueToConveyOptions.map((traffic) => <option key={traffic}>{traffic}</option>)}
                </FilterSelect>
              </div>
              <div className="flex justify-end border-t border-white/15 px-4 py-2.5">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-lg border border-white/35 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-white/20"
                >
                  Reset filters
                </button>
              </div>
            </section>

            {invalidRange ? (
              <div className="mt-4 rounded-xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-black text-[#b91c1c]">
                The start date and time must be before the end date and time.
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
              <KpiCard label="Completed debriefs" value={formatNumber(totals.completed)} helper={`${totals.uniqueSites} reporting sites`} icon="✓" tone="navy" />
              <KpiCard label="DTT on time" value={`${totals.dttOnTimePercent}%`} helper={`${formatNumber(totals.dttOt)} departures coded OT`} icon="D" tone="info" />
              <KpiCard label="ATT on time" value={`${totals.attOnTimePercent}%`} helper={`${formatNumber(totals.attOt)} arrivals coded OT`} icon="A" tone="success" />
              <KpiCard label="Early arrivals" value={formatNumber(totals.earlyArrivals)} helper="VE and E arrival codes" icon="↙" tone="purple" />
              <KpiCard label="Late arrivals" value={formatNumber(totals.lateArrivals)} helper="L, VL and F arrival codes" icon="!" tone="warning" />
              <KpiCard label="Part complete" value={formatNumber(totals.partComplete)} helper={`${totals.partCompletePercent}% of selected rows`} icon="◐" tone="danger" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1.45fr_1.05fr]">
              <TimingMixDonut counts={timingCounts} total={totals.completed} />
              <DailyPerformanceTrend rows={dailySummary} />
              <SitePerformanceChart rows={siteSummary} />
            </div>

            <ProblemDutyDashboard duties={dutySummary} />

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_0.75fr]">
              <SitePerformanceTable rows={siteSummary} />
              <IssueBreakdown rows={issueSummary} total={totals.completed} />
            </div>

            <section className="mt-4 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-white">
              <div className="flex flex-col gap-3 border-b border-[#d7dee9] bg-[#f8fafc] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-base font-black text-[#10203a]">Completed debrief detail</p>
                  <p className="mt-1 text-xs font-bold text-[#64748b]">
                    {formatNumber(tableRows.length)} rows match the selected dashboard filters and table search.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                  <input
                    value={tableSearch}
                    onChange={(event) => setTableSearch(event.target.value)}
                    placeholder="Search site, duty, vehicle, issue or driver notes"
                    className="min-h-10 w-full rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm font-bold text-[#10203a] outline-none focus:border-[#0f3a6d] sm:w-[320px]"
                  />
                  <button
                    type="button"
                    onClick={() => setDownloadOpen(true)}
                    className="min-h-10 rounded-lg border border-[#0f3a6d] bg-white px-4 text-xs font-black uppercase tracking-[0.07em] text-[#0f3a6d] transition hover:bg-[#eff6ff]"
                  >
                    Download selected data
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[1880px] w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#10203a] text-left font-black uppercase tracking-[0.06em] text-white">
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Reporting site</th>
                      <th className="px-3 py-3">Duty</th>
                      <th className="px-3 py-3">Leg</th>
                      <th className="px-3 py-3">Vehicle</th>
                      <th className="px-3 py-3">Trailer</th>
                      <th className="px-3 py-3">Due to Convey</th>
                      <th className="px-3 py-3">Route</th>
                      <th className="px-3 py-3">Planned start</th>
                      <th className="px-3 py-3">Actual start</th>
                      <th className="px-3 py-3">DTT</th>
                      <th className="px-3 py-3">Planned finish</th>
                      <th className="px-3 py-3">Actual finish</th>
                      <th className="px-3 py-3">ATT</th>
                      <th className="px-3 py-3">Issue</th>
                      <th className="min-w-[300px] px-3 py-3">Driver Notes</th>
                      <th className="px-3 py-3">Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.length === 0 ? (
                      <tr>
                        <td colSpan={17} className="px-4 py-12 text-center text-sm font-bold text-[#64748b]">
                          No completed debrief rows match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      tableRows.slice(0, 120).map((row) => (
                        <tr key={row.id} className="odd:bg-white even:bg-[#f8fafc] hover:bg-[#eef5ff]">
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#334155]">{formatDateOnly(row.dutyDate)}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-black text-[#10203a]">{row.reportingSite}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-black text-[#10203a]">{row.dutyNumber}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-bold">{row.dutyOrder}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold">{row.vehicle}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold">{row.trailerNumber}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold">{row.traffic}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#475569]">{row.departureLocation} → {row.finalDestination}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold">{formatDateTime(row.plannedStartTs)}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold">{formatDateTime(row.actualStartTs)}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5"><TimingPill code={row.dtt as TimingCode} /></td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold">{formatDateTime(row.plannedFinishTs)}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold">{formatDateTime(row.actualFinishTs)}</td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5"><TimingPill code={row.att as TimingCode} /></td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#475569]">{row.issueCategory}</td>
                          <td className="min-w-[300px] border-b border-[#e2e8f0] px-3 py-2.5 font-bold leading-5 text-[#334155]">
                            {row.driverNotes}
                          </td>
                          <td className="border-b border-[#e2e8f0] px-3 py-2.5">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-black ${row.outcome === "Complete" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>
                              {row.outcome}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {tableRows.length > 120 ? (
                <div className="border-t border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-xs font-bold text-[#64748b]">
                  Showing the first 120 of {formatNumber(tableRows.length)} matching rows. Downloads contain the complete selected data set.
                </div>
              ) : null}
            </section>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
              <InsightNote title="Performance basis" icon="i">
                DTT compares planned and actual departure time. ATT compares planned and actual arrival time using the VE, E, OT, L, VL and F timing thresholds.
              </InsightNote>
              <InsightNote title="Selection-based reporting" icon="⌁">
                Every chart, KPI, site summary and downloaded file uses the active date, time, site, ATT and Due to Convey filters shown above.
              </InsightNote>
              <InsightNote title="Enhanced management PDF" icon="PDF">
                The PDF contains an executive summary, timing mix, daily trend, site performance, a dedicated driver-notes section and every selected debrief row for audit and investigation.
              </InsightNote>
            </div>
          </section>
        </main>
      </div>

      {downloadOpen ? (
        <DownloadSelectionModal
          rows={dashboardRows}
          siteSummary={siteSummary}
          dailySummary={dailySummary}
          dutySummary={dutySummary}
          startDate={startDate}
          startTime={startTime}
          endDate={endDate}
          endTime={endTime}
          selectedSite={selectedSite}
          selectedTiming={selectedTiming}
          selectedTraffic={selectedTraffic}
          onClose={() => setDownloadOpen(false)}
        />
      ) : null}

      <ScheduledReportsManager
        open={schedulerOpen}
        initialSource="network"
        schedules={scheduledReports}
        onClose={() => setSchedulerOpen(false)}
        onSave={saveScheduledReport}
        onRemove={removeScheduledReport}
      />
    </div>
  );
}

function DownloadSelectionModal({
  rows,
  siteSummary,
  dailySummary,
  dutySummary,
  startDate,
  startTime,
  endDate,
  endTime,
  selectedSite,
  selectedTiming,
  selectedTraffic,
  onClose,
}: {
  rows: NetworkPerformanceRow[];
  siteSummary: SiteSummary[];
  dailySummary: DailySummary[];
  dutySummary: DutyPerformanceSummary[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  selectedSite: string;
  selectedTiming: string;
  selectedTraffic: string;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);

  const download = async (format: ExportFormat) => {
    if (rows.length === 0) return;
    setDownloading(format);

    const fileName = `network-performance-dashboard-${startDate}-to-${endDate}`;

    try {
      if (format === "pdf") {
        downloadNetworkPerformanceDashboardPdf({
          rows,
          filters: {
            startDate,
            startTime,
            endDate,
            endTime,
            site: selectedSite,
            timingStatus: selectedTiming,
            traffic: selectedTraffic,
          },
          fileName,
        });
        return;
      }

      const rawHeaders = getRawDataHeaders();
      const rawRows = buildRawExportRows(rows);

      if (format === "excel") {
        const totals = calculateTotals(rows);
        const timingCounts = countTimingCodes(rows, "att");
        await exportExcelWorkbook({
          fileName,
          sheets: [
            {
              name: "Dashboard Summary",
              headers: ["Metric", "Value"],
              rows: [
                ["Start", `${formatDateOnly(startDate)} ${startTime}`],
                ["End", `${formatDateOnly(endDate)} ${endTime}`],
                ["Reporting Site", selectedSite],
                ["ATT Filter", selectedTiming],
                ["Due to Convey Filter", selectedTraffic],
                ["Completed Debriefs", totals.completed],
                ["Reporting Sites", totals.uniqueSites],
                ["DTT On Time", totals.dttOt],
                ["DTT On Time %", totals.dttOnTimePercent],
                ["ATT On Time", totals.attOt],
                ["ATT On Time %", totals.attOnTimePercent],
                ["Very Early Arrivals", timingCounts.VE],
                ["Early Arrivals", timingCounts.E],
                ["Late Arrivals", timingCounts.L],
                ["Very Late Arrivals", timingCounts.VL],
                ["Failed Arrivals", timingCounts.F],
                ["Part Complete", totals.partComplete],
              ],
            },
            {
              name: "Site Performance",
              headers: ["Reporting Site", "Completed", "DTT OT", "DTT OT %", "VE", "E", "ATT OT", "ATT OT %", "L", "VL", "F", "Part Complete"],
              rows: siteSummary.map((site) => [
                site.site,
                site.completed,
                site.dttOt,
                site.dttOnTimePercent,
                site.ve,
                site.e,
                site.attOt,
                site.attOnTimePercent,
                site.l,
                site.vl,
                site.f,
                site.partComplete,
              ]),
            },
            {
              name: "Daily Trend",
              headers: ["Date", "Completed", "DTT OT", "DTT OT %", "ATT OT", "ATT OT %"],
              rows: dailySummary.map((day) => [
                formatDateOnly(day.date),
                day.completed,
                day.dttOt,
                day.dttOnTimePercent,
                day.attOt,
                day.attOnTimePercent,
              ]),
            },
            {
              name: "Problem Duties",
              headers: [
                "Duty",
                "Reporting Site",
                "Debrief Legs",
                "DTT On Time",
                "DTT On Time %",
                "ATT On Time",
                "ATT On Time %",
                "Late Arrivals",
                "Part Complete",
                "Exception Rows",
                "Exception %",
                "Active Days",
                "Vehicles Used",
                "Main Issue",
                "Last Recorded",
              ],
              rows: dutySummary.map((duty) => [
                duty.duty,
                duty.reportingSite,
                duty.totalLegs,
                duty.dttOnTime,
                duty.dttOnTimePercent,
                duty.attOnTime,
                duty.attOnTimePercent,
                duty.lateArrivals,
                duty.partComplete,
                duty.exceptionRows,
                duty.exceptionPercent,
                duty.activeDays,
                duty.vehicles,
                duty.topIssue,
                formatDateOnly(duty.lastSeen),
              ]),
            },
            {
              name: "Raw Debrief Data",
              headers: rawHeaders,
              rows: rawRows,
            },
          ],
        });
        return;
      }

      exportTabularData({
        format: "csv",
        headers: rawHeaders,
        rows: rawRows,
        fileName,
        title: "Network Performance Dashboard – Selected Data",
      });
    } finally {
      window.setTimeout(() => setDownloading(null), 350);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07101f]/65 p-4" role="dialog" aria-modal="true" aria-labelledby="network-download-title">
      <div className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-[24px] border border-[#cfd8e3] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-[#10203a] px-5 py-4 text-white sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Selected network performance data</p>
            <h2 id="network-download-title" className="mt-1 text-2xl font-black">Download report</h2>
            <p className="mt-1 text-sm font-bold text-white/75">All files use the active dashboard filters</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 text-xl font-black text-white transition hover:bg-white/10"
            aria-label="Close download"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(94vh-94px)] overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SelectionDetail label="Date and time" value={`${formatDateOnly(startDate)} ${startTime} – ${formatDateOnly(endDate)} ${endTime}`} />
            <SelectionDetail label="Reporting site" value={selectedSite} />
            <SelectionDetail label="ATT / traffic" value={`${selectedTiming} · ${selectedTraffic}`} />
            <SelectionDetail label="Rows selected" value={formatNumber(rows.length)} emphasis />
          </div>

          {rows.length === 0 ? (
            <div className="mt-5 rounded-xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-black text-[#b91c1c]">
              No completed debrief data matches the active filters. Change the dashboard selection before downloading.
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <DownloadFormatCard
              title="Excel workbook"
              badge="5 sheets"
              description="Dashboard summary, site performance, daily trend, problem-duty analysis and complete raw debrief data in a structured XLSX workbook."
              detail="Best for analysis and further reporting"
              icon="XLSX"
              onClick={() => download("excel")}
              disabled={rows.length === 0 || downloading !== null}
              loading={downloading === "excel"}
            />
            <DownloadFormatCard
              title="CSV data"
              badge="Raw data"
              description="A complete flat-file export of every selected debrief leg, suitable for Power BI, Qlik or other data tools."
              detail="Best for data import"
              icon="CSV"
              onClick={() => download("csv")}
              disabled={rows.length === 0 || downloading !== null}
              loading={downloading === "csv"}
            />
            <DownloadFormatCard
              title="Management PDF"
              badge="Enhanced"
              description="A presentation-quality PDF with executive KPIs, timing mix, trend analysis, site summaries, driver notes and every selected row."
              detail="Best for sharing and governance"
              icon="PDF"
              featured
              onClick={() => download("pdf")}
              disabled={rows.length === 0 || downloading !== null}
              loading={downloading === "pdf"}
            />
          </div>

          <div className="mt-5 rounded-[16px] border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3">
            <p className="text-sm font-black text-[#0f3a6d]">PDF content follows the current dashboard selection</p>
            <p className="mt-1 text-sm font-bold leading-6 text-[#1e3a5f]">
              The PDF begins with an executive summary, then provides the full alphabetical site performance table, a dedicated driver-notes section and complete selected debrief detail across additional pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectionDetail({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={`rounded-[16px] border px-4 py-3 ${emphasis ? "border-[#86efac] bg-[#f0fdf4]" : "border-[#d7dee9] bg-[#f8fafc]"}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#64748b]">{label}</p>
      <p className={`mt-1 text-sm font-black ${emphasis ? "text-[#166534]" : "text-[#10203a]"}`}>{value}</p>
    </div>
  );
}

function DownloadFormatCard({
  title,
  badge,
  description,
  detail,
  icon,
  featured = false,
  loading,
  disabled,
  onClick,
}: {
  title: string;
  badge: string;
  description: string;
  detail: string;
  icon: string;
  featured?: boolean;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <article className={`flex min-h-[280px] flex-col rounded-[20px] border p-5 shadow-sm ${featured ? "border-[#e40000] bg-[#fffafa] ring-2 ring-[#e40000]/10" : "border-[#d7dee9] bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-14 w-14 items-center justify-center rounded-[16px] text-sm font-black text-white ${featured ? "bg-[#e40000]" : "bg-[#10203a]"}`}>
          {icon}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${featured ? "bg-[#fee2e2] text-[#b91c1c]" : "bg-[#e8eef8] text-[#0f3a6d]"}`}>
          {badge}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-black text-[#10203a]">{title}</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-[#566274]">{description}</p>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.06em] text-[#64748b]">{detail}</p>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`mt-auto min-h-11 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-white transition disabled:cursor-not-allowed disabled:bg-[#9ca3af] ${featured ? "bg-[#e40000] hover:bg-[#c90000]" : "bg-[#10203a] hover:bg-[#1e3558]"}`}
      >
        {loading ? "Preparing download..." : `Download ${icon}`}
      </button>
    </article>
  );
}

function TimingMixDonut({ counts, total }: { counts: TimingCounts; total: number }) {
  const stops: string[] = [];
  let cursor = 0;
  timingOrder.forEach((code) => {
    const share = total > 0 ? (counts[code] / total) * 100 : 0;
    stops.push(`${timingColours[code]} ${cursor}% ${cursor + share}%`);
    cursor += share;
  });

  return (
    <DashboardPanel title="Arrival performance mix" subtitle="ATT timing code distribution">
      <div className="flex flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row">
        <div
          className="relative h-44 w-44 shrink-0 rounded-full"
          style={{ background: total > 0 ? `conic-gradient(${stops.join(", ")})` : "#e2e8f0" }}
          aria-label="Arrival timing mix chart"
        >
          <div className="absolute inset-[28px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
            <span className="text-3xl font-black text-[#10203a]">{total > 0 ? percentage(counts.OT, total).toFixed(1) : "0.0"}%</span>
            <span className="text-[11px] font-black uppercase tracking-[0.08em] text-[#64748b]">ATT on time</span>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2">
          {timingOrder.map((code) => (
            <div key={code} className="flex items-center justify-between gap-3 border-b border-[#edf1f5] py-1.5">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: timingColours[code] }} />
                <span className="font-black text-[#10203a]">{code}</span>
              </div>
              <div className="text-right">
                <p className="font-black text-[#10203a]">{formatNumber(counts[code])}</p>
                <p className="text-[10px] font-bold text-[#64748b]">{percentage(counts[code], total).toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}

function DailyPerformanceTrend({ rows }: { rows: DailySummary[] }) {
  const chartWidth = 760;
  const chartHeight = 240;
  const padding = { left: 52, right: 18, top: 22, bottom: 42 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const displayed = rows.slice(-14);
  const points = displayed.map((row, index) => ({
    ...row,
    x: padding.left + (displayed.length <= 1 ? innerWidth / 2 : (index / (displayed.length - 1)) * innerWidth),
    dttY: padding.top + (1 - row.dttOnTimePercent / 100) * innerHeight,
    attY: padding.top + (1 - row.attOnTimePercent / 100) * innerHeight,
  }));
  const dttPath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.dttY}`).join(" ");
  const attPath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.attY}`).join(" ");

  return (
    <DashboardPanel title="Daily on-time performance" subtitle="DTT and ATT on-time percentage by completed day">
      {rows.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[260px] min-w-[680px] w-full" role="img" aria-label="Daily DTT and ATT trend chart">
            {[0, 25, 50, 75, 100].map((tick) => {
              const y = padding.top + (1 - tick / 100) * innerHeight;
              return (
                <g key={tick}>
                  <line x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                  <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="10" fontWeight="700" fill="#64748b">{tick}%</text>
                </g>
              );
            })}
            <line x1={padding.left} x2={chartWidth - padding.right} y1={padding.top + innerHeight} y2={padding.top + innerHeight} stroke="#94a3b8" />
            <path d={dttPath} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d={attPath} fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => (
              <g key={point.date}>
                <circle cx={point.x} cy={point.dttY} r="4" fill="#2563eb"><title>{`${formatDateOnly(point.date)} DTT OT ${point.dttOnTimePercent}%`}</title></circle>
                <circle cx={point.x} cy={point.attY} r="4" fill="#16a34a"><title>{`${formatDateOnly(point.date)} ATT OT ${point.attOnTimePercent}%`}</title></circle>
                {(displayed.length <= 8 || index % 2 === 0 || index === displayed.length - 1) ? (
                  <text x={point.x} y={chartHeight - 18} textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">{formatShortDate(point.date)}</text>
                ) : null}
              </g>
            ))}
            <g transform={`translate(${padding.left + 10},8)`}>
              <circle cx="0" cy="0" r="4" fill="#2563eb" />
              <text x="10" y="4" fontSize="10" fontWeight="800" fill="#10203a">DTT OT %</text>
              <circle cx="92" cy="0" r="4" fill="#16a34a" />
              <text x="102" y="4" fontSize="10" fontWeight="800" fill="#10203a">ATT OT %</text>
            </g>
          </svg>
        </div>
      )}
    </DashboardPanel>
  );
}

function SitePerformanceChart({ rows }: { rows: SiteSummary[] }) {
  const riskRows = rows.slice().sort((a, b) => a.attOnTimePercent - b.attOnTimePercent).slice(0, 8);

  return (
    <DashboardPanel title="Sites requiring attention" subtitle="Lowest ATT on-time performance in the selection">
      {riskRows.length === 0 ? <EmptyChart /> : (
        <div className="space-y-3">
          {riskRows.map((row) => (
            <div key={row.site}>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs font-black text-[#10203a]" title={row.site}>{row.site}</p>
                <p className={`text-xs font-black ${row.attOnTimePercent >= 90 ? "text-[#166534]" : row.attOnTimePercent >= 80 ? "text-[#a16207]" : "text-[#b91c1c]"}`}>
                  {row.attOnTimePercent}%
                </p>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#e2e8f0]">
                <div
                  className={`h-full rounded-full ${row.attOnTimePercent >= 90 ? "bg-[#16a34a]" : row.attOnTimePercent >= 80 ? "bg-[#f59e0b]" : "bg-[#dc2626]"}`}
                  style={{ width: `${Math.max(2, row.attOnTimePercent)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}


function ProblemDutyDashboard({ duties }: { duties: DutyPerformanceSummary[] }) {
  const [selectedDutyKey, setSelectedDutyKey] = useState("");
  const rankedDuties = duties.filter((duty) => duty.totalLegs >= 2).slice(0, 12);
  const selectedDuty = rankedDuties.find((duty) => duty.key === selectedDutyKey) ?? rankedDuties[0];
  const maximumExceptionRate = Math.max(1, ...rankedDuties.map((duty) => duty.exceptionPercent));
  const dutiesRequiringReview = duties.filter((duty) => duty.attOnTimePercent < 80).length;
  const partCompleteLegs = duties.reduce((total, duty) => total + duty.partComplete, 0);

  return (
    <section className="mt-4 overflow-hidden rounded-[20px] border border-[#d7dee9] bg-white shadow-sm">
      <div className="flex flex-col gap-3 bg-[#10203a] px-4 py-4 text-white sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e40000] text-xl font-black">!</span>
          <div>
            <p className="text-lg font-black">Problem Duty Dashboard</p>
            <p className="mt-0.5 text-xs font-bold text-white/70">
              Identifies recurring duties with poor ATT performance, timing exceptions and part-complete debriefs in the selected filters.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <ProblemDutyHeaderMetric label="Duties reviewed" value={formatNumber(duties.length)} />
          <ProblemDutyHeaderMetric label="Require review" value={formatNumber(dutiesRequiringReview)} alert />
          <ProblemDutyHeaderMetric label="Part complete" value={formatNumber(partCompleteLegs)} warning />
        </div>
      </div>

      {rankedDuties.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <p className="text-base font-black text-[#10203a]">No duty performance data is available.</p>
          <p className="mt-2 text-sm font-bold text-[#64748b]">Change the filters to include more completed debrief rows.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_0.85fr]">
            <div className="border-b border-[#e2e8f0] p-4 sm:p-5 xl:border-b-0 xl:border-r">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-base font-black text-[#10203a]">Worst-performing duties</p>
                  <p className="mt-1 text-xs font-bold text-[#64748b]">Ranked by ATT on-time performance, exception rate and part-complete outcomes.</p>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#64748b]">Select a duty for detail</p>
              </div>

              <div className="mt-4 space-y-2.5">
                {rankedDuties.slice(0, 8).map((duty, index) => {
                  const isSelected = selectedDuty?.key === duty.key;
                  const status = getProblemDutyRiskStatus(duty.attOnTimePercent);
                  return (
                    <button
                      type="button"
                      key={duty.key}
                      onClick={() => setSelectedDutyKey(duty.key)}
                      className={`w-full rounded-xl border p-3 text-left transition ${isSelected ? "border-[#0f3a6d] bg-[#eff6ff] shadow-sm" : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#94a3b8] hover:bg-white"}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${index < 3 ? "bg-[#fee2e2] text-[#b91c1c]" : "bg-white text-[#475569]"}`}>
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-black text-[#10203a]">{duty.duty}</p>
                              <p className="truncate text-[10px] font-bold text-[#64748b]" title={duty.reportingSite}>{duty.reportingSite}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-base font-black ${duty.attOnTimePercent < 80 ? "text-[#b91c1c]" : "text-[#166534]"}`}>{duty.attOnTimePercent}%</p>
                              <p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#64748b]">ATT on time</p>
                            </div>
                          </div>
                          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e2e8f0]">
                            <div className="h-full rounded-full bg-[#dc2626]" style={{ width: `${Math.max(3, (duty.exceptionPercent / maximumExceptionRate) * 100)}%` }} />
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-[#64748b]">
                            <span><strong className="text-[#b91c1c]">{duty.exceptionRows}</strong> exception rows</span>
                            <span>{duty.totalLegs} legs</span>
                            <span>{duty.partComplete} part complete</span>
                            <span>{status.label}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#f8fafc] p-4 sm:p-5">
              {selectedDuty ? <WorstNetworkDutyInsight duty={selectedDuty} /> : null}
            </div>
          </div>

          <div className="border-t border-[#d7dee9]">
            <div className="border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 sm:px-5">
              <p className="text-sm font-black text-[#10203a]">Problem duty comparison</p>
              <p className="mt-1 text-xs font-bold text-[#64748b]">Use this table to prioritise duties for planner, site, route and driver investigation.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#31485f] text-left font-black uppercase tracking-[0.06em] text-white">
                    <th className="px-3 py-3">Rank</th>
                    <th className="px-3 py-3">Duty</th>
                    <th className="px-3 py-3">Reporting site</th>
                    <th className="px-3 py-3 text-right">Legs</th>
                    <th className="px-3 py-3 text-right">DTT OT</th>
                    <th className="px-3 py-3 text-right">ATT OT</th>
                    <th className="px-3 py-3 text-right">Late arrivals</th>
                    <th className="px-3 py-3 text-right">Part complete</th>
                    <th className="px-3 py-3 text-right">Exception rate</th>
                    <th className="px-3 py-3">Main issue</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedDuties.map((duty, index) => {
                    const status = getProblemDutyRiskStatus(duty.attOnTimePercent);
                    return (
                      <tr key={duty.key} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-black text-[#64748b]">{index + 1}</td>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-black text-[#10203a]">{duty.duty}</td>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#334155]">{duty.reportingSite}</td>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-right font-bold">{duty.totalLegs}</td>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-right font-bold text-[#2563eb]">{duty.dttOnTimePercent}%</td>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-right font-black text-[#166534]">{duty.attOnTimePercent}%</td>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-right font-black text-[#b45309]">{duty.lateArrivals}</td>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-right font-black text-[#b91c1c]">{duty.partComplete}</td>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-right font-black text-[#b91c1c]">{duty.exceptionPercent}%</td>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-bold text-[#475569]">{duty.topIssue}</td>
                        <td className="border-b border-[#e2e8f0] px-3 py-2.5"><ProblemDutyRiskPill label={status.label} tone={status.tone} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function ProblemDutyHeaderMetric({ label, value, alert = false, warning = false }: { label: string; value: string; alert?: boolean; warning?: boolean }) {
  const className = alert
    ? "border-red-300/35 bg-red-500/20 text-white"
    : warning
      ? "border-amber-300/35 bg-amber-400/20 text-white"
      : "border-white/20 bg-white/10 text-white";
  return (
    <div className={`min-w-[104px] rounded-xl border px-3 py-2 ${className}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.09em] text-white/70">{label}</p>
      <p className="mt-0.5 text-xl font-black">{value}</p>
    </div>
  );
}

function WorstNetworkDutyInsight({ duty }: { duty: DutyPerformanceSummary }) {
  const status = getProblemDutyRiskStatus(duty.attOnTimePercent);
  return (
    <div className="flex h-full flex-col">
      <div className="rounded-[18px] border border-[#fecaca] bg-gradient-to-br from-[#fff1f2] to-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#b91c1c]">Worst duty selected</p>
            <p className="mt-1 text-3xl font-black text-[#10203a]">{duty.duty}</p>
            <p className="mt-1 text-xs font-bold text-[#64748b]">{duty.reportingSite}</p>
          </div>
          <ProblemDutyRiskPill label={status.label} tone={status.tone} />
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className={`text-5xl font-black leading-none ${duty.attOnTimePercent < 80 ? "text-[#b91c1c]" : "text-[#166534]"}`}>{duty.attOnTimePercent}%</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#64748b]">ATT on-time performance</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-[#10203a]">{duty.exceptionRows}</p>
            <p className="text-[10px] font-bold text-[#64748b]">exception rows</p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <ProblemDutyInsightMetric label="DTT on time" value={`${duty.dttOnTimePercent}%`} />
        <ProblemDutyInsightMetric label="Late arrivals" value={formatNumber(duty.lateArrivals)} warning />
        <ProblemDutyInsightMetric label="Part complete" value={formatNumber(duty.partComplete)} danger />
        <ProblemDutyInsightMetric label="Vehicles used" value={formatNumber(duty.vehicles)} />
      </div>

      <div className="mt-3 rounded-xl border border-[#d7dee9] bg-white p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#64748b]">Main issue</p>
        <p className="mt-1 text-sm font-black leading-5 text-[#10203a]">{duty.topIssue}</p>
      </div>

      <div className="mt-3 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-3 text-xs font-bold leading-5 text-[#1e3a5f]">
        Review the recurring route, planned timing, vehicle allocation and driver notes. This duty operated across <strong>{duty.activeDays} days</strong> and was last recorded on <strong>{formatDateOnly(duty.lastSeen)}</strong>.
      </div>
    </div>
  );
}

function ProblemDutyInsightMetric({ label, value, warning = false, danger = false }: { label: string; value: string; warning?: boolean; danger?: boolean }) {
  const classes = danger
    ? "border-[#fecaca] bg-[#fff1f2] text-[#b91c1c]"
    : warning
      ? "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]"
      : "border-[#d7dee9] bg-white text-[#10203a]";
  return (
    <div className={`rounded-xl border p-3 ${classes}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.1em] opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function ProblemDutyRiskPill({ label, tone }: { label: string; tone: "critical" | "review" | "monitor" | "stable" }) {
  const classes = {
    critical: "bg-[#fee2e2] text-[#b91c1c]",
    review: "bg-[#ffedd5] text-[#c2410c]",
    monitor: "bg-[#fef3c7] text-[#a16207]",
    stable: "bg-[#dcfce7] text-[#166534]",
  }[tone];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.06em] ${classes}`}>{label}</span>;
}

function getProblemDutyRiskStatus(attOnTimePercent: number): { label: string; tone: "critical" | "review" | "monitor" | "stable" } {
  if (attOnTimePercent < 50) return { label: "Critical", tone: "critical" };
  if (attOnTimePercent < 70) return { label: "Review", tone: "review" };
  if (attOnTimePercent < 85) return { label: "Monitor", tone: "monitor" };
  return { label: "Stable", tone: "stable" };
}

function SitePerformanceTable({ rows }: { rows: SiteSummary[] }) {
  return (
    <DashboardPanel title="Reporting site summary (A–Z)" subtitle="Departure and arrival timing performance by reporting site" noPadding>
      <div className="max-h-[430px] overflow-auto">
        <table className="min-w-[1050px] w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#10203a] text-left font-black uppercase tracking-[0.06em] text-white">
              <th className="px-3 py-3">Reporting site</th>
              <th className="px-3 py-3 text-center">Completed</th>
              <th className="px-3 py-3 text-center">DTT OT</th>
              <th className="px-3 py-3 text-center">DTT OT %</th>
              <th className="px-3 py-3 text-center">VE</th>
              <th className="px-3 py-3 text-center">E</th>
              <th className="px-3 py-3 text-center">ATT OT</th>
              <th className="px-3 py-3 text-center">ATT OT %</th>
              <th className="px-3 py-3 text-center">L</th>
              <th className="px-3 py-3 text-center">VL</th>
              <th className="px-3 py-3 text-center">F</th>
              <th className="px-3 py-3 text-center">Part complete</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={13} className="px-4 py-12 text-center text-sm font-bold text-[#64748b]">No site performance data matches the selected filters.</td></tr>
            ) : rows.map((row) => (
              <tr key={row.site} className="odd:bg-white even:bg-[#f8fafc] hover:bg-[#eef5ff]">
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 font-black text-[#10203a]">{row.site}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-bold">{formatNumber(row.completed)}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-bold">{formatNumber(row.dttOt)}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-black text-[#2563eb]">{row.dttOnTimePercent}%</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-bold">{row.ve}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-bold">{row.e}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-bold">{formatNumber(row.attOt)}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-black"><PerformancePercent value={row.attOnTimePercent} /></td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-bold">{row.l}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-bold">{row.vl}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-bold">{row.f}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5 text-center font-bold">{row.partComplete}</td>
                <td className="border-b border-[#e2e8f0] px-3 py-2.5"><SiteStatus value={row.attOnTimePercent} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardPanel>
  );
}

function IssueBreakdown({ rows, total }: { rows: IssueSummary[]; total: number }) {
  const maximum = Math.max(1, ...rows.map((row) => row.count));
  return (
    <DashboardPanel title="Operational exception mix" subtitle="Issue categories recorded in selected debriefs">
      {rows.length === 0 ? <EmptyChart /> : (
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={row.label}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${index === 0 ? "bg-[#fee2e2] text-[#b91c1c]" : "bg-[#e8eef8] text-[#0f3a6d]"}`}>{index + 1}</span>
                  <p className="truncate text-xs font-black text-[#10203a]" title={row.label}>{row.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-[#10203a]">{formatNumber(row.count)}</p>
                  <p className="text-[10px] font-bold text-[#64748b]">{row.percentage}%</p>
                </div>
              </div>
              <div className="ml-8 mt-1.5 h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
                <div className={index === 0 ? "h-full rounded-full bg-[#dc2626]" : "h-full rounded-full bg-[#315a8a]"} style={{ width: `${(row.count / maximum) * 100}%` }} />
              </div>
            </div>
          ))}
          <p className="border-t border-[#e2e8f0] pt-3 text-xs font-bold text-[#64748b]">Based on {formatNumber(total)} selected completed debrief rows.</p>
        </div>
      )}
    </DashboardPanel>
  );
}

function DashboardPanel({ title, subtitle, children, noPadding = false }: { title: string; subtitle: string; children: React.ReactNode; noPadding?: boolean }) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#d7dee9] bg-white shadow-sm">
      <div className="border-b border-[#d7dee9] bg-[#f8fafc] px-4 py-3">
        <p className="text-sm font-black text-[#10203a]">{title}</p>
        <p className="mt-1 text-xs font-bold text-[#64748b]">{subtitle}</p>
      </div>
      <div className={noPadding ? "" : "p-4"}>{children}</div>
    </section>
  );
}

function EmptyChart() {
  return <div className="flex min-h-[220px] items-center justify-center rounded-xl border-2 border-dashed border-[#d7dee9] bg-[#f8fafc] text-sm font-bold text-[#64748b]">No data matches the selected filters.</div>;
}

function KpiCard({ label, value, helper, icon, tone }: { label: string; value: string; helper: string; icon: string; tone: "navy" | "info" | "success" | "purple" | "warning" | "danger" }) {
  const tones = {
    navy: "bg-[#10203a] text-white",
    info: "bg-[#1d4ed8] text-white",
    success: "bg-[#16a34a] text-white",
    purple: "bg-[#7c3aed] text-white",
    warning: "bg-[#ea580c] text-white",
    danger: "bg-[#b91c1c] text-white",
  };

  return (
    <div className="rounded-[18px] border border-[#d7dee9] bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] text-lg font-black ${tones[tone]}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#64748b]">{label}</p>
          <p className="mt-1 text-2xl font-black text-[#10203a]">{value}</p>
          <p className="mt-1 text-[11px] font-bold leading-4 text-[#64748b]">{helper}</p>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/75">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-[42px] w-full rounded-lg border border-[#b8c6d5] bg-white px-3 text-sm font-black text-[#10203a] outline-none focus:border-[#86b7ee]">
        {children}
      </select>
    </label>
  );
}

function FilterDate({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/75">{label}</span>
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="h-[42px] w-full rounded-lg border border-[#b8c6d5] bg-white px-3 text-sm font-black text-[#10203a] outline-none focus:border-[#86b7ee]" />
    </label>
  );
}

function FilterTime({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/75">{label}</span>
      <input type="time" value={value} onChange={(event) => onChange(event.target.value)} className="h-[42px] w-full rounded-lg border border-[#b8c6d5] bg-white px-3 text-sm font-black text-[#10203a] outline-none focus:border-[#86b7ee]" />
    </label>
  );
}

function TimingPill({ code }: { code: TimingCode }) {
  return <span className={`inline-flex min-w-9 justify-center rounded-full px-2 py-1 text-[10px] font-black ${timingPillClasses[code]}`}>{code}</span>;
}

function PerformancePercent({ value }: { value: number }) {
  return <span className={value >= 90 ? "text-[#166534]" : value >= 80 ? "text-[#a16207]" : "text-[#b91c1c]"}>{value}%</span>;
}

function SiteStatus({ value }: { value: number }) {
  if (value >= 90) return <span className="rounded-full bg-[#dcfce7] px-2 py-1 text-[10px] font-black text-[#166534]">Good</span>;
  if (value >= 80) return <span className="rounded-full bg-[#fef3c7] px-2 py-1 text-[10px] font-black text-[#a16207]">Monitor</span>;
  return <span className="rounded-full bg-[#fee2e2] px-2 py-1 text-[10px] font-black text-[#b91c1c]">Review</span>;
}

function InsightNote({ title, icon, children }: { title: string; icon: string; children: string }) {
  return (
    <div className="rounded-[16px] border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#0f3a6d] px-1 text-[10px] font-black text-white">{icon}</span>
        <div>
          <p className="text-sm font-black text-[#0f3a6d]">{title}</p>
          <p className="mt-1 text-xs font-bold leading-5 text-[#1e3a5f]">{children}</p>
        </div>
      </div>
    </div>
  );
}

function OfficeHeader() {
  return (
    <header className="flex min-h-[64px] items-center justify-between bg-[#e40000] text-white shadow-sm">
      <div className="flex h-full items-center">
        <Link href="/internal/app-ideas/link-message-mock" className="flex h-[64px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black text-white no-underline transition hover:bg-white/10" aria-label="Back to Duty Execution">≡</Link>
        <div className="px-5">
          <p className="text-2xl font-black uppercase tracking-wide">MOCK UP</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Report 3</p>
        </div>
      </div>
      <div className="flex items-center gap-4 px-4">
        <Link href="/internal/app-ideas" className="hidden rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-white/15 sm:block">← Back to DriverOS Home</Link>
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
          className={`relative flex h-[64px] items-center justify-center border-b border-white/10 no-underline transition ${item.icon.length > 2 ? "text-sm font-black" : "text-3xl"} ${item.active ? "bg-[#11171d] text-white" : "text-white/75 hover:bg-[#11171d] hover:text-white"}`}
        >
          <span>{item.icon}</span>
          {item.alertCount ? <span className="absolute bottom-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e40000] px-1 text-[11px] font-black leading-none text-white ring-2 ring-[#252c33]">{item.alertCount}</span> : null}
        </Link>
      ))}
    </aside>
  );
}

function buildNetworkPerformanceRows(dates: string[]): NetworkPerformanceRow[] {
  return dates.flatMap((dutyDate, dayIndex) =>
    availableLocations.flatMap((reportingSite, siteIndex) =>
      [0, 1].map((legIndex) => {
        const rowIndex = dayIndex * availableLocations.length * 2 + siteIndex * 2 + legIndex;
        const startOffset = startOffsetPattern[rowIndex % startOffsetPattern.length];
        const finishOffset = finishOffsetPattern[rowIndex % finishOffsetPattern.length];
        const plannedStartMinutes = 120 + ((siteIndex * 17 + legIndex * 75) % 1_140);
        const durationMinutes = 40 + ((siteIndex + legIndex * 7) % 31);
        const plannedStartTs = buildTimestamp(dutyDate, plannedStartMinutes);
        const actualStartTs = buildTimestamp(dutyDate, plannedStartMinutes + startOffset);
        const plannedFinishTs = buildTimestamp(dutyDate, plannedStartMinutes + durationMinutes);
        const actualFinishTs = buildTimestamp(dutyDate, plannedStartMinutes + durationMinutes + finishOffset);
        const issueCategory = finishOffset >= 9 ? "Late Arrival" : startOffset >= 9 ? "Late Departure" : "No Issue";
        const outcome = finishOffset >= 21 ? "Part Complete" : "Complete";
        const partnerLocation = nationalPartnerLocations[siteIndex % nationalPartnerLocations.length];
        const departureLocation = legIndex === 0 ? reportingSite : partnerLocation;
        const finalDestination = legIndex === 0 ? partnerLocation : reportingSite;
        const dutyNumber = `${buildSiteCode(reportingSite)}${String((siteIndex % 700) + 100).padStart(3, "0")}`;

        return {
          id: `${dutyDate}-${siteIndex}-${legIndex}`,
          reportingSite,
          debriefStatus: "Debriefed",
          legState: "Complete",
          dutyDate,
          weekNumber: getWeekNumberFromAprilFirst(dutyDate),
          dutyOrder: legIndex + 1,
          dutyNumber,
          division: "Network",
          driver: drivers[(dayIndex + siteIndex + legIndex) % drivers.length],
          vehicle: vehicles[(dayIndex * 2 + siteIndex + legIndex) % vehicles.length],
          trailerNumber: trailers[(dayIndex * 3 + siteIndex * 2 + legIndex) % trailers.length],
          traffic: dueToConveyOptions[(dayIndex + siteIndex * 2 + legIndex) % dueToConveyOptions.length],
          departureLocation,
          plannedStartTs,
          actualStartTs,
          startDifference: formatDifference(startOffset),
          dtt: getTimingCode(startOffset),
          departureAssets: clampAssetValue(18 + ((siteIndex * 7 + dayIndex * 3 + legIndex * 11) % 78)),
          finalDestination,
          plannedFinishTs,
          actualFinishTs,
          finishDifference: formatDifference(finishOffset),
          att: getTimingCode(finishOffset),
          arrivalAssets: clampAssetValue(12 + ((siteIndex * 5 + dayIndex * 4 + legIndex * 13) % 84)),
          issueCategory,
          driverNotes: buildDriverNotes(issueCategory, finalDestination),
          outcome,
          debriefedBy: (dayIndex + siteIndex) % 2 === 0 ? "Peter Finch" : "Sarah Mitchell",
          debriefedAtTs: buildTimestamp(dutyDate, plannedStartMinutes + durationMinutes + finishOffset + 20),
        };
      }),
    ),
  );
}

function filterRows(rows: NetworkPerformanceRow[], filters: {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  selectedSite: string;
  selectedTiming: string;
  selectedTraffic: string;
}) {
  const startTs = `${filters.startDate}T${filters.startTime}:00`;
  const endTs = `${filters.endDate}T${filters.endTime}:59`;
  if (!filters.startDate || !filters.endDate || startTs > endTs) return [];

  return rows.filter((row) => {
    if (row.actualFinishTs < startTs || row.actualFinishTs > endTs) return false;
    if (filters.selectedSite !== "All sites" && row.reportingSite !== filters.selectedSite) return false;
    if (filters.selectedTiming !== "All timing" && row.att !== filters.selectedTiming) return false;
    if (filters.selectedTraffic !== "All Due to Convey" && row.traffic !== filters.selectedTraffic) return false;
    return true;
  });
}

function calculateTotals(rows: NetworkPerformanceRow[]) {
  const dttOt = rows.filter((row) => row.dtt === "OT").length;
  const attOt = rows.filter((row) => row.att === "OT").length;
  const earlyArrivals = rows.filter((row) => row.att === "VE" || row.att === "E").length;
  const lateArrivals = rows.filter((row) => row.att === "L" || row.att === "VL" || row.att === "F").length;
  const partComplete = rows.filter((row) => row.outcome === "Part Complete").length;

  return {
    completed: rows.length,
    uniqueSites: new Set(rows.map((row) => row.reportingSite)).size,
    dttOt,
    attOt,
    dttOnTimePercent: percentage(dttOt, rows.length).toFixed(1),
    attOnTimePercent: percentage(attOt, rows.length).toFixed(1),
    earlyArrivals,
    lateArrivals,
    partComplete,
    partCompletePercent: percentage(partComplete, rows.length).toFixed(1),
  };
}

function countTimingCodes(rows: NetworkPerformanceRow[], field: "dtt" | "att") {
  const counts: TimingCounts = { VE: 0, E: 0, OT: 0, L: 0, VL: 0, F: 0 };
  rows.forEach((row) => { counts[row[field] as TimingCode] += 1; });
  return counts;
}

function buildSiteSummary(rows: NetworkPerformanceRow[]) {
  const map = new Map<string, SiteSummary>();
  rows.forEach((row) => {
    const current = map.get(row.reportingSite) ?? {
      site: row.reportingSite,
      completed: 0,
      dttOt: 0,
      attOt: 0,
      ve: 0,
      e: 0,
      ot: 0,
      l: 0,
      vl: 0,
      f: 0,
      partComplete: 0,
      attOnTimePercent: 0,
      dttOnTimePercent: 0,
    };
    current.completed += 1;
    if (row.dtt === "OT") current.dttOt += 1;
    if (row.att === "OT") current.attOt += 1;
    const key = row.att.toLowerCase() as "ve" | "e" | "ot" | "l" | "vl" | "f";
    current[key] += 1;
    if (row.outcome === "Part Complete") current.partComplete += 1;
    map.set(row.reportingSite, current);
  });

  return Array.from(map.values())
    .map((site) => ({
      ...site,
      attOnTimePercent: Number(percentage(site.attOt, site.completed).toFixed(1)),
      dttOnTimePercent: Number(percentage(site.dttOt, site.completed).toFixed(1)),
    }))
    .sort((a, b) => a.site.localeCompare(b.site));
}


function buildDutyPerformanceSummary(rows: NetworkPerformanceRow[]): DutyPerformanceSummary[] {
  const grouped = new Map<string, NetworkPerformanceRow[]>();
  rows.forEach((row) => {
    const key = `${row.reportingSite}::${row.dutyNumber}`;
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  });

  return [...grouped.entries()]
    .map(([key, dutyRows]) => {
      const dttOnTime = dutyRows.filter((row) => row.dtt === "OT").length;
      const attOnTime = dutyRows.filter((row) => row.att === "OT").length;
      const lateArrivals = dutyRows.filter((row) => ["L", "VL", "F"].includes(row.att)).length;
      const partComplete = dutyRows.filter((row) => row.outcome === "Part Complete").length;
      const exceptionRows = dutyRows.filter((row) => row.dtt !== "OT" || row.att !== "OT" || row.outcome !== "Complete").length;
      const issueCounts = new Map<string, number>();
      dutyRows
        .filter((row) => row.issueCategory !== "No Issue")
        .forEach((row) => issueCounts.set(row.issueCategory, (issueCounts.get(row.issueCategory) ?? 0) + 1));
      const topIssue = [...issueCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "No recorded issue";

      return {
        key,
        duty: dutyRows[0].dutyNumber,
        reportingSite: dutyRows[0].reportingSite,
        totalLegs: dutyRows.length,
        dttOnTime,
        attOnTime,
        lateArrivals,
        partComplete,
        exceptionRows,
        dttOnTimePercent: Number(percentage(dttOnTime, dutyRows.length).toFixed(1)),
        attOnTimePercent: Number(percentage(attOnTime, dutyRows.length).toFixed(1)),
        exceptionPercent: Number(percentage(exceptionRows, dutyRows.length).toFixed(1)),
        activeDays: new Set(dutyRows.map((row) => row.dutyDate)).size,
        vehicles: new Set(dutyRows.map((row) => row.vehicle)).size,
        topIssue,
        lastSeen: [...dutyRows.map((row) => row.dutyDate)].sort().at(-1) ?? "",
      };
    })
    .sort((left, right) =>
      left.attOnTimePercent - right.attOnTimePercent
      || right.exceptionPercent - left.exceptionPercent
      || right.partComplete - left.partComplete
      || right.lateArrivals - left.lateArrivals
      || left.duty.localeCompare(right.duty),
    );
}

function buildDailySummary(rows: NetworkPerformanceRow[]) {
  const map = new Map<string, DailySummary>();
  rows.forEach((row) => {
    const current = map.get(row.dutyDate) ?? {
      date: row.dutyDate,
      completed: 0,
      dttOt: 0,
      attOt: 0,
      dttOnTimePercent: 0,
      attOnTimePercent: 0,
    };
    current.completed += 1;
    if (row.dtt === "OT") current.dttOt += 1;
    if (row.att === "OT") current.attOt += 1;
    map.set(row.dutyDate, current);
  });

  return Array.from(map.values())
    .map((day) => ({
      ...day,
      dttOnTimePercent: Number(percentage(day.dttOt, day.completed).toFixed(1)),
      attOnTimePercent: Number(percentage(day.attOt, day.completed).toFixed(1)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildIssueSummary(rows: NetworkPerformanceRow[]) {
  const map = new Map<string, number>();
  rows.forEach((row) => map.set(row.issueCategory, (map.get(row.issueCategory) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count, percentage: Number(percentage(count, rows.length).toFixed(1)) }))
    .sort((a, b) => b.count - a.count);
}

function getRawDataHeaders() {
  return [
    "Reporting Site",
    "Debrief Status",
    "Leg State",
    "Duty Date",
    "Week Number",
    "Duty Order",
    "Duty Number",
    "Division",
    "Driver",
    "Vehicle",
    "Trailer Number",
    "Due to Convey",
    "Departure Location",
    "Planned Start",
    "Actual Start",
    "Start Difference",
    "DTT",
    "Departure Assets",
    "Final Destination",
    "Planned Finish",
    "Actual Finish",
    "Finish Difference",
    "ATT",
    "Arrival Assets",
    "Issue Category",
    "Driver Notes",
    "Outcome",
    "Debriefed By",
    "Debriefed At",
  ];
}

function buildRawExportRows(rows: NetworkPerformanceRow[]) {
  return rows.map((row) => [
    row.reportingSite,
    row.debriefStatus,
    row.legState,
    formatDateOnly(row.dutyDate),
    row.weekNumber,
    row.dutyOrder,
    row.dutyNumber,
    row.division,
    row.driver,
    row.vehicle,
    row.trailerNumber,
    row.traffic,
    row.departureLocation,
    formatDateTime(row.plannedStartTs),
    formatDateTime(row.actualStartTs),
    row.startDifference,
    row.dtt,
    row.departureAssets,
    row.finalDestination,
    formatDateTime(row.plannedFinishTs),
    formatDateTime(row.actualFinishTs),
    row.finishDifference,
    row.att,
    row.arrivalAssets,
    row.issueCategory,
    row.driverNotes,
    row.outcome,
    row.debriefedBy,
    formatDateTime(row.debriefedAtTs),
  ]);
}

function getDateRange(days: number): DateRange {
  const today = getDateInTimeZone("Europe/London");
  const dates = Array.from({ length: days }, (_, index) => addDays(today, index - days));
  return {
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    dates,
  };
}

function getDateInTimeZone(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value || "1970";
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";
  return `${year}-${month}-${day}`;
}

function addDays(dateInput: string, dayOffset: number) {
  const [year, month, day] = dateInput.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function buildTimestamp(dateInput: string, totalMinutes: number) {
  const date = new Date(`${dateInput}T00:00:00`);
  date.setMinutes(totalMinutes);
  return `${formatInputDate(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:00`;
}

function formatInputDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateOnly(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatShortDate(value: string) {
  const [, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}`;
}

function formatDateTime(value: string) {
  return `${formatDateOnly(value)} ${value.slice(11, 16)}`;
}

function formatDifference(minutes: number) {
  const sign = minutes > 0 ? "+" : minutes < 0 ? "-" : "";
  const absoluteMinutes = Math.abs(minutes);
  return `${sign}${String(Math.floor(absoluteMinutes / 60)).padStart(2, "0")}:${String(absoluteMinutes % 60).padStart(2, "0")}`;
}

function getTimingCode(minutes: number): TimingCode {
  if (minutes <= -31) return "VE";
  if (minutes <= -9) return "E";
  if (minutes <= 8) return "OT";
  if (minutes <= 30) return "L";
  if (minutes < 120) return "VL";
  return "F";
}

function getWeekNumberFromAprilFirst(dateInput: string) {
  const date = new Date(`${dateInput}T00:00:00`);
  const aprilFirst = new Date(`${date.getFullYear()}-04-01T00:00:00`);
  const differenceDays = Math.floor((date.getTime() - aprilFirst.getTime()) / 86_400_000);
  return Math.floor(differenceDays / 7) + 1;
}

function clampAssetValue(value: number) {
  return Math.max(0, Math.min(95, value));
}

function buildSiteCode(site: string) {
  const words = site.toUpperCase().match(/[A-Z0-9]+/g) || ["NAT"];
  const initials = words.map((word) => word[0]).join("");
  const compactCode = initials.length >= 3 ? initials.slice(0, 3) : words.join("").slice(0, 3);
  return compactCode.padEnd(3, "X");
}

function buildDriverNotes(issueCategory: string, destination: string) {
  if (issueCategory === "Late Departure") return "Driver confirmed a short loading delay before departure. Duty completed and debrief closed.";
  if (issueCategory === "Late Arrival") return `Driver reported traffic congestion approaching ${destination}. Duty completed and timings confirmed.`;
  return "Driver confirmed the leg was completed as planned with no operational issues.";
}

function percentage(value: number, total: number) {
  return total > 0 ? (value / total) * 100 : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

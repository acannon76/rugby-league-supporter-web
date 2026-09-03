"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  exportExcelWorkbook,
  exportTabularData,
  type ExportFormat,
} from "../../../exportData";
import { OperationalDownloadModal } from "../OperationalDownloadModal";
import { downloadOperationalReportPdf } from "../operationalReportPdf";
import {
  behaviourMetricLabels,
  coachingFocus,
  driverBehaviourRows,
  driverReportingSites,
  nationalBehaviourSummary,
  scoreTone,
  siteBehaviourSummaries,
  summariseBehaviour,
  type BehaviourScoreKey,
  type CoachingBand,
  type DriverBehaviourRow,
} from "./driverBehaviourData";

type PeriodDefault = "Last 28 days" | "Last 7 days" | "Last 90 days";
type CoachingFilter = "All drivers" | CoachingBand;
type SortKey = "driverName" | "overallScore" | BehaviourScoreKey;
type SortOrder = "az" | "za" | "attention" | "strongest";

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
  { label: "Vehicle view", icon: "🚛", href: "/internal/app-ideas/link-message-mock/vehicle-data-maintenance" },
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

const coachingFilters: CoachingFilter[] = [
  "All drivers",
  "Priority coaching",
  "Coaching review",
  "Performing well",
];

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "driverName", label: "Driver name" },
  { value: "overallScore", label: "Overall driver score" },
  { value: "accelerationScore", label: "Harsh acceleration" },
  { value: "brakingScore", label: "Harsh braking" },
  { value: "speedScore", label: "Speed compliance" },
  { value: "corneringScore", label: "Cornering control" },
  { value: "idlingScore", label: "Idling management" },
  { value: "overRevvingScore", label: "Engine over-revving" },
];

const metricDefinitions: {
  key: BehaviourScoreKey;
  label: string;
  eventLabel: string;
  value: (row: DriverBehaviourRow) => number;
  suffix: string;
}[] = [
  { key: "accelerationScore", label: "Harsh acceleration", eventLabel: "events / 100 mi", value: (row) => row.harshAccelerationRate, suffix: "" },
  { key: "brakingScore", label: "Harsh braking", eventLabel: "events / 100 mi", value: (row) => row.harshBrakingRate, suffix: "" },
  { key: "speedScore", label: "Speed compliance", eventLabel: "exceptions / 100 mi", value: (row) => row.speedingRate, suffix: "" },
  { key: "corneringScore", label: "Cornering control", eventLabel: "events / 100 mi", value: (row) => row.harshCorneringRate, suffix: "" },
  { key: "idlingScore", label: "Idling management", eventLabel: "engine-on time", value: (row) => row.idlingPercent, suffix: "%" },
  { key: "overRevvingScore", label: "Engine over-revving", eventLabel: "events / 100 mi", value: (row) => row.overRevvingRate, suffix: "" },
];

export default function DriverBehaviourDashboard() {
  const [site, setSite] = useState("All sites");
  const [coachingBand, setCoachingBand] = useState<CoachingFilter>("All drivers");
  const [search, setSearch] = useState("");
  const [periodDefault, setPeriodDefault] = useState<PeriodDefault>("Last 28 days");
  const [fromDateTime, setFromDateTime] = useState("");
  const [toDateTime, setToDateTime] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("driverName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("az");
  const [selectedDriverId, setSelectedDriverId] = useState(driverBehaviourRows[0]?.id ?? "");
  const [downloadOpen, setDownloadOpen] = useState(false);

  const resolvedPeriod = useMemo(
    () => resolveBehaviourPeriod(periodDefault, fromDateTime, toDateTime),
    [periodDefault, fromDateTime, toDateTime],
  );

  const periodRows = useMemo(
    () => applyBehaviourPeriod(driverBehaviourRows, resolvedPeriod.start, resolvedPeriod.end),
    [resolvedPeriod.start, resolvedPeriod.end],
  );

  const localBenchmarkRows = useMemo(
    () => periodRows.filter((row) => site === "All sites" || row.homeSite === site),
    [periodRows, site],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = localBenchmarkRows.filter((row) => {
      if (coachingBand !== "All drivers" && row.coachingBand !== coachingBand) return false;
      if (
        query &&
        !`${row.driverName} ${row.employeeId} ${row.homeSite} ${row.vehiclesUsed.join(" ")}`
          .toLowerCase()
          .includes(query)
      ) return false;
      return true;
    });
    return sortDriverRows(rows, sortKey, sortOrder);
  }, [localBenchmarkRows, coachingBand, search, sortKey, sortOrder]);

  const selectedDriver = useMemo(
    () => filteredRows.find((row) => row.id === selectedDriverId) ?? filteredRows[0] ?? null,
    [filteredRows, selectedDriverId],
  );

  const localSummary = useMemo(() => summariseBehaviour(localBenchmarkRows), [localBenchmarkRows]);
  const filteredSummary = useMemo(() => summariseBehaviour(filteredRows), [filteredRows]);
  const attentionByMetric = useMemo(() => buildAttentionByMetric(filteredRows), [filteredRows]);
  const coachingMix = useMemo(() => buildCoachingMix(filteredRows), [filteredRows]);

  const resetFilters = () => {
    setSite("All sites");
    setCoachingBand("All drivers");
    setSearch("");
    setPeriodDefault("Last 28 days");
    setFromDateTime("");
    setToDateTime("");
    setSortKey("driverName");
    setSortOrder("az");
  };

  const changeSortKey = (value: SortKey) => {
    setSortKey(value);
    setSortOrder(value === "driverName" ? "az" : "attention");
  };

  const toggleColumnSort = (value: SortKey) => {
    if (sortKey !== value) {
      setSortKey(value);
      setSortOrder(value === "driverName" ? "az" : "attention");
      return;
    }
    if (value === "driverName") setSortOrder(sortOrder === "az" ? "za" : "az");
    else setSortOrder(sortOrder === "attention" ? "strongest" : "attention");
  };

  const download = async (format: ExportFormat) => {
    const generatedAt = formatDateTime(new Date().toISOString());
    const fileBase = `Driver_Behaviour_Coaching_Report_${new Date().toISOString().slice(0, 10)}`;
    const headers = [
      "DriverName",
      "EmployeeID",
      "HomeSite",
      "Region",
      "Duties",
      "DistanceMiles",
      "DrivingHours",
      "VehiclesUsed",
      "OverallScore",
      "HarshAccelerationScore",
      "HarshAccelerationEventsPer100Miles",
      "HarshBrakingScore",
      "HarshBrakingEventsPer100Miles",
      "SpeedComplianceScore",
      "SpeedExceptionsPer100Miles",
      "CorneringControlScore",
      "HarshCorneringEventsPer100Miles",
      "IdlingManagementScore",
      "IdlingPercent",
      "OverRevvingScore",
      "OverRevvingEventsPer100Miles",
      "CoachingBand",
      "TrainingStatus",
      "SSoWStatus",
      "VehicleChangeoverStatus",
      "LastCoachingDate",
      "NextReviewDate",
    ];
    const rows = filteredRows.map((row) => [
      row.driverName,
      row.employeeId,
      row.homeSite,
      row.region,
      row.duties,
      row.distanceMiles,
      row.drivingHours,
      row.vehiclesUsed.join(" | "),
      row.overallScore,
      row.accelerationScore,
      row.harshAccelerationRate,
      row.brakingScore,
      row.harshBrakingRate,
      row.speedScore,
      row.speedingRate,
      row.corneringScore,
      row.harshCorneringRate,
      row.idlingScore,
      row.idlingPercent,
      row.overRevvingScore,
      row.overRevvingRate,
      row.coachingBand,
      row.trainingStatus,
      row.ssowStatus,
      row.changeoverStatus,
      formatDate(row.lastCoachingDate),
      formatDate(row.nextReviewDate),
    ]);

    if (format === "excel") {
      const siteRows = siteBehaviourSummaries
        .filter((row) => site === "All sites" || row.site === site)
        .map((row) => [
          row.site,
          row.region,
          row.drivers,
          row.overallScore,
          row.accelerationScore,
          row.brakingScore,
          row.speedScore,
          row.corneringScore,
          row.idlingScore,
          row.overRevvingScore,
          row.priorityDrivers,
          row.reviewDrivers,
        ]);

      await exportExcelWorkbook({
        fileName: `${fileBase}.xlsx`,
        sheets: [
          {
            name: "Summary",
            headers: ["Metric", "Value"],
            rows: [
              ["Reporting site", site],
              ["Coaching filter", coachingBand],
              ["Sort", `${sortLabel(sortKey)} - ${sortOrderLabel(sortKey, sortOrder)}`],
              ["Drivers in selected data", filteredRows.length],
              ["Selected scope score", filteredSummary.overallScore],
              ["Site score", site === "All sites" ? "Select a site" : localSummary.overallScore],
              ["National score", nationalBehaviourSummary.overallScore],
              ["Priority coaching", filteredRows.filter((row) => row.coachingBand === "Priority coaching").length],
              ["Report start", formatDateTime(resolvedPeriod.start)],
              ["Report end", formatDateTime(resolvedPeriod.end)],
              ["Report generated", generatedAt],
              ["Scoring basis", "0-100 coaching indicator; higher is stronger. Event metrics are normalised per 100 miles; idling is % engine-on time."],
              ["Use", "ADC coaching and development prioritisation. Not a productivity or disciplinary ranking."],
            ],
          },
          {
            name: "Driver Behaviour",
            headers,
            rows,
          },
          {
            name: "Site Scores",
            headers: [
              "Site",
              "Region",
              "Drivers",
              "OverallScore",
              "AccelerationScore",
              "BrakingScore",
              "SpeedScore",
              "CorneringScore",
              "IdlingScore",
              "OverRevvingScore",
              "PriorityCoaching",
              "CoachingReview",
            ],
            rows: siteRows,
          },
          ...(selectedDriver
            ? [{
                name: "Selected Driver",
                headers: ["Field", "Value"],
                rows: selectedDriverExportRows(selectedDriver, localSummary),
              }]
            : []),
        ],
      });
    } else if (format === "csv") {
      exportTabularData({
        format: "csv",
        headers,
        rows,
        fileName: `${fileBase}.csv`,
        title: "Driver Behaviour & Coaching Report",
      });
    } else {
      downloadOperationalReportPdf({
        fileName: `${fileBase}.pdf`,
        title: "Driver Behaviour & Coaching Report",
        subtitle: "ADC coaching indicators based on driver-controllable driving behaviours",
        filters: [
          { label: "Reporting site", value: site },
          { label: "Coaching filter", value: coachingBand },
          { label: "Search", value: search.trim() || "None" },
          { label: "Sort", value: `${sortLabel(sortKey)} - ${sortOrderLabel(sortKey, sortOrder)}` },
          { label: "Report start", value: formatDateTime(resolvedPeriod.start) },
          { label: "Report end", value: formatDateTime(resolvedPeriod.end) },
          { label: "Generated", value: generatedAt },
        ],
        kpis: [
          { label: "Drivers selected", value: String(filteredRows.length), helper: `${new Set(filteredRows.map((row) => row.homeSite)).size} site(s)`, tone: "navy" },
          { label: "Selected scope score", value: scoreDisplay(filteredSummary.overallScore), helper: "0-100 coaching indicator", tone: toneForPdf(filteredSummary.overallScore) },
          { label: "Site score", value: site === "All sites" ? "Select site" : scoreDisplay(localSummary.overallScore), helper: site === "All sites" ? "Use site filter" : site, tone: site === "All sites" ? "navy" : toneForPdf(localSummary.overallScore) },
          { label: "National score", value: scoreDisplay(nationalBehaviourSummary.overallScore), helper: "National mock benchmark", tone: toneForPdf(nationalBehaviourSummary.overallScore) },
          { label: "Priority coaching", value: String(filteredRows.filter((row) => row.coachingBand === "Priority coaching").length), helper: "Drivers needing first review", tone: "red" },
          { label: "Assurance actions", value: String(countAssuranceActions(filteredRows)), helper: "Training / SSoW / changeover", tone: "amber" },
        ],
        notes: [
          "The dashboard is alphabetical by default; ADCs can deliberately sort a behaviour from needs-most-attention to strongest, or reverse it.",
          "MPG is intentionally excluded from driver scoring because duty, route, vehicle and load differences can make MPG an unfair driver comparison.",
          "Harsh-event measures are normalised per 100 miles to reduce the effect of different mileage. Idling is measured as a percentage of engine-on time.",
          "Scores are coaching indicators for targeted support and should be reviewed with operational context before any intervention.",
        ],
        columns: [
          { label: "DRIVER", width: 105, align: "left" },
          { label: "SITE", width: 118, align: "left" },
          { label: "OVERALL", width: 58 },
          { label: "ACCEL", width: 55 },
          { label: "BRAKE", width: 55 },
          { label: "SPEED", width: 55 },
          { label: "CORNER", width: 55 },
          { label: "IDLE", width: 55 },
          { label: "OVER-REV", width: 60 },
          { label: "COACHING", width: 104, align: "left" },
        ],
        rows: filteredRows.map((row) => [
          row.driverName,
          row.homeSite,
          String(row.overallScore),
          String(row.accelerationScore),
          String(row.brakingScore),
          String(row.speedScore),
          String(row.corneringScore),
          String(row.idlingScore),
          String(row.overRevvingScore),
          row.coachingBand,
        ]),
      });
    }
    setDownloadOpen(false);
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
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f46e5]">ADC driver coaching insight</p>
                <h1 className="mt-2 text-3xl font-black text-[#10203a]">Driver Behaviour & Coaching Dashboard</h1>
                <p className="mt-2 max-w-5xl text-sm font-bold leading-6 text-[#4b5563]">
                  Identify driving behaviours where Advanced Driver Coaches can target support and training. The score focuses on driver-controllable behaviours rather than MPG, which can be heavily affected by route, load and vehicle differences.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Link href="/internal/app-ideas/link-message-mock/reports" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#c7d2df] bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-[#10203a] no-underline hover:bg-[#f8fafc]">← Back to reports</Link>
                <button type="button" disabled={!filteredRows.length} onClick={() => setDownloadOpen(true)} className="min-h-11 rounded-xl bg-[#10203a] px-5 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-white hover:bg-[#1e3558] disabled:cursor-not-allowed disabled:bg-[#94a3b8]">Download selected report</button>
              </div>
            </div>

            <section className="mt-5 overflow-hidden rounded-[18px] border border-[#273b52] bg-[#31485f] shadow-sm">
              <div className="flex flex-col gap-1 border-b border-white/15 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-white">Dashboard filters</p>
                <p className="text-xs font-bold text-white/70">Default driver order is A-Z. Use Sort by and Order only when an ADC needs a focused coaching review.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
                <FilterSelect label="Reporting site" value={site} onChange={setSite}>
                  <option>All sites</option>
                  {driverReportingSites.map((location) => <option key={location}>{location}</option>)}
                </FilterSelect>
                <FilterSelect label="Coaching status" value={coachingBand} onChange={(value) => setCoachingBand(value as CoachingFilter)}>
                  {coachingFilters.map((option) => <option key={option}>{option}</option>)}
                </FilterSelect>
                <FilterSelect label="Sort by" value={sortKey} onChange={(value) => changeSortKey(value as SortKey)}>
                  {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </FilterSelect>
                <FilterSelect label="Order" value={sortOrder} onChange={(value) => setSortOrder(value as SortOrder)}>
                  {sortKey === "driverName" ? (
                    <><option value="az">A-Z</option><option value="za">Z-A</option></>
                  ) : (
                    <><option value="attention">Needs most attention first</option><option value="strongest">Strongest first</option></>
                  )}
                </FilterSelect>
                <FilterSelect label="Blank dates use" value={periodDefault} onChange={(value) => setPeriodDefault(value as PeriodDefault)}>
                  <option>Last 28 days</option>
                  <option>Last 7 days</option>
                  <option>Last 90 days</option>
                </FilterSelect>
                <DateTimeFilter label="From date & time" value={fromDateTime} onChange={setFromDateTime} />
                <DateTimeFilter label="To date & time" value={toDateTime} onChange={setToDateTime} />
                <label className="min-w-0">
                  <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/80">Search driver</span>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, ID or vehicle" className="h-11 w-full rounded-lg border border-white/20 bg-white px-3 text-sm font-bold text-[#10203a] outline-none" />
                </label>
              </div>
              <div className="flex flex-col gap-2 border-t border-white/15 px-4 py-2.5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold text-white/80">Report period: {formatDateTime(resolvedPeriod.start)} to {formatDateTime(resolvedPeriod.end)}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-white/55">Scores are 0-100. Higher is stronger; lower scores indicate where coaching attention may be useful.</p>
                </div>
                <button type="button" onClick={resetFilters} className="rounded-lg border border-white/35 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-white/20">Reset filters</button>
              </div>
            </section>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
              <KpiCard label="Drivers matching filters" value={String(filteredRows.length)} helper={`${new Set(filteredRows.map((row) => row.homeSite)).size} reporting site(s)`} tone="navy" />
              <KpiCard label="Selected driver score" value={selectedDriver ? scoreDisplay(selectedDriver.overallScore) : "—"} helper={selectedDriver?.driverName ?? "Select a driver"} tone={selectedDriver ? scoreTone(selectedDriver.overallScore) : "navy"} />
              <KpiCard label="Site score" value={site === "All sites" ? "—" : scoreDisplay(localSummary.overallScore)} helper={site === "All sites" ? "Select a reporting site" : site} tone={site === "All sites" ? "navy" : scoreTone(localSummary.overallScore)} />
              <KpiCard label="National score" value={scoreDisplay(nationalBehaviourSummary.overallScore)} helper="National mock benchmark" tone={scoreTone(nationalBehaviourSummary.overallScore)} />
              <KpiCard label="Priority coaching" value={String(filteredRows.filter((row) => row.coachingBand === "Priority coaching").length)} helper="Needs first ADC review" tone="red" />
              <KpiCard label="Assurance actions" value={String(countAssuranceActions(filteredRows))} helper="Training / SSoW / changeover" tone="amber" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <BehaviourComparisonPanel
                title={site === "All sites" ? "National behaviour score profile" : `${site} vs national benchmark`}
                scopeLabel={site === "All sites" ? "National" : "Site"}
                scopeSummary={site === "All sites" ? nationalBehaviourSummary : localSummary}
              />
              <AttentionPanel rows={attentionByMetric} total={filteredRows.length} coachingMix={coachingMix} />
            </div>

            <section className="mt-4 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-white">
              <div className="flex flex-col gap-2 border-b border-[#d7dee9] bg-[#f8fafc] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-base font-black text-[#10203a]">Driver behaviour detail</p>
                  <p className="mt-1 text-xs font-bold text-[#64748b]">Alphabetical by default. Click a heading to sort it; click a driver to open their coaching profile.</p>
                </div>
                <div className="rounded-xl border border-[#dbe3ec] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.07em] text-[#64748b]">
                  Behaviour columns show score / 100 · lower = more attention
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1540px] border-collapse text-left text-xs">
                  <thead className="bg-[#10203a] text-white">
                    <tr>
                      <SortableHeader label="Driver" sortKey="driverName" activeKey={sortKey} order={sortOrder} onClick={toggleColumnSort} align="left" />
                      <th className="whitespace-nowrap px-3 py-3 text-[10px] font-black uppercase tracking-[0.07em]">Site</th>
                      <th className="whitespace-nowrap px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.07em]">Duties</th>
                      <th className="whitespace-nowrap px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.07em]">Miles</th>
                      <th className="whitespace-nowrap px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.07em]">Vehicles</th>
                      <SortableHeader label="Overall" sortKey="overallScore" activeKey={sortKey} order={sortOrder} onClick={toggleColumnSort} />
                      <SortableHeader label="Harsh accel" sortKey="accelerationScore" activeKey={sortKey} order={sortOrder} onClick={toggleColumnSort} />
                      <SortableHeader label="Harsh brake" sortKey="brakingScore" activeKey={sortKey} order={sortOrder} onClick={toggleColumnSort} />
                      <SortableHeader label="Speed" sortKey="speedScore" activeKey={sortKey} order={sortOrder} onClick={toggleColumnSort} />
                      <SortableHeader label="Cornering" sortKey="corneringScore" activeKey={sortKey} order={sortOrder} onClick={toggleColumnSort} />
                      <SortableHeader label="Idling" sortKey="idlingScore" activeKey={sortKey} order={sortOrder} onClick={toggleColumnSort} />
                      <SortableHeader label="Over-rev" sortKey="overRevvingScore" activeKey={sortKey} order={sortOrder} onClick={toggleColumnSort} />
                      <th className="whitespace-nowrap px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.07em]">Coaching status</th>
                      <th className="whitespace-nowrap px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.07em]">ADC profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.slice(0, 260).map((row, index) => {
                      const selected = selectedDriver?.id === row.id;
                      return (
                        <tr
                          key={row.id}
                          className={`${selected ? "bg-[#eef2ff]" : index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"} cursor-pointer hover:bg-[#eef4fb]`}
                          onClick={() => setSelectedDriverId(row.id)}
                        >
                          <td className="whitespace-nowrap border-b border-[#e4e9ef] px-3 py-2.5">
                            <p className="font-black text-[#10203a]">{row.driverName}</p>
                            <p className="mt-0.5 text-[10px] font-bold text-[#7a8798]">{row.employeeId}</p>
                          </td>
                          <td className="max-w-[180px] truncate border-b border-[#e4e9ef] px-3 py-2.5 font-bold" title={row.homeSite}>{row.homeSite}</td>
                          <td className="border-b border-[#e4e9ef] px-3 py-2.5 text-center font-bold">{row.duties}</td>
                          <td className="border-b border-[#e4e9ef] px-3 py-2.5 text-center font-bold">{formatNumber(row.distanceMiles, 0)}</td>
                          <td className="border-b border-[#e4e9ef] px-3 py-2.5 text-center font-bold">{row.vehiclesUsed.length}</td>
                          <td className="border-b border-[#e4e9ef] px-3 py-2.5 text-center"><ScoreBadge score={row.overallScore} /></td>
                          <td className="border-b border-[#e4e9ef] px-3 py-2.5 text-center"><ScoreBadge score={row.accelerationScore} /></td>
                          <td className="border-b border-[#e4e9ef] px-3 py-2.5 text-center"><ScoreBadge score={row.brakingScore} /></td>
                          <td className="border-b border-[#e4e9ef] px-3 py-2.5 text-center"><ScoreBadge score={row.speedScore} /></td>
                          <td className="border-b border-[#e4e9ef] px-3 py-2.5 text-center"><ScoreBadge score={row.corneringScore} /></td>
                          <td className="border-b border-[#e4e9ef] px-3 py-2.5 text-center"><ScoreBadge score={row.idlingScore} /></td>
                          <td className="border-b border-[#e4e9ef] px-3 py-2.5 text-center"><ScoreBadge score={row.overRevvingScore} /></td>
                          <td className="border-b border-[#e4e9ef] px-3 py-2.5 text-center"><CoachingBadge band={row.coachingBand} /></td>
                          <td className="border-b border-[#e4e9ef] px-3 py-2.5 text-center">
                            <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedDriverId(row.id); }} className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.06em] text-[#10203a] hover:bg-[#f1f5f9]">View</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {!filteredRows.length ? <p className="px-4 py-12 text-center text-sm font-bold text-[#64748b]">No drivers match the active filters.</p> : null}
              {filteredRows.length > 260 ? <p className="border-t border-[#d7dee9] bg-[#fff7ed] px-4 py-3 text-xs font-bold text-[#9a3412]">Dashboard table shows the first 260 matching drivers for readability. Downloads contain all {filteredRows.length} selected rows.</p> : null}
            </section>

            {selectedDriver ? (
              <SelectedDriverPanel
                driver={selectedDriver}
                siteSummary={summariseBehaviour(periodRows.filter((row) => row.homeSite === selectedDriver.homeSite))}
              />
            ) : null}

            <section className="mt-4 rounded-[18px] border border-[#cfd8e5] bg-[#f8fafc] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e0e7ff] text-sm font-black text-[#4338ca]">i</div>
                <div>
                  <h2 className="text-sm font-black text-[#10203a]">How to use the coaching score</h2>
                  <p className="mt-1 text-xs font-bold leading-5 text-[#64748b]">
                    The dashboard deliberately opens A-Z rather than as a ranking. ADCs can sort a specific behaviour when planning coaching. Harsh events are shown as rates per 100 miles and idling as a percentage of engine-on time. MPG is excluded from the driver score because route, load and vehicle differences can materially affect fuel consumption. Scores should trigger a coaching review, not replace operational context or professional judgement.
                  </p>
                </div>
              </div>
            </section>
          </section>
        </main>
      </div>
      {downloadOpen ? <OperationalDownloadModal title="Driver Behaviour & Coaching Report" rowCount={filteredRows.length} onClose={() => setDownloadOpen(false)} onDownload={download} /> : null}
    </div>
  );
}

function SelectedDriverPanel({ driver, siteSummary }: { driver: DriverBehaviourRow; siteSummary: ReturnType<typeof summariseBehaviour> }) {
  const focus = coachingFocus(driver).slice(0, 3);
  return (
    <section className="mt-4 overflow-hidden rounded-[18px] border border-[#cfd8e5] bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#dce3eb] bg-[#f8fafc] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#4f46e5]">Selected driver coaching profile</p>
          <h2 className="mt-1 text-2xl font-black text-[#10203a]">{driver.driverName}</h2>
          <p className="mt-1 text-xs font-bold text-[#64748b]">{driver.employeeId} · {driver.homeSite} · {driver.duties} duties · {formatNumber(driver.distanceMiles, 0)} miles · {driver.vehiclesUsed.length} vehicles</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ScoreDial label="Driver" score={driver.overallScore} />
          <ScoreDial label="Site" score={siteSummary.overallScore} />
          <ScoreDial label="National" score={nationalBehaviourSummary.overallScore} />
        </div>
      </div>

      <div className="grid gap-4 p-4 2xl:grid-cols-[1.45fr_0.75fr]">
        <div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {metricDefinitions.map((metric) => (
              <DriverMetricCard key={metric.key} driver={driver} siteSummary={siteSummary} metric={metric} />
            ))}
          </div>

          <div className="mt-4 rounded-[16px] border border-[#d7dee9] bg-[#f8fafc] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-black text-[#10203a]">Vehicles used in selected period</h3>
                <p className="mt-1 text-xs font-bold text-[#64748b]">Useful for checking vehicle familiarisation and changeover requirements.</p>
              </div>
              <p className="text-xs font-black text-[#64748b]">{driver.vehiclesUsed.length} vehicles</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {driver.vehiclesUsed.map((vehicle) => <span key={vehicle} className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-black text-[#10203a]">{vehicle}</span>)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Panel title="ADC coaching focus" subtitle="Lowest scoring behaviours first. Use these as prompts for coaching discussion rather than a league-table position.">
            <div className="mt-3 space-y-2.5">
              {focus.map((item, index) => (
                <div key={item.key} className="flex items-center gap-3 rounded-xl border border-[#dde4ed] bg-[#f8fafc] p-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${index === 0 ? "bg-[#fee2e2] text-[#b91c1c]" : "bg-[#fef3c7] text-[#92400e]"}`}>{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-[#10203a]">{item.label}</p>
                    <p className="mt-0.5 text-[10px] font-bold text-[#64748b]">Driver score {item.score}/100</p>
                  </div>
                  <ScoreBadge score={item.score} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="ADC assurance" subtitle="Training and Safe System of Work checks can be reviewed alongside the driving behaviour evidence.">
            <div className="mt-3 space-y-2">
              <AssuranceRow label="Core driver training" value={driver.trainingStatus} />
              <AssuranceRow label="Safe Systems of Work" value={driver.ssowStatus} />
              <AssuranceRow label="Vehicle changeovers" value={driver.changeoverStatus} />
              <AssuranceRow label="Last coaching" value={formatDate(driver.lastCoachingDate)} neutral />
              <AssuranceRow label="Next review" value={formatDate(driver.nextReviewDate)} neutral />
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}

function DriverMetricCard({
  driver,
  siteSummary,
  metric,
}: {
  driver: DriverBehaviourRow;
  siteSummary: ReturnType<typeof summariseBehaviour>;
  metric: (typeof metricDefinitions)[number];
}) {
  const score = driver[metric.key];
  const siteScore = siteSummary[metric.key];
  const nationalScore = nationalBehaviourSummary[metric.key];
  const tone = scoreTone(score);
  const toneClass = {
    green: "border-[#bbf7d0] bg-[#f0fdf4]",
    amber: "border-[#fde68a] bg-[#fffbeb]",
    red: "border-[#fecaca] bg-[#fff1f2]",
  }[tone];
  const rawValue = metric.value(driver);

  return (
    <article className={`rounded-[16px] border p-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-[#10203a]">{metric.label}</h3>
          <p className="mt-1 text-[10px] font-bold text-[#64748b]">{rawValue.toFixed(metric.suffix ? 1 : 2)}{metric.suffix} {metric.eventLabel}</p>
        </div>
        <ScoreBadge score={score} />
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/90 ring-1 ring-black/5">
        <div className={`h-full rounded-full ${scoreBarClass(score)}`} style={{ width: `${score}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-black text-[#64748b]">
        <div className="rounded-lg bg-white/75 px-2.5 py-2">Site <span className="float-right text-[#10203a]">{siteScore.toFixed(1)}</span></div>
        <div className="rounded-lg bg-white/75 px-2.5 py-2">National <span className="float-right text-[#10203a]">{nationalScore.toFixed(1)}</span></div>
      </div>
    </article>
  );
}

function BehaviourComparisonPanel({
  title,
  scopeLabel,
  scopeSummary,
}: {
  title: string;
  scopeLabel: string;
  scopeSummary: ReturnType<typeof summariseBehaviour>;
}) {
  return (
    <Panel title={title} subtitle="Six behaviour scores shown against the national mock benchmark. Higher scores indicate stronger control.">
      <div className="mt-4 space-y-3">
        {metricDefinitions.map((metric) => {
          const localValue = scopeSummary[metric.key];
          const nationalValue = nationalBehaviourSummary[metric.key];
          const delta = Math.round((localValue - nationalValue) * 10) / 10;
          return (
            <div key={metric.key}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-black text-[#10203a]">{metric.label}</p>
                <p className="text-[10px] font-black text-[#64748b]">{scopeLabel} {localValue.toFixed(1)} · National {nationalValue.toFixed(1)} · <span className={delta >= 0 ? "text-[#15803d]" : "text-[#b91c1c]"}>{delta >= 0 ? "+" : ""}{delta.toFixed(1)}</span></p>
              </div>
              <div className="mt-1.5 grid grid-cols-[1fr_46px] items-center gap-2">
                <div className="relative h-3 overflow-hidden rounded-full bg-[#e8edf3]">
                  <div className="h-full rounded-full bg-[#4f46e5]" style={{ width: `${localValue}%` }} />
                  <span className="absolute bottom-0 top-0 w-[2px] bg-[#10203a]" style={{ left: `${Math.min(99, nationalValue)}%` }} />
                </div>
                <p className="text-right text-xs font-black text-[#10203a]">{localValue.toFixed(1)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function AttentionPanel({
  rows,
  total,
  coachingMix,
}: {
  rows: ReturnType<typeof buildAttentionByMetric>;
  total: number;
  coachingMix: ReturnType<typeof buildCoachingMix>;
}) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <Panel title="Coaching attention overview" subtitle="Shows where selected drivers have a behaviour score below 72, plus the overall coaching status mix.">
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black text-[#10203a]">{row.label}</p>
              <p className="text-xs font-black text-[#64748b]">{row.count} · {percent(row.count, total)}%</p>
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-[#e8edf3]">
              <div className="h-full rounded-full bg-[#e11d48]" style={{ width: `${(row.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#e3e8ef] pt-4">
        {coachingMix.map((row) => (
          <div key={row.label} className={`rounded-xl p-3 text-center ${row.className}`}>
            <p className="text-2xl font-black">{row.count}</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.06em]">{row.label}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  order,
  onClick,
  align = "center",
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  order: SortOrder;
  onClick: (value: SortKey) => void;
  align?: "left" | "center";
}) {
  const active = activeKey === sortKey;
  const arrow = active ? (order === "az" || order === "attention" ? "↓" : "↑") : "↕";
  return (
    <th className={`whitespace-nowrap px-3 py-3 ${align === "left" ? "text-left" : "text-center"}`}>
      <button type="button" onClick={() => onClick(sortKey)} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.07em] text-white hover:text-white/75">
        {label}<span className={active ? "text-[#a5b4fc]" : "text-white/40"}>{arrow}</span>
      </button>
    </th>
  );
}

function ScoreDial({ label, score }: { label: string; score: number }) {
  const tone = scoreTone(score);
  const ringClass = { green: "border-[#16a34a]", amber: "border-[#d97706]", red: "border-[#dc2626]" }[tone];
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#d7dee9] bg-white px-3 py-2">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full border-4 ${ringClass} text-sm font-black text-[#10203a]`}>{Math.round(score)}</div>
      <div><p className="text-[9px] font-black uppercase tracking-[0.08em] text-[#64748b]">{label}</p><p className="text-xs font-black text-[#10203a]">Score /100</p></div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone = scoreTone(score);
  const classes = {
    green: "bg-[#dcfce7] text-[#166534] ring-[#bbf7d0]",
    amber: "bg-[#fef3c7] text-[#92400e] ring-[#fde68a]",
    red: "bg-[#fee2e2] text-[#b91c1c] ring-[#fecaca]",
  }[tone];
  return <span className={`inline-flex min-w-[42px] justify-center rounded-full px-2 py-1 text-[10px] font-black ring-1 ${classes}`}>{score}</span>;
}

function CoachingBadge({ band }: { band: CoachingBand }) {
  const classes = band === "Priority coaching"
    ? "bg-[#fee2e2] text-[#b91c1c] ring-[#fecaca]"
    : band === "Coaching review"
      ? "bg-[#fef3c7] text-[#92400e] ring-[#fde68a]"
      : "bg-[#dcfce7] text-[#166534] ring-[#bbf7d0]";
  return <span className={`inline-flex min-w-[108px] justify-center rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.04em] ring-1 ${classes}`}>{band}</span>;
}

function AssuranceRow({ label, value, neutral = false }: { label: string; value: string; neutral?: boolean }) {
  const statusClass = neutral
    ? "bg-[#eef2f7] text-[#475569] ring-[#d7dee9]"
    : value === "Current" || value === "Complete"
      ? "bg-[#dcfce7] text-[#166534] ring-[#bbf7d0]"
      : value === "Due soon"
        ? "bg-[#fef3c7] text-[#92400e] ring-[#fde68a]"
        : "bg-[#fee2e2] text-[#b91c1c] ring-[#fecaca]";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e0e6ee] bg-[#f8fafc] px-3 py-2.5">
      <p className="text-xs font-bold text-[#475569]">{label}</p>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.05em] ring-1 ${statusClass}`}>{value}</span>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-[18px] border border-[#d7dee9] bg-white p-4 shadow-sm"><h2 className="text-base font-black text-[#10203a]">{title}</h2><p className="mt-1 text-xs font-bold leading-5 text-[#64748b]">{subtitle}</p>{children}</section>;
}

function KpiCard({ label, value, helper, tone }: { label: string; value: string; helper: string; tone: "navy" | "amber" | "green" | "red" }) {
  const toneClass = { navy: "bg-[#10203a]", amber: "bg-[#d97706]", green: "bg-[#16a34a]", red: "bg-[#dc2626]" }[tone];
  return <div className="rounded-[16px] border border-[#d6dee8] bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><span className={`mt-0.5 h-9 w-2 rounded-full ${toneClass}`} /><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#718096]">{label}</p><p className="mt-1 truncate text-2xl font-black text-[#10203a]">{value}</p><p className="mt-1 truncate text-[10px] font-bold text-[#718096]">{helper}</p></div></div></div>;
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="min-w-0"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/80">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-lg border border-white/20 bg-white px-3 text-xs font-bold text-[#10203a] outline-none">{children}</select></label>;
}

function DateTimeFilter({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/80">{label}</span>
      <input type="datetime-local" value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-lg border border-white/20 bg-white px-2.5 text-xs font-black text-[#10203a] outline-none" />
    </label>
  );
}

function resolveBehaviourPeriod(periodDefault: PeriodDefault, fromDateTime: string, toDateTime: string) {
  const referenceEnd = new Date("2026-09-03T17:30:00");
  const defaultDays = periodDefault === "Last 7 days" ? 7 : periodDefault === "Last 90 days" ? 90 : 28;
  const parsedTo = toDateTime ? new Date(toDateTime) : referenceEnd;
  const safeEnd = Number.isNaN(parsedTo.getTime()) ? referenceEnd : parsedTo;
  const parsedFrom = fromDateTime ? new Date(fromDateTime) : new Date(safeEnd.getTime() - defaultDays * 86_400_000);
  const safeFrom = Number.isNaN(parsedFrom.getTime()) ? new Date(safeEnd.getTime() - defaultDays * 86_400_000) : parsedFrom;

  if (safeFrom.getTime() >= safeEnd.getTime()) {
    return { start: toDateTimeValue(new Date(safeEnd.getTime() - defaultDays * 86_400_000)), end: toDateTimeValue(safeEnd) };
  }
  return { start: toDateTimeValue(safeFrom), end: toDateTimeValue(safeEnd) };
}

function applyBehaviourPeriod(rows: DriverBehaviourRow[], start: string, end: string) {
  const selectedMs = Math.max(86_400_000, new Date(end).getTime() - new Date(start).getTime());
  const scale = selectedMs / (28 * 86_400_000);
  return rows.map((row) => ({
    ...row,
    duties: Math.max(1, Math.round(row.duties * scale)),
    distanceMiles: Math.max(25, roundOne(row.distanceMiles * scale)),
    drivingHours: Math.max(1, roundOne(row.drivingHours * scale)),
  }));
}

function sortDriverRows(rows: DriverBehaviourRow[], key: SortKey, order: SortOrder) {
  return [...rows].sort((a, b) => {
    if (key === "driverName") {
      const compared = a.driverName.localeCompare(b.driverName) || a.homeSite.localeCompare(b.homeSite);
      return order === "za" ? -compared : compared;
    }
    const compared = a[key] - b[key] || a.driverName.localeCompare(b.driverName);
    return order === "strongest" ? -compared : compared;
  });
}

function buildAttentionByMetric(rows: DriverBehaviourRow[]) {
  return metricDefinitions
    .map((metric) => ({ label: metric.label, count: rows.filter((row) => row[metric.key] < 72).length }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function buildCoachingMix(rows: DriverBehaviourRow[]) {
  return [
    { label: "Priority", count: rows.filter((row) => row.coachingBand === "Priority coaching").length, className: "bg-[#fff1f2] text-[#b91c1c]" },
    { label: "Review", count: rows.filter((row) => row.coachingBand === "Coaching review").length, className: "bg-[#fffbeb] text-[#92400e]" },
    { label: "Performing well", count: rows.filter((row) => row.coachingBand === "Performing well").length, className: "bg-[#f0fdf4] text-[#166534]" },
  ];
}

function countAssuranceActions(rows: DriverBehaviourRow[]) {
  return rows.filter((row) => row.trainingStatus !== "Current" || row.ssowStatus !== "Current" || row.changeoverStatus !== "Complete").length;
}

function selectedDriverExportRows(driver: DriverBehaviourRow, siteSummary: ReturnType<typeof summariseBehaviour>) {
  return [
    ["Driver", driver.driverName],
    ["Employee ID", driver.employeeId],
    ["Home site", driver.homeSite],
    ["Overall score", driver.overallScore],
    ["Site score", siteSummary.overallScore],
    ["National score", nationalBehaviourSummary.overallScore],
    ["Coaching status", driver.coachingBand],
    ["Duties", driver.duties],
    ["Distance miles", driver.distanceMiles],
    ["Driving hours", driver.drivingHours],
    ["Vehicles used", driver.vehiclesUsed.join(" | ")],
    ["Harsh acceleration", `${driver.accelerationScore}/100 (${driver.harshAccelerationRate} events / 100 mi)`],
    ["Harsh braking", `${driver.brakingScore}/100 (${driver.harshBrakingRate} events / 100 mi)`],
    ["Speed compliance", `${driver.speedScore}/100 (${driver.speedingRate} exceptions / 100 mi)`],
    ["Cornering control", `${driver.corneringScore}/100 (${driver.harshCorneringRate} events / 100 mi)`],
    ["Idling management", `${driver.idlingScore}/100 (${driver.idlingPercent}% engine-on time)`],
    ["Engine over-revving", `${driver.overRevvingScore}/100 (${driver.overRevvingRate} events / 100 mi)`],
    ["Core driver training", driver.trainingStatus],
    ["Safe Systems of Work", driver.ssowStatus],
    ["Vehicle changeovers", driver.changeoverStatus],
    ["Last coaching", formatDate(driver.lastCoachingDate)],
    ["Next review", formatDate(driver.nextReviewDate)],
  ];
}

function sortLabel(key: SortKey) {
  if (key === "driverName") return "Driver name";
  if (key === "overallScore") return "Overall score";
  return behaviourMetricLabels[key];
}

function sortOrderLabel(key: SortKey, order: SortOrder) {
  if (key === "driverName") return order === "za" ? "Z-A" : "A-Z";
  return order === "strongest" ? "Strongest first" : "Needs most attention first";
}

function scoreBarClass(score: number) {
  return score >= 85 ? "bg-[#16a34a]" : score >= 70 ? "bg-[#d97706]" : "bg-[#dc2626]";
}

function toneForPdf(score: number): "green" | "amber" | "red" {
  return score >= 85 ? "green" : score >= 70 ? "amber" : "red";
}

function scoreDisplay(value: number) {
  return value ? `${value.toFixed(1)}/100` : "—";
}

function percent(value: number, total: number) {
  return total ? Math.round((value / total) * 1000) / 10 : 0;
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function formatNumber(value: number, decimals = 0) {
  return new Intl.NumberFormat("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toDateTimeValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function OfficeHeader() {
  return <header className="flex min-h-[64px] items-center justify-between bg-[#e40000] text-white shadow-sm"><div className="flex h-full items-center"><Link href="/internal/app-ideas/link-message-mock" className="flex h-[64px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black text-white no-underline hover:bg-white/10" aria-label="Back to Duty Execution">≡</Link><div className="px-5"><p className="text-2xl font-black uppercase tracking-wide">MOCK UP</p><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Report 7 · Driver Behaviour & Coaching</p></div></div><div className="flex items-center gap-4 px-4"><Link href="/internal/app-ideas" className="hidden rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline hover:bg-white/15 sm:block">← Back to DriverOS Home</Link><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-[#e40000]">●</div><div className="hidden text-right sm:block"><p className="text-base font-black">Andrew Cannon</p><p className="text-xs font-bold text-white/80">Mock dashboard user</p></div></div></header>;
}

function OfficeSidebar() {
  return <aside className="flex min-h-[calc(100vh-64px)] w-[68px] shrink-0 flex-col bg-[#252c33] text-white">{sidebarItems.map((item) => <Link key={item.label} href={item.href} aria-label={item.label} title={item.label} className={`relative flex h-[64px] items-center justify-center border-b border-white/10 no-underline transition ${item.icon.length > 2 ? "text-sm font-black" : "text-3xl"} ${item.active ? "bg-[#11171d] text-white" : "text-white/75 hover:bg-[#11171d] hover:text-white"}`}><span>{item.icon}</span>{item.alertCount ? <span className="absolute bottom-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e40000] px-1 text-[11px] font-black text-white ring-2 ring-[#252c33]">{item.alertCount}</span> : null}</Link>)}</aside>;
}

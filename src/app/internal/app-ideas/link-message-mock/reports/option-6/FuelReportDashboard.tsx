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
import { availableLocations } from "../option-4/nationalLocalPlanDashboardData";
import {
  formatFuelDateTime,
  fuelReportPeriod,
  fuelReportRows,
  type FuelReportRow,
} from "./fuelReportData";

type ConsumptionFilter = "All consumption" | "No fuel reading" | "Under 10" | "10 to 11.99" | "12 to 13.99" | "14 and over";
type BlankDateDefault = "Last 7 days" | "Last 24 hours";

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
  { label: "Reports", icon: "REP", href: "/internal/app-ideas/link-message-mock/reports", active: true },
  { label: "A&D Dashboard", icon: "A&D", href: "/internal/app-ideas/link-message-mock/arrivals-departures" },
  { label: "System Configurations", icon: "⚙", href: "/internal/app-ideas/link-message-mock/configurations" },
];

const consumptionFilters: ConsumptionFilter[] = [
  "All consumption",
  "No fuel reading",
  "Under 10",
  "10 to 11.99",
  "12 to 13.99",
  "14 and over",
];

export default function FuelReportDashboard() {
  const [site, setSite] = useState("All sites");
  const [consumptionBand, setConsumptionBand] = useState<ConsumptionFilter>("All consumption");
  const [search, setSearch] = useState("");
  const [blankDateDefault, setBlankDateDefault] = useState<BlankDateDefault>("Last 7 days");
  const [fromDateTime, setFromDateTime] = useState("");
  const [toDateTime, setToDateTime] = useState("");
  const [downloadOpen, setDownloadOpen] = useState(false);

  const resolvedPeriod = useMemo(
    () => resolveFuelPeriod(blankDateDefault, fromDateTime, toDateTime),
    [blankDateDefault, fromDateTime, toDateTime],
  );
  const periodRows = useMemo(
    () => applyFuelPeriod(fuelReportRows, resolvedPeriod.start, resolvedPeriod.end),
    [resolvedPeriod.start, resolvedPeriod.end],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return periodRows.filter((row) => {
      if (site !== "All sites" && row.locationName !== site) return false;
      if (!matchesConsumption(row, consumptionBand)) return false;
      if (query && !`${row.vehicleName} ${row.locationName}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [site, consumptionBand, search, periodRows]);

  const totals = useMemo(() => summariseFuelRows(filteredRows), [filteredRows]);
  const siteSummary = useMemo(() => buildSiteSummary(filteredRows), [filteredRows]);
  const distribution = useMemo(() => buildConsumptionDistribution(filteredRows), [filteredRows]);

  const resetFilters = () => {
    setSite("All sites");
    setConsumptionBand("All consumption");
    setSearch("");
    setBlankDateDefault("Last 7 days");
    setFromDateTime("");
    setToDateTime("");
  };

  const download = async (format: ExportFormat) => {
    const generatedAt = formatFuelDateTime(new Date().toISOString());
    const headers = [
      "LocationName",
      "VehicleName",
      "FuelUsed",
      "Distance",
      "FuelConsumption",
      "ReportStartDate",
      "ReportEndDate",
    ];
    const rows = filteredRows.map((row) => [
      row.locationName,
      row.vehicleName,
      row.fuelUsed,
      row.distance,
      row.fuelConsumption,
      formatFuelDateTime(row.reportStartDate),
      formatFuelDateTime(row.reportEndDate),
    ]);
    const fileBase = `Fuel_Report_${new Date().toISOString().slice(0, 10)}`;

    if (format === "excel") {
      await exportExcelWorkbook({
        fileName: `${fileBase}.xlsx`,
        sheets: [
          {
            name: "Summary",
            headers: ["Metric", "Value"],
            rows: [
              ["Reporting site", site],
              ["Consumption filter", consumptionBand],
              ["Vehicles selected", totals.vehicles],
              ["Fuel used", totals.fuelUsed],
              ["Distance", totals.distance],
              ["Average consumption", totals.averageConsumption],
              ["Best consumption", totals.bestConsumption],
              ["No fuel readings", totals.zeroFuel],
              ["Report start", formatFuelDateTime(resolvedPeriod.start)],
              ["Report end", formatFuelDateTime(resolvedPeriod.end)],
              ["Blank date default", blankDateDefault],
              ["Report generated", generatedAt],
            ],
          },
          { name: "Fuel Data", headers, rows },
        ],
      });
    } else if (format === "csv") {
      exportTabularData({ format: "csv", headers, rows, fileName: `${fileBase}.csv`, title: "Fuel Report" });
    } else {
      downloadOperationalReportPdf({
        fileName: `${fileBase}.pdf`,
        title: "Fuel Report",
        subtitle: "Vehicle fuel usage, distance and fuel consumption performance",
        filters: [
          { label: "Reporting site", value: site },
          { label: "Consumption", value: consumptionBand },
          { label: "Search", value: search.trim() || "None" },
          { label: "Report start", value: formatFuelDateTime(resolvedPeriod.start) },
          { label: "Report end", value: formatFuelDateTime(resolvedPeriod.end) },
          { label: "Report generated", value: generatedAt },
        ],
        kpis: [
          { label: "Vehicles selected", value: String(totals.vehicles), helper: `${totals.siteCount} reporting site(s)`, tone: "navy" },
          { label: "Fuel used", value: formatNumber(totals.fuelUsed, 1), helper: "Selected vehicle total", tone: "amber" },
          { label: "Distance", value: formatNumber(totals.distance, 1), helper: "Selected vehicle total", tone: "blue" },
          { label: "Average consumption", value: totals.averageConsumption ? `${totals.averageConsumption.toFixed(2)} MPG` : "N/A", helper: "Distance / fuel used", tone: "teal" },
          { label: "Best consumption", value: totals.bestConsumption ? `${totals.bestConsumption.toFixed(2)} MPG` : "N/A", helper: totals.bestVehicle || "No valid reading", tone: "green" },
          { label: "No fuel readings", value: String(totals.zeroFuel), helper: "Fuel used = 0", tone: "red" },
        ],
        notes: [
          "Fuel consumption is shown using the FuelConsumption value supplied in the source report.",
          "Average consumption uses total selected distance divided by total selected fuel used where fuel data is present.",
          "Rows with zero fuel used are retained so missing or non-reporting fuel data can be investigated.",
          "The detailed PDF pages contain every vehicle included by the active dashboard filters.",
        ],
        columns: [
          { label: "SITE", width: 150, align: "left" },
          { label: "VEHICLE", width: 135, align: "left" },
          { label: "FUEL USED", width: 90 },
          { label: "DISTANCE", width: 100 },
          { label: "CONSUMPTION", width: 100 },
          { label: "START", width: 100 },
          { label: "END", width: 119 },
        ],
        rows: filteredRows.map((row) => [
          row.locationName,
          row.vehicleName,
          formatNumber(row.fuelUsed, 1),
          formatNumber(row.distance, 1),
          row.fuelConsumption ? `${row.fuelConsumption.toFixed(2)} MPG` : "No reading",
          shortDate(row.reportStartDate),
          shortDate(row.reportEndDate),
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
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">Fleet fuel performance</p>
                <h1 className="mt-2 text-3xl font-black text-[#10203a]">Fuel Report Dashboard</h1>
                <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-[#4b5563]">
                  Review vehicle fuel usage, distance and consumption across reporting sites, identify missing fuel readings and compare fleet efficiency at vehicle and site level.
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
                <p className="text-xs font-bold text-white/70">Every KPI, chart, table and download responds to this selection</p>
              </div>
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <FilterSelect label="Reporting site" value={site} onChange={setSite}>
                  <option>All sites</option>
                  {availableLocations.map((location) => <option key={location}>{location}</option>)}
                </FilterSelect>
                <FilterSelect label="Fuel consumption" value={consumptionBand} onChange={(value) => setConsumptionBand(value as ConsumptionFilter)}>
                  {consumptionFilters.map((option) => <option key={option}>{option}</option>)}
                </FilterSelect>
                <FilterSelect label="Blank dates use" value={blankDateDefault} onChange={(value) => setBlankDateDefault(value as BlankDateDefault)}>
                  <option>Last 7 days</option>
                  <option>Last 24 hours</option>
                </FilterSelect>
                <DateTimeFilter label="From date & time" value={fromDateTime} onChange={setFromDateTime} />
                <DateTimeFilter label="To date & time" value={toDateTime} onChange={setToDateTime} />
                <label className="min-w-0">
                  <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/80">Search vehicle</span>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Vehicle or reporting site" className="h-11 w-full rounded-lg border border-white/20 bg-white px-3 text-sm font-bold text-[#10203a] outline-none" />
                </label>
              </div>
              <div className="flex flex-col gap-2 border-t border-white/15 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold text-white/80">Report period: {formatFuelDateTime(resolvedPeriod.start)} to {formatFuelDateTime(resolvedPeriod.end)}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-white/55">Leave From and To blank to use {blankDateDefault.toLowerCase()}.</p>
                </div>
                <button type="button" onClick={resetFilters} className="rounded-lg border border-white/35 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-white/20">Reset filters</button>
              </div>
            </section>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
              <KpiCard label="Vehicles selected" value={String(totals.vehicles)} helper={`${totals.siteCount} reporting sites`} tone="navy" />
              <KpiCard label="Fuel used" value={formatNumber(totals.fuelUsed, 1)} helper="Selected vehicle total" tone="amber" />
              <KpiCard label="Distance" value={formatNumber(totals.distance, 1)} helper="Selected vehicle total" tone="blue" />
              <KpiCard label="Average consumption" value={totals.averageConsumption ? `${totals.averageConsumption.toFixed(2)} MPG` : "N/A"} helper="Distance / fuel used" tone="teal" />
              <KpiCard label="Best consumption" value={totals.bestConsumption ? `${totals.bestConsumption.toFixed(2)} MPG` : "N/A"} helper={totals.bestVehicle || "No valid reading"} tone="green" />
              <KpiCard label="No fuel readings" value={String(totals.zeroFuel)} helper="Fuel used = 0" tone="red" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_0.85fr]">
              <SiteFuelPanel rows={siteSummary} />
              <ConsumptionDistributionPanel rows={distribution} total={filteredRows.length} />
            </div>

            <section className="mt-4 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-white">
              <div className="flex flex-col gap-2 border-b border-[#d7dee9] bg-[#f8fafc] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-base font-black text-[#10203a]">Vehicle fuel detail</p><p className="mt-1 text-xs font-bold text-[#64748b]">{filteredRows.length} vehicle row(s) match the active dashboard filters.</p></div>
                <p className="text-xs font-black text-[#64748b]">Period: {formatFuelDateTime(resolvedPeriod.start)} - {formatFuelDateTime(resolvedPeriod.end)}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[1050px] w-full border-collapse text-left text-xs">
                  <thead className="bg-[#10203a] text-white"><tr>{["Reporting site", "Vehicle", "Fuel used", "Distance", "Fuel consumption", "Report start", "Report end"].map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-3 text-[10px] font-black uppercase tracking-[0.07em]">{heading}</th>)}</tr></thead>
                  <tbody>
                    {filteredRows.slice(0, 220).map((row, index) => (
                      <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                        <td className="whitespace-nowrap border-b border-[#e4e9ef] px-3 py-2.5 font-bold">{row.locationName}</td>
                        <td className="whitespace-nowrap border-b border-[#e4e9ef] px-3 py-2.5 font-black text-[#10203a]">{row.vehicleName}</td>
                        <td className="border-b border-[#e4e9ef] px-3 py-2.5 font-bold">{formatNumber(row.fuelUsed, 1)}</td>
                        <td className="border-b border-[#e4e9ef] px-3 py-2.5 font-bold">{formatNumber(row.distance, 1)}</td>
                        <td className="border-b border-[#e4e9ef] px-3 py-2.5"><ConsumptionBadge value={row.fuelConsumption} /></td>
                        <td className="whitespace-nowrap border-b border-[#e4e9ef] px-3 py-2.5 font-semibold">{formatFuelDateTime(row.reportStartDate)}</td>
                        <td className="whitespace-nowrap border-b border-[#e4e9ef] px-3 py-2.5 font-semibold">{formatFuelDateTime(row.reportEndDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredRows.length > 220 ? <p className="border-t border-[#d7dee9] bg-[#fff7ed] px-4 py-3 text-xs font-bold text-[#9a3412]">Dashboard table shows the first 220 matching rows for readability. Downloads contain all {filteredRows.length} selected rows.</p> : null}
            </section>
          </section>
        </main>
      </div>
      {downloadOpen ? <OperationalDownloadModal title="Fuel Report" rowCount={filteredRows.length} onClose={() => setDownloadOpen(false)} onDownload={download} /> : null}
    </div>
  );
}

function DateTimeFilter({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/80">{label}</span>
      <input
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-white/20 bg-white px-2.5 text-xs font-black text-[#10203a] outline-none"
      />
    </label>
  );
}

function resolveFuelPeriod(blankDateDefault: BlankDateDefault, fromDateTime: string, toDateTime: string) {
  const referenceEnd = new Date("2026-08-26T17:45:00");
  const defaultHours = blankDateDefault === "Last 24 hours" ? 24 : 7 * 24;
  const parsedTo = toDateTime ? new Date(toDateTime) : referenceEnd;
  const safeEnd = Number.isNaN(parsedTo.getTime()) ? referenceEnd : parsedTo;
  const parsedFrom = fromDateTime ? new Date(fromDateTime) : new Date(safeEnd.getTime() - defaultHours * 3_600_000);
  const safeFrom = Number.isNaN(parsedFrom.getTime()) ? new Date(safeEnd.getTime() - defaultHours * 3_600_000) : parsedFrom;

  if (safeFrom.getTime() >= safeEnd.getTime()) {
    return {
      start: toDateTimeValue(new Date(safeEnd.getTime() - defaultHours * 3_600_000)),
      end: toDateTimeValue(safeEnd),
    };
  }

  return { start: toDateTimeValue(safeFrom), end: toDateTimeValue(safeEnd) };
}

function applyFuelPeriod(rows: FuelReportRow[], start: string, end: string) {
  const baselineMs = Math.max(1, new Date(fuelReportPeriod.end).getTime() - new Date(fuelReportPeriod.start).getTime());
  const selectedMs = Math.max(3_600_000, new Date(end).getTime() - new Date(start).getTime());
  const scale = selectedMs / baselineMs;

  return rows.map((row) => ({
    ...row,
    fuelUsed: row.fuelUsed === 0 ? 0 : Math.max(0.1, roundOne(row.fuelUsed * scale)),
    distance: row.distance === 0 ? 0 : Math.max(0.1, roundOne(row.distance * scale)),
    reportStartDate: start,
    reportEndDate: end,
  }));
}

function toDateTimeValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function matchesConsumption(row: FuelReportRow, band: ConsumptionFilter) {
  if (band === "All consumption") return true;
  if (band === "No fuel reading") return row.fuelUsed === 0 || row.fuelConsumption === 0;
  if (row.fuelConsumption === 0) return false;
  if (band === "Under 10") return row.fuelConsumption < 10;
  if (band === "10 to 11.99") return row.fuelConsumption >= 10 && row.fuelConsumption < 12;
  if (band === "12 to 13.99") return row.fuelConsumption >= 12 && row.fuelConsumption < 14;
  return row.fuelConsumption >= 14;
}

function summariseFuelRows(rows: FuelReportRow[]) {
  const fuelUsed = rows.reduce((sum, row) => sum + row.fuelUsed, 0);
  const distance = rows.reduce((sum, row) => sum + row.distance, 0);
  const valid = rows.filter((row) => row.fuelConsumption > 0);
  const best = [...valid].sort((a, b) => b.fuelConsumption - a.fuelConsumption)[0];
  return {
    vehicles: rows.length,
    siteCount: new Set(rows.map((row) => row.locationName)).size,
    fuelUsed: roundOne(fuelUsed),
    distance: roundOne(distance),
    averageConsumption: fuelUsed > 0 ? distance / fuelUsed : 0,
    bestConsumption: best?.fuelConsumption ?? 0,
    bestVehicle: best?.vehicleName ?? "",
    zeroFuel: rows.filter((row) => row.fuelUsed === 0).length,
  };
}

function buildSiteSummary(rows: FuelReportRow[]) {
  const map = new Map<string, { site: string; vehicles: number; fuel: number; distance: number }>();
  rows.forEach((row) => {
    const current = map.get(row.locationName) ?? { site: row.locationName, vehicles: 0, fuel: 0, distance: 0 };
    current.vehicles += 1;
    current.fuel += row.fuelUsed;
    current.distance += row.distance;
    map.set(row.locationName, current);
  });
  return [...map.values()].map((row) => ({ ...row, consumption: row.fuel > 0 ? row.distance / row.fuel : 0 })).sort((a, b) => b.fuel - a.fuel).slice(0, 10);
}

function buildConsumptionDistribution(rows: FuelReportRow[]) {
  const bands = [
    { label: "No fuel reading", count: 0, tone: "red" },
    { label: "Under 10 MPG", count: 0, tone: "amber" },
    { label: "10 - 11.99 MPG", count: 0, tone: "blue" },
    { label: "12 - 13.99 MPG", count: 0, tone: "teal" },
    { label: "14 MPG and over", count: 0, tone: "green" },
  ];
  rows.forEach((row) => {
    if (row.fuelConsumption === 0) bands[0].count += 1;
    else if (row.fuelConsumption < 10) bands[1].count += 1;
    else if (row.fuelConsumption < 12) bands[2].count += 1;
    else if (row.fuelConsumption < 14) bands[3].count += 1;
    else bands[4].count += 1;
  });
  return bands;
}

function SiteFuelPanel({ rows }: { rows: ReturnType<typeof buildSiteSummary> }) {
  const maxFuel = Math.max(1, ...rows.map((row) => row.fuel));
  return <Panel title="Highest fuel usage by site" subtitle="Top reporting sites by total fuel used within the active selection."><div className="mt-4 space-y-3">{rows.length ? rows.map((row) => <div key={row.site}><div className="flex items-center justify-between gap-3"><p className="truncate text-xs font-black text-[#10203a]">{row.site}</p><p className="shrink-0 text-xs font-black text-[#475569]">{formatNumber(row.fuel, 1)} fuel · {row.consumption ? row.consumption.toFixed(2) : "0.00"} MPG</p></div><div className="mt-1.5 h-3 overflow-hidden rounded-full bg-[#e8edf3]"><div className="h-full rounded-full bg-[#0f766e]" style={{ width: `${(row.fuel / maxFuel) * 100}%` }} /></div></div>) : <p className="py-8 text-center text-sm font-bold text-[#64748b]">No matching site data.</p>}</div></Panel>;
}

function ConsumptionDistributionPanel({ rows, total }: { rows: ReturnType<typeof buildConsumptionDistribution>; total: number }) {
  return <Panel title="Fuel consumption distribution" subtitle="Vehicle count grouped by the source FuelConsumption value."><div className="mt-4 space-y-4">{rows.map((row) => <div key={row.label}><div className="flex items-center justify-between"><p className="text-xs font-black text-[#10203a]">{row.label}</p><p className="text-xs font-black text-[#64748b]">{row.count} · {percent(row.count, total)}%</p></div><div className="mt-1.5 h-4 overflow-hidden rounded-full bg-[#e8edf3]"><div className={`h-full rounded-full ${barTone(row.tone)}`} style={{ width: `${percent(row.count, total)}%` }} /></div></div>)}</div></Panel>;
}

function ConsumptionBadge({ value }: { value: number }) {
  const classes = value === 0 ? "bg-[#fee2e2] text-[#b91c1c] ring-[#fecaca]" : value < 10 ? "bg-[#fef3c7] text-[#92400e] ring-[#fde68a]" : value < 12 ? "bg-[#dbeafe] text-[#1d4ed8] ring-[#bfdbfe]" : "bg-[#dcfce7] text-[#166534] ring-[#bbf7d0]";
  return <span className={`inline-flex min-w-[92px] justify-center rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${classes}`}>{value ? `${value.toFixed(2)} MPG` : "No reading"}</span>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-[18px] border border-[#d7dee9] bg-white p-4 shadow-sm"><h2 className="text-base font-black text-[#10203a]">{title}</h2><p className="mt-1 text-xs font-bold leading-5 text-[#64748b]">{subtitle}</p>{children}</section>;
}

function KpiCard({ label, value, helper, tone }: { label: string; value: string; helper: string; tone: "navy" | "amber" | "blue" | "teal" | "green" | "red" }) {
  const toneClass = { navy: "bg-[#10203a]", amber: "bg-[#d97706]", blue: "bg-[#2563eb]", teal: "bg-[#0f766e]", green: "bg-[#16a34a]", red: "bg-[#dc2626]" }[tone];
  return <div className="rounded-[16px] border border-[#d6dee8] bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><span className={`mt-0.5 h-9 w-2 rounded-full ${toneClass}`} /><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#718096]">{label}</p><p className="mt-1 truncate text-2xl font-black text-[#10203a]">{value}</p><p className="mt-1 truncate text-[10px] font-bold text-[#718096]">{helper}</p></div></div></div>;
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="min-w-0"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/80">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-lg border border-white/20 bg-white px-3 text-sm font-bold text-[#10203a] outline-none">{children}</select></label>;
}

function barTone(tone: string) {
  if (tone === "red") return "bg-[#dc2626]";
  if (tone === "amber") return "bg-[#d97706]";
  if (tone === "blue") return "bg-[#2563eb]";
  if (tone === "teal") return "bg-[#0f766e]";
  return "bg-[#16a34a]";
}

function percent(value: number, total: number) { return total ? Math.round((value / total) * 1000) / 10 : 0; }
function roundOne(value: number) { return Math.round(value * 10) / 10; }
function formatNumber(value: number, decimals = 0) { return new Intl.NumberFormat("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value); }
function shortDate(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }

function OfficeHeader() {
  return <header className="flex min-h-[64px] items-center justify-between bg-[#e40000] text-white shadow-sm"><div className="flex h-full items-center"><Link href="/internal/app-ideas/link-message-mock" className="flex h-[64px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black text-white no-underline hover:bg-white/10" aria-label="Back to Duty Execution">≡</Link><div className="px-5"><p className="text-2xl font-black uppercase tracking-wide">MOCK UP</p><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Report 6 · Fuel Report</p></div></div><div className="flex items-center gap-4 px-4"><Link href="/internal/app-ideas" className="hidden rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline hover:bg-white/15 sm:block">← Back to DriverOS Home</Link><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-[#e40000]">●</div><div className="hidden text-right sm:block"><p className="text-base font-black">Andrew Cannon</p><p className="text-xs font-bold text-white/80">Mock dashboard user</p></div></div></header>;
}

function OfficeSidebar() {
  return <aside className="flex min-h-[calc(100vh-64px)] w-[68px] shrink-0 flex-col bg-[#252c33] text-white">{sidebarItems.map((item) => <Link key={item.label} href={item.href} aria-label={item.label} title={item.label} className={`relative flex h-[64px] items-center justify-center border-b border-white/10 no-underline transition ${item.icon.length > 2 ? "text-sm font-black" : "text-3xl"} ${item.active ? "bg-[#11171d] text-white" : "text-white/75 hover:bg-[#11171d] hover:text-white"}`}><span>{item.icon}</span>{item.alertCount ? <span className="absolute bottom-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e40000] px-1 text-[11px] font-black text-white ring-2 ring-[#252c33]">{item.alertCount}</span> : null}</Link>)}</aside>;
}

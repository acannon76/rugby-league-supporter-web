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
  ageText,
  formatSensorDateTime,
  ragLabel,
  sensorReferenceTime,
  sensorReportRows,
  type RagStatus,
  type SensorReportRow,
} from "./sensorReportData";

type RagFilter = "All statuses" | "G" | "A" | "R" | "-";

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

const ragOptions: { value: RagFilter; label: string }[] = [
  { value: "All statuses", label: "All statuses" },
  { value: "G", label: "Green" },
  { value: "A", label: "Amber" },
  { value: "R", label: "Red" },
  { value: "-", label: "Not fitted" },
];

export default function SensorReportDashboard() {
  const [site, setSite] = useState("All sites");
  const [overall, setOverall] = useState<RagFilter>("All statuses");
  const [gps, setGps] = useState<RagFilter>("All statuses");
  const [canbus, setCanbus] = useState<RagFilter>("All statuses");
  const [tacho, setTacho] = useState<RagFilter>("All statuses");
  const [search, setSearch] = useState("");
  const [downloadOpen, setDownloadOpen] = useState(false);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sensorReportRows.filter((row) => {
      if (site !== "All sites" && row.locationName !== site) return false;
      if (overall !== "All statuses" && row.overallRagStatus !== overall) return false;
      if (gps !== "All statuses" && row.gpsRagStatus !== gps) return false;
      if (canbus !== "All statuses" && row.canbusRagStatus !== canbus) return false;
      if (tacho !== "All statuses" && row.digiTachoRagStatus !== tacho) return false;
      if (!query) return true;
      return `${row.resourceName} ${row.locationName} ${row.deviceDetails}`.toLowerCase().includes(query);
    });
  }, [site, overall, gps, canbus, tacho, search]);

  const totals = useMemo(() => summariseSensorRows(filteredRows), [filteredRows]);
  const channelHealth = useMemo(() => buildChannelHealth(filteredRows), [filteredRows]);
  const attentionSites = useMemo(() => buildAttentionSites(filteredRows), [filteredRows]);

  const resetFilters = () => {
    setSite("All sites");
    setOverall("All statuses");
    setGps("All statuses");
    setCanbus("All statuses");
    setTacho("All statuses");
    setSearch("");
  };

  const download = async (format: ExportFormat) => {
    const generatedAt = formatSensorDateTime(new Date().toISOString());
    const statusTimestamp = formatSensorDateTime(sensorReferenceTime);
    const headers = [
      "ResourceName",
      "LocationName",
      "DeviceDetails",
      "GPS_EventTime",
      "GPS_RAGStatus",
      "CANbus_EventTime",
      "CANbus_RAGStatus",
      "DigiTacho_EventTime",
      "DigiTacho_RAGStatus",
      "Vehicle_OverallRAGStatus",
      "SensorStatusTimestamp",
      "ReportGenerated",
    ];
    const rows = filteredRows.map((row) => [
      row.resourceName,
      row.locationName,
      row.deviceDetails,
      row.gpsEventTime ? formatSensorDateTime(row.gpsEventTime) : "Not fitted",
      ragLabel(row.gpsRagStatus),
      row.canbusEventTime ? formatSensorDateTime(row.canbusEventTime) : "Not fitted",
      ragLabel(row.canbusRagStatus),
      row.digiTachoEventTime ? formatSensorDateTime(row.digiTachoEventTime) : "Not fitted",
      ragLabel(row.digiTachoRagStatus),
      ragLabel(row.overallRagStatus),
      statusTimestamp,
      generatedAt,
    ]);
    const fileBase = `Sensor_Report_${new Date().toISOString().slice(0, 10)}`;

    if (format === "excel") {
      await exportExcelWorkbook({
        fileName: `${fileBase}.xlsx`,
        sheets: [
          {
            name: "Summary",
            headers: ["Metric", "Value"],
            rows: [
              ["Reporting site", site],
              ["Rows selected", totals.total],
              ["Green", totals.green],
              ["Amber", totals.amber],
              ["Red", totals.red],
              ["Healthy", `${totals.healthPercent}%`],
              ["Sensor status timestamp", statusTimestamp],
              ["Report generated", generatedAt],
            ],
          },
          { name: "Sensor Data", headers, rows },
        ],
      });
    } else if (format === "csv") {
      exportTabularData({ format: "csv", headers, rows, fileName: `${fileBase}.csv`, title: "Sensor Report" });
    } else {
      downloadOperationalReportPdf({
        fileName: `${fileBase}.pdf`,
        title: "Sensor Report",
        subtitle: "Vehicle tracking device health - GPS, CANbus and Digital Tacho",
        filters: [
          { label: "Reporting site", value: site },
          { label: "Overall RAG", value: filterLabel(overall) },
          { label: "GPS", value: filterLabel(gps) },
          { label: "CANbus", value: filterLabel(canbus) },
          { label: "Digital Tacho", value: filterLabel(tacho) },
          { label: "Search", value: search.trim() || "None" },
          { label: "Sensor status timestamp", value: statusTimestamp },
          { label: "Report generated", value: generatedAt },
        ],
        kpis: [
          { label: "Vehicles selected", value: String(totals.total), helper: `${totals.siteCount} reporting site(s)`, tone: "navy" },
          { label: "Green", value: String(totals.green), helper: `${percent(totals.green, totals.total)}% healthy`, tone: "green" },
          { label: "Amber", value: String(totals.amber), helper: `${percent(totals.amber, totals.total)}% attention`, tone: "amber" },
          { label: "Red", value: String(totals.red), helper: `${percent(totals.red, totals.total)}% not reporting`, tone: "red" },
          { label: "Overall health", value: `${totals.healthPercent}%`, helper: "Vehicles currently green", tone: "teal" },
          { label: "Red channels", value: String(channelHealth.reduce((sum, item) => sum + item.red, 0)), helper: "GPS + CANbus + Tacho", tone: "red" },
        ],
        notes: [
          "Green: device data received within the last 4 days.",
          "Amber: no device data received for more than 4 days and up to 7 days.",
          "Red: no device data received for more than 7 days.",
          "Digital Tacho may show Not fitted where that connection is not applicable.",
        ],
        columns: [
          { label: "VEHICLE", width: 92, align: "left" },
          { label: "SITE", width: 110, align: "left" },
          { label: "GPS LAST", width: 85 },
          { label: "GPS", width: 42 },
          { label: "CAN LAST", width: 85 },
          { label: "CAN", width: 44 },
          { label: "TACHO LAST", width: 85 },
          { label: "TACHO", width: 46 },
          { label: "OVERALL", width: 50 },
          { label: "DEVICE", width: 155, align: "left" },
        ],
        rows: filteredRows.map((row) => [
          row.resourceName,
          row.locationName,
          shortDate(row.gpsEventTime),
          ragLabel(row.gpsRagStatus),
          shortDate(row.canbusEventTime),
          ragLabel(row.canbusRagStatus),
          shortDate(row.digiTachoEventTime),
          ragLabel(row.digiTachoRagStatus),
          ragLabel(row.overallRagStatus),
          row.deviceDetails,
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
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">Vehicle sensor health</p>
                <h1 className="mt-2 text-3xl font-black text-[#10203a]">Sensor Report Dashboard</h1>
                <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-[#4b5563]">
                  Monitor whether vehicle GPS, CANbus and Digital Tacho connections are reporting, identify stale devices and focus attention on vehicles requiring investigation.
                </p>
                <div className="mt-3 inline-flex items-center rounded-lg border border-[#ddd6fe] bg-[#f5f3ff] px-3 py-2 text-xs font-black text-[#5b21b6]">
                  Sensor status timestamp: {formatSensorDateTime(sensorReferenceTime)}
                </div>
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
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                <FilterSelect label="Reporting site" value={site} onChange={setSite}>
                  <option>All sites</option>
                  {availableLocations.map((location) => <option key={location}>{location}</option>)}
                </FilterSelect>
                <FilterSelect label="Overall RAG" value={overall} onChange={(value) => setOverall(value as RagFilter)}>{ragOptions.filter((option) => option.value !== "-").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</FilterSelect>
                <FilterSelect label="GPS" value={gps} onChange={(value) => setGps(value as RagFilter)}>{ragOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</FilterSelect>
                <FilterSelect label="CANbus" value={canbus} onChange={(value) => setCanbus(value as RagFilter)}>{ragOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</FilterSelect>
                <FilterSelect label="Digital Tacho" value={tacho} onChange={(value) => setTacho(value as RagFilter)}>{ragOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</FilterSelect>
                <label className="min-w-0">
                  <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/80">Search</span>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Vehicle, site or device" className="h-11 w-full rounded-lg border border-white/20 bg-white px-3 text-sm font-bold text-[#10203a] outline-none" />
                </label>
              </div>
              <div className="flex flex-col gap-2 border-t border-white/15 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-bold text-white/70">Sensor snapshot: {formatSensorDateTime(sensorReferenceTime)} · Green ≤ 4 days · Amber &gt; 4 days · Red &gt; 7 days</p>
                <button type="button" onClick={resetFilters} className="rounded-lg border border-white/35 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-white/20">Reset filters</button>
              </div>
            </section>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
              <KpiCard label="Vehicles selected" value={String(totals.total)} helper={`${totals.siteCount} reporting sites`} tone="navy" />
              <KpiCard label="Green" value={String(totals.green)} helper={`${percent(totals.green, totals.total)}% healthy`} tone="green" />
              <KpiCard label="Amber" value={String(totals.amber)} helper={`${percent(totals.amber, totals.total)}% attention`} tone="amber" />
              <KpiCard label="Red" value={String(totals.red)} helper={`${percent(totals.red, totals.total)}% not reporting`} tone="red" />
              <KpiCard label="Overall health" value={`${totals.healthPercent}%`} helper="Vehicles currently green" tone="teal" />
              <KpiCard label="Red sensor channels" value={String(channelHealth.reduce((sum, item) => sum + item.red, 0))} helper="Across GPS, CANbus & Tacho" tone="purple" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.15fr_1.1fr]">
              <OverallHealthPanel totals={totals} />
              <ChannelHealthPanel rows={channelHealth} />
              <AttentionSitesPanel rows={attentionSites} />
            </div>

            <section className="mt-4 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-white">
              <div className="flex flex-col gap-2 border-b border-[#d7dee9] bg-[#f8fafc] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-black text-[#10203a]">Vehicle sensor detail</p>
                  <p className="mt-1 text-xs font-bold text-[#64748b]">{filteredRows.length} vehicle row(s) match the active dashboard filters.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-black"><RagBadge status="G" /> <RagBadge status="A" /> <RagBadge status="R" /></div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[1450px] w-full border-collapse text-left text-xs">
                  <thead className="bg-[#10203a] text-white">
                    <tr>
                      {[
                        "Vehicle / Resource", "Reporting site", "GPS last data", "GPS", "CANbus last data", "CANbus", "Digital Tacho last data", "Tacho", "Overall", "Device details",
                      ].map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-3 text-[10px] font-black uppercase tracking-[0.07em]">{heading}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.slice(0, 180).map((row, index) => (
                      <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                        <td className="whitespace-nowrap border-b border-[#e4e9ef] px-3 py-2.5 font-black text-[#10203a]">{row.resourceName}</td>
                        <td className="whitespace-nowrap border-b border-[#e4e9ef] px-3 py-2.5 font-bold">{row.locationName}</td>
                        <SensorTimeCell value={row.gpsEventTime} />
                        <td className="border-b border-[#e4e9ef] px-3 py-2.5"><RagBadge status={row.gpsRagStatus} /></td>
                        <SensorTimeCell value={row.canbusEventTime} />
                        <td className="border-b border-[#e4e9ef] px-3 py-2.5"><RagBadge status={row.canbusRagStatus} /></td>
                        <SensorTimeCell value={row.digiTachoEventTime} />
                        <td className="border-b border-[#e4e9ef] px-3 py-2.5"><RagBadge status={row.digiTachoRagStatus} /></td>
                        <td className="border-b border-[#e4e9ef] px-3 py-2.5"><RagBadge status={row.overallRagStatus} /></td>
                        <td className="max-w-[330px] border-b border-[#e4e9ef] px-3 py-2.5 font-semibold text-[#475569]">{row.deviceDetails}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredRows.length > 180 ? <p className="border-t border-[#d7dee9] bg-[#fff7ed] px-4 py-3 text-xs font-bold text-[#9a3412]">Dashboard table shows the first 180 matching rows for readability. Downloads contain all {filteredRows.length} selected rows.</p> : null}
            </section>
          </section>
        </main>
      </div>

      {downloadOpen ? <OperationalDownloadModal title="Sensor Report" rowCount={filteredRows.length} onClose={() => setDownloadOpen(false)} onDownload={download} /> : null}
    </div>
  );
}

function SensorTimeCell({ value }: { value: string | null }) {
  return <td className="whitespace-nowrap border-b border-[#e4e9ef] px-3 py-2.5"><span className="font-bold text-[#24344d]">{formatSensorDateTime(value)}</span><span className="ml-2 text-[10px] font-black text-[#718096]">{ageText(value)}</span></td>;
}

function summariseSensorRows(rows: SensorReportRow[]) {
  const green = rows.filter((row) => row.overallRagStatus === "G").length;
  const amber = rows.filter((row) => row.overallRagStatus === "A").length;
  const red = rows.filter((row) => row.overallRagStatus === "R").length;
  return {
    total: rows.length,
    green,
    amber,
    red,
    healthPercent: percent(green, rows.length),
    siteCount: new Set(rows.map((row) => row.locationName)).size,
  };
}

function buildChannelHealth(rows: SensorReportRow[]) {
  return [
    channelSummary("GPS", rows.map((row) => row.gpsRagStatus)),
    channelSummary("CANbus", rows.map((row) => row.canbusRagStatus)),
    channelSummary("Digital Tacho", rows.map((row) => row.digiTachoRagStatus)),
  ];
}

function channelSummary(label: string, statuses: RagStatus[]) {
  const applicable = statuses.filter((status) => status !== "-");
  return {
    label,
    total: applicable.length,
    green: applicable.filter((status) => status === "G").length,
    amber: applicable.filter((status) => status === "A").length,
    red: applicable.filter((status) => status === "R").length,
    notFitted: statuses.filter((status) => status === "-").length,
  };
}

function buildAttentionSites(rows: SensorReportRow[]) {
  const map = new Map<string, { site: string; total: number; amber: number; red: number }>();
  rows.forEach((row) => {
    const current = map.get(row.locationName) ?? { site: row.locationName, total: 0, amber: 0, red: 0 };
    current.total += 1;
    if (row.overallRagStatus === "A") current.amber += 1;
    if (row.overallRagStatus === "R") current.red += 1;
    map.set(row.locationName, current);
  });
  return [...map.values()].sort((a, b) => (b.red * 2 + b.amber) - (a.red * 2 + a.amber) || b.total - a.total).slice(0, 8);
}

function OverallHealthPanel({ totals }: { totals: ReturnType<typeof summariseSensorRows> }) {
  return (
    <Panel title="Overall sensor health" subtitle="Vehicle-level RAG based on the worst applicable sensor channel.">
      <div className="mt-5 flex h-7 overflow-hidden rounded-full bg-[#e8edf3]">
        <div className="bg-[#16a34a]" style={{ width: `${percent(totals.green, totals.total)}%` }} />
        <div className="bg-[#f59e0b]" style={{ width: `${percent(totals.amber, totals.total)}%` }} />
        <div className="bg-[#dc2626]" style={{ width: `${percent(totals.red, totals.total)}%` }} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <MiniStatus label="Green" value={totals.green} helper="≤ 4 days" tone="green" />
        <MiniStatus label="Amber" value={totals.amber} helper="> 4 days" tone="amber" />
        <MiniStatus label="Red" value={totals.red} helper="> 7 days" tone="red" />
      </div>
      <div className="mt-5 rounded-xl border border-[#d7dee9] bg-[#f8fafc] p-3 text-xs font-bold leading-5 text-[#5b6676]">Overall RAG uses the worst status from GPS, CANbus and Digital Tacho. A channel marked Not fitted is excluded from the overall result.</div>
    </Panel>
  );
}

function ChannelHealthPanel({ rows }: { rows: ReturnType<typeof buildChannelHealth> }) {
  return (
    <Panel title="Sensor channel health" subtitle="Compare reporting performance across the three device connections.">
      <div className="mt-4 space-y-5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between gap-3"><p className="text-sm font-black text-[#10203a]">{row.label}</p><p className="text-xs font-black text-[#64748b]">{row.total} fitted{row.notFitted ? ` · ${row.notFitted} not fitted` : ""}</p></div>
            <div className="mt-2 flex h-5 overflow-hidden rounded-full bg-[#e8edf3]">
              <div className="bg-[#16a34a]" style={{ width: `${percent(row.green, row.total)}%` }} />
              <div className="bg-[#f59e0b]" style={{ width: `${percent(row.amber, row.total)}%` }} />
              <div className="bg-[#dc2626]" style={{ width: `${percent(row.red, row.total)}%` }} />
            </div>
            <div className="mt-2 flex gap-4 text-[10px] font-black uppercase tracking-[0.06em] text-[#64748b]"><span>Green {row.green}</span><span>Amber {row.amber}</span><span>Red {row.red}</span></div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AttentionSitesPanel({ rows }: { rows: ReturnType<typeof buildAttentionSites> }) {
  return (
    <Panel title="Sites requiring attention" subtitle="Highest combined Red and Amber vehicle positions in the current selection.">
      <div className="mt-3 divide-y divide-[#e5eaf0]">
        {rows.length ? rows.map((row) => (
          <div key={row.site} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2.5">
            <div className="min-w-0"><p className="truncate text-xs font-black text-[#10203a]">{row.site}</p><p className="mt-0.5 text-[10px] font-bold text-[#718096]">{row.total} vehicles</p></div>
            <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black text-[#b45309]">A {row.amber}</span>
            <span className="rounded-full bg-[#fff1f2] px-2.5 py-1 text-[10px] font-black text-[#b91c1c]">R {row.red}</span>
          </div>
        )) : <p className="py-8 text-center text-sm font-bold text-[#64748b]">No matching sites.</p>}
      </div>
    </Panel>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-[18px] border border-[#d7dee9] bg-white p-4 shadow-sm"><h2 className="text-base font-black text-[#10203a]">{title}</h2><p className="mt-1 text-xs font-bold leading-5 text-[#64748b]">{subtitle}</p>{children}</section>;
}

function MiniStatus({ label, value, helper, tone }: { label: string; value: number; helper: string; tone: "green" | "amber" | "red" }) {
  const classes = tone === "green" ? "border-[#bbefca] bg-[#ecfdf3] text-[#166534]" : tone === "amber" ? "border-[#fde4aa] bg-[#fffbeb] text-[#92400e]" : "border-[#fecaca] bg-[#fff1f2] text-[#b91c1c]";
  return <div className={`rounded-xl border p-3 ${classes}`}><p className="text-[10px] font-black uppercase tracking-[0.08em]">{label}</p><p className="mt-1 text-2xl font-black">{value}</p><p className="mt-1 text-[10px] font-bold opacity-75">{helper}</p></div>;
}

function KpiCard({ label, value, helper, tone }: { label: string; value: string; helper: string; tone: "navy" | "green" | "amber" | "red" | "teal" | "purple" }) {
  const toneClass = { navy: "bg-[#10203a]", green: "bg-[#16a34a]", amber: "bg-[#d97706]", red: "bg-[#dc2626]", teal: "bg-[#0f766e]", purple: "bg-[#7c3aed]" }[tone];
  return <div className="rounded-[16px] border border-[#d6dee8] bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><span className={`mt-0.5 h-9 w-2 rounded-full ${toneClass}`} /><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#718096]">{label}</p><p className="mt-1 text-2xl font-black text-[#10203a]">{value}</p><p className="mt-1 text-[10px] font-bold text-[#718096]">{helper}</p></div></div></div>;
}

function RagBadge({ status }: { status: RagStatus }) {
  const classes = status === "G" ? "bg-[#dcfce7] text-[#166534] ring-[#bbf7d0]" : status === "A" ? "bg-[#fef3c7] text-[#92400e] ring-[#fde68a]" : status === "R" ? "bg-[#fee2e2] text-[#b91c1c] ring-[#fecaca]" : "bg-[#eef2f6] text-[#64748b] ring-[#d8e0e9]";
  return <span className={`inline-flex min-w-[64px] justify-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.07em] ring-1 ${classes}`}>{ragLabel(status)}</span>;
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="min-w-0"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/80">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-lg border border-white/20 bg-white px-3 text-sm font-bold text-[#10203a] outline-none">{children}</select></label>;
}

function filterLabel(value: RagFilter) {
  return ragOptions.find((option) => option.value === value)?.label ?? value;
}

function percent(value: number, total: number) {
  return total ? Math.round((value / total) * 1000) / 10 : 0;
}

function shortDate(value: string | null) {
  if (!value) return "Not fitted";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function OfficeHeader() {
  return <header className="flex min-h-[64px] items-center justify-between bg-[#e40000] text-white shadow-sm"><div className="flex h-full items-center"><Link href="/internal/app-ideas/link-message-mock" className="flex h-[64px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black text-white no-underline hover:bg-white/10" aria-label="Back to Duty Execution">≡</Link><div className="px-5"><p className="text-2xl font-black uppercase tracking-wide">MOCK UP</p><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Report 5 · Sensor Report</p></div></div><div className="flex items-center gap-4 px-4"><Link href="/internal/app-ideas" className="hidden rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline hover:bg-white/15 sm:block">← Back to DriverOS Home</Link><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-[#e40000]">●</div><div className="hidden text-right sm:block"><p className="text-base font-black">Andrew Cannon</p><p className="text-xs font-bold text-white/80">Mock dashboard user</p></div></div></header>;
}

function OfficeSidebar() {
  return <aside className="flex min-h-[calc(100vh-64px)] w-[68px] shrink-0 flex-col bg-[#252c33] text-white">{sidebarItems.map((item) => <Link key={item.label} href={item.href} aria-label={item.label} title={item.label} className={`relative flex h-[64px] items-center justify-center border-b border-white/10 no-underline transition ${item.icon.length > 2 ? "text-sm font-black" : "text-3xl"} ${item.active ? "bg-[#11171d] text-white" : "text-white/75 hover:bg-[#11171d] hover:text-white"}`}><span>{item.icon}</span>{item.alertCount ? <span className="absolute bottom-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e40000] px-1 text-[11px] font-black text-white ring-2 ring-[#252c33]">{item.alertCount}</span> : null}</Link>)}</aside>;
}

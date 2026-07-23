"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { exportTabularData, type ExportFormat } from "../../exportData";

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  alertCount?: number;
  active?: boolean;
};

type NetworkPerformanceRow = {
  id: string;
  debriefStatus: "Debriefed";
  legState: "Complete";
  dutyDate: string;
  weekNumber: number;
  dutyOrder: number;
  dutyNumber: string;
  division: "Network";
  driver: string;
  vehicle: string;
  trailerNumber: string;
  traffic: string;
  departureLocation: string;
  plannedStartTs: string;
  actualStartTs: string;
  startDifference: string;
  dtt: TimingCode;
  departureAssets: number;
  finalDestination: string;
  plannedFinishTs: string;
  actualFinishTs: string;
  finishDifference: string;
  att: TimingCode;
  arrivalAssets: number;
  issueCategory: string;
  driverNotes: string;
  outcome: "Complete" | "Part Complete";
  debriefedBy: string;
  debriefedAtTs: string;
};

type TimingCode = "VE" | "E" | "OT" | "L" | "VL" | "F";

type BaseLeg = {
  dutyNumber: string;
  dutyOrder: number;
  traffic: string;
  departureLocation: string;
  finalDestination: string;
  plannedStartMinutes: number;
  durationMinutes: number;
  departureAssets: number;
  arrivalAssets: number;
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
];

const MOCK_TODAY = "2026-07-23";
const DEFAULT_START_DATE = "2026-07-18";
const DEFAULT_END_DATE = "2026-07-22";

const drivers = [
  "Andrew Cannon",
  "Chris Morgan",
  "Daniel Hughes",
  "Emma Williams",
  "James Carter",
  "Lisa Thompson",
  "Mark Davies",
  "Rachel Evans",
];

const vehicles = [
  "PE68UHD",
  "PN74CDY",
  "MX73BWW",
  "PN25MHS",
  "MX21DCT",
  "PX25HUB",
  "PN70BUA",
  "MX74FDN",
];

const trailers = [
  "7338014",
  "24316007",
  "4318005",
  "24160021",
  "20316087",
  "7338015",
  "5320233",
  "24163445",
];

const baseLegs: BaseLeg[] = [
  {
    dutyNumber: "NWH254",
    dutyOrder: 1,
    traffic: "1C 24 Mail",
    departureLocation: "North West Hub",
    finalDestination: "Manchester Mail Centre",
    plannedStartMinutes: 6 * 60,
    durationMinutes: 50,
    departureAssets: 34,
    arrivalAssets: 34,
  },
  {
    dutyNumber: "NWH254",
    dutyOrder: 2,
    traffic: "2C 48 Mail",
    departureLocation: "Manchester Mail Centre",
    finalDestination: "North West Hub",
    plannedStartMinutes: 7 * 60 + 20,
    durationMinutes: 40,
    departureAssets: 43,
    arrivalAssets: 41,
  },
  {
    dutyNumber: "NWH254",
    dutyOrder: 3,
    traffic: "Empty",
    departureLocation: "North West Hub",
    finalDestination: "Chester Mail Centre",
    plannedStartMinutes: 9 * 60,
    durationMinutes: 50,
    departureAssets: 52,
    arrivalAssets: 48,
  },
  {
    dutyNumber: "NWH254",
    dutyOrder: 4,
    traffic: "PF 24 Parcels",
    departureLocation: "Chester Mail Centre",
    finalDestination: "North West Hub",
    plannedStartMinutes: 10 * 60 + 20,
    durationMinutes: 55,
    departureAssets: 46,
    arrivalAssets: 50,
  },
  {
    dutyNumber: "NWH426",
    dutyOrder: 1,
    traffic: "Container Retriation",
    departureLocation: "North West Hub",
    finalDestination: "Preston Mail Centre",
    plannedStartMinutes: 12 * 60 + 15,
    durationMinutes: 45,
    departureAssets: 61,
    arrivalAssets: 58,
  },
  {
    dutyNumber: "NWH426",
    dutyOrder: 2,
    traffic: "Collection",
    departureLocation: "Preston Mail Centre",
    finalDestination: "North West Hub",
    plannedStartMinutes: 13 * 60 + 30,
    durationMinutes: 50,
    departureAssets: 55,
    arrivalAssets: 63,
  },
];

const startOffsetPattern = [-4, 2, 11, -7, 18, 5, 0, -12, 7, 14, -2, 4, 9, -5, 22, 3, -8, 6, 12, 1, -3, 8, -6, 16, 4, -1, 10, -9, 5, 13];
const finishOffsetPattern = [3, -2, 16, -5, 24, 7, 1, -8, 11, 19, -4, 6, 13, -3, 28, 4, -7, 9, 15, 2, -1, 12, -4, 21, 5, 0, 14, -6, 8, 18];

const networkPerformanceRows = buildNetworkPerformanceRows();

export default function ReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE);
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState(DEFAULT_END_DATE);
  const [endTime, setEndTime] = useState("23:59");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedRows = useMemo(
    () => filterReportRows(networkPerformanceRows, startDate, startTime, endDate, endTime),
    [startDate, startTime, endDate, endTime],
  );

  const openReport = () => {
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const closeReport = () => {
    setErrorMessage("");
    setIsModalOpen(false);
  };

  const downloadReport = (format: ExportFormat) => {
    const startTs = `${startDate}T${startTime}:00`;
    const endTs = `${endDate}T${endTime}:59`;

    if (startTs > endTs) {
      setErrorMessage("The start date and time must be before the end date and time.");
      return;
    }

    if (selectedRows.length === 0) {
      setErrorMessage("No completed debriefs are available in the selected date and time range.");
      return;
    }

    setErrorMessage("");
    exportNetworkPerformanceRows(selectedRows, format, startDate, endDate);
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#111827]">
      <OfficeHeader title="MOCK UP" subtitle="Reports" />
      <div className="flex min-w-0">
        <OfficeSidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <section className="rounded-[24px] border border-[#d6dde8] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Reporting suite</p>
                <h1 className="mt-2 text-3xl font-black text-[#10203a]">Reports</h1>
                <p className="mt-3 max-w-4xl text-sm font-bold leading-6 text-[#4b5563]">
                  Select a report, choose the required date and time range, then download the underlying completed debrief data in Excel, CSV or PDF format.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <SummaryCard label="Reports available" value="1" />
                <SummaryCard label="Dummy records" value={String(networkPerformanceRows.length)} />
                <SummaryCard label="Data days" value="5" />
              </div>
            </div>

            <div className="mt-6 rounded-[22px] border border-[#cfd8e3] bg-[#f8fafc] p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#10203a] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                      Operational report
                    </span>
                    <span className="rounded-full bg-[#eaf7ef] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#166534] ring-1 ring-[#86c99a]">
                      Available
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-black text-[#10203a]">Network Performance Report</h2>
                  <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-[#4b5563]">
                    Downloads completed Network debrief records, including planned and actual timings, DTT and ATT performance, vehicles, trailers, drivers, traffic and asset quantities.
                  </p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">
                    Dummy data: 18/07/2026 00:00 to 22/07/2026 23:59
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openReport}
                  className="shrink-0 rounded-xl bg-[#10203a] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-sm transition hover:bg-[#1e3558]"
                >
                  Select dates and download
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                <ReportDetail label="Data source" value="Completed Driver Debriefs" />
                <ReportDetail label="Available formats" value="Excel, CSV and PDF" />
                <ReportDetail label="Current data volume" value={`${networkPerformanceRows.length} completed legs`} />
              </div>
            </div>

            <div className="mt-5 rounded-[18px] border border-dashed border-[#c7d2df] bg-white px-5 py-6 text-center">
              <p className="text-sm font-black text-[#10203a]">Additional reports can be added beneath the Network Performance Report as the reporting suite develops.</p>
            </div>
          </section>
        </main>
      </div>

      {isModalOpen ? (
        <ReportDownloadModal
          startDate={startDate}
          startTime={startTime}
          endDate={endDate}
          endTime={endTime}
          selectedCount={selectedRows.length}
          errorMessage={errorMessage}
          onStartDateChange={setStartDate}
          onStartTimeChange={setStartTime}
          onEndDateChange={setEndDate}
          onEndTimeChange={setEndTime}
          onClose={closeReport}
          onDownload={downloadReport}
        />
      ) : null}
    </div>
  );
}

function ReportDownloadModal({
  startDate,
  startTime,
  endDate,
  endTime,
  selectedCount,
  errorMessage,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onClose,
  onDownload,
}: {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  selectedCount: number;
  errorMessage: string;
  onStartDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onClose: () => void;
  onDownload: (format: ExportFormat) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07101f]/65 p-4" role="dialog" aria-modal="true" aria-labelledby="network-report-title">
      <div className="w-full max-w-3xl overflow-hidden rounded-[24px] border border-[#cfd8e3] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-[#10203a] px-5 py-4 text-white sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Report download</p>
            <h2 id="network-report-title" className="mt-1 text-2xl font-black">Network Performance Report</h2>
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

        <div className="p-5 sm:p-6">
          <p className="text-sm font-bold leading-6 text-[#4b5563]">
            Choose the start and end date and time. The download will contain only completed debrief records whose actual finish time falls inside the selected period.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DateTimePanel
              title="Start"
              date={startDate}
              time={startTime}
              onDateChange={onStartDateChange}
              onTimeChange={onStartTimeChange}
            />
            <DateTimePanel
              title="End"
              date={endDate}
              time={endTime}
              onDateChange={onEndDateChange}
              onTimeChange={onEndTimeChange}
            />
          </div>

          <div className="mt-4 flex flex-col gap-2 rounded-[16px] border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0f3a6d]">Records in selected range</p>
              <p className="mt-1 text-2xl font-black text-[#10203a]">{selectedCount}</p>
            </div>
            <p className="text-xs font-bold text-[#1e3a5f]">Available dummy data covers the five completed days before {formatDateOnly(MOCK_TODAY)}.</p>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-[14px] border border-[#ef4444] bg-[#fff1f2] px-4 py-3 text-sm font-black text-[#991b1b]">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6b7280]">Download data as</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormatButton label="Excel" detail="Spreadsheet data" onClick={() => onDownload("excel")} />
              <FormatButton label="CSV" detail="Comma-separated data" onClick={() => onDownload("csv")} />
              <FormatButton label="PDF" detail="Printable data document" onClick={() => onDownload("pdf")} />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#cfd8e3] bg-white px-5 py-2.5 text-sm font-black text-[#10203a] transition hover:bg-[#f3f6fa]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DateTimePanel({
  title,
  date,
  time,
  onDateChange,
  onTimeChange,
}: {
  title: string;
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}) {
  return (
    <fieldset className="rounded-[18px] border border-[#d7dee9] bg-[#f8fafc] p-4">
      <legend className="px-2 text-sm font-black text-[#10203a]">{title} date and time</legend>
      <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_130px]">
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">Date</span>
          <input
            type="date"
            value={date}
            min={DEFAULT_START_DATE}
            max={DEFAULT_END_DATE}
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-[#cfd8e3] bg-white px-3 text-sm font-black text-[#10203a] outline-none focus:border-[#0f3a6d]"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">Time</span>
          <input
            type="time"
            value={time}
            onChange={(event) => onTimeChange(event.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-[#cfd8e3] bg-white px-3 text-sm font-black text-[#10203a] outline-none focus:border-[#0f3a6d]"
          />
        </label>
      </div>
    </fieldset>
  );
}

function FormatButton({ label, detail, onClick }: { label: string; detail: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[16px] border border-[#cfd8e3] bg-[#f8fafc] px-4 py-4 text-left transition hover:border-[#0f3a6d] hover:bg-[#eff6ff]"
    >
      <span className="block text-lg font-black text-[#10203a]">{label}</span>
      <span className="mt-1 block text-xs font-bold text-[#4b5563]">{detail}</span>
    </button>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[135px] rounded-xl border border-[#d7dee9] bg-[#f8fafc] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#10203a]">{value}</p>
    </div>
  );
}

function ReportDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#d7dee9] bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#10203a]">{value}</p>
    </div>
  );
}

function buildNetworkPerformanceRows(): NetworkPerformanceRow[] {
  const dates = ["2026-07-18", "2026-07-19", "2026-07-20", "2026-07-21", "2026-07-22"];

  return dates.flatMap((dutyDate, dayIndex) =>
    baseLegs.map((leg, legIndex) => {
      const rowIndex = dayIndex * baseLegs.length + legIndex;
      const startOffset = startOffsetPattern[rowIndex];
      const finishOffset = finishOffsetPattern[rowIndex];
      const plannedStartTs = buildTimestamp(dutyDate, leg.plannedStartMinutes);
      const actualStartTs = buildTimestamp(dutyDate, leg.plannedStartMinutes + startOffset);
      const plannedFinishTs = buildTimestamp(dutyDate, leg.plannedStartMinutes + leg.durationMinutes);
      const actualFinishTs = buildTimestamp(dutyDate, leg.plannedStartMinutes + leg.durationMinutes + finishOffset);
      const issueCategory = finishOffset >= 9 ? "Late Arrival" : startOffset >= 9 ? "Late Departure" : "No Issue";
      const outcome = finishOffset >= 21 ? "Part Complete" : "Complete";

      return {
        id: `${dutyDate}-${leg.dutyNumber}-${leg.dutyOrder}`,
        debriefStatus: "Debriefed",
        legState: "Complete",
        dutyDate,
        weekNumber: getWeekNumberFromAprilFirst(dutyDate),
        dutyOrder: leg.dutyOrder,
        dutyNumber: leg.dutyNumber,
        division: "Network",
        driver: drivers[(dayIndex + legIndex) % drivers.length],
        vehicle: vehicles[(dayIndex * 2 + legIndex) % vehicles.length],
        trailerNumber: trailers[(dayIndex * 3 + legIndex) % trailers.length],
        traffic: leg.traffic,
        departureLocation: leg.departureLocation,
        plannedStartTs,
        actualStartTs,
        startDifference: formatDifference(startOffset),
        dtt: getTimingCode(startOffset),
        departureAssets: clampAssetValue(leg.departureAssets + dayIndex * 3 - legIndex),
        finalDestination: leg.finalDestination,
        plannedFinishTs,
        actualFinishTs,
        finishDifference: formatDifference(finishOffset),
        att: getTimingCode(finishOffset),
        arrivalAssets: clampAssetValue(leg.arrivalAssets + dayIndex * 2 + legIndex),
        issueCategory,
        driverNotes: buildDriverNotes(issueCategory, leg.finalDestination),
        outcome,
        debriefedBy: dayIndex % 2 === 0 ? "Peter Finch" : "Sarah Mitchell",
        debriefedAtTs: buildTimestamp(dutyDate, leg.plannedStartMinutes + leg.durationMinutes + finishOffset + 20),
      };
    }),
  );
}

function filterReportRows(
  rows: NetworkPerformanceRow[],
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
) {
  const startTs = `${startDate}T${startTime}:00`;
  const endTs = `${endDate}T${endTime}:59`;

  if (!startDate || !startTime || !endDate || !endTime || startTs > endTs) {
    return [];
  }

  return rows.filter((row) => row.actualFinishTs >= startTs && row.actualFinishTs <= endTs);
}

function exportNetworkPerformanceRows(
  rows: NetworkPerformanceRow[],
  format: ExportFormat,
  startDate: string,
  endDate: string,
) {
  const headers = [
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
    "Traffic",
    "Departure Location",
    "Planned Start",
    "Actual Start",
    "Start Diff hh:mm",
    "DTT",
    "Dep Assets",
    "Final Destination",
    "Planned Finish",
    "Actual Finish",
    "Finish Diff hh:mm",
    "ATT",
    "Arr Assets",
    "Issue Category",
    "Driver Notes",
    "Outcome",
    "Debriefed By",
    "Debriefed At",
  ];

  const exportRows = rows.map((row) => [
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

  exportTabularData({
    format,
    headers,
    rows: exportRows,
    fileName: `network-performance-report-${startDate}-to-${endDate}`,
    title: "Network Performance Report",
  });
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

function formatDateTime(value: string) {
  return `${formatDateOnly(value)} ${value.slice(11, 16)}`;
}

function formatDifference(minutes: number) {
  const sign = minutes > 0 ? "+" : minutes < 0 ? "-" : "";
  const absoluteMinutes = Math.abs(minutes);
  return `${sign}${String(Math.floor(absoluteMinutes / 60)).padStart(2, "0")}:${String(absoluteMinutes % 60).padStart(2, "0")}`;
}

function getTimingCode(minutes: number): TimingCode {
  if (minutes <= -31) {
    return "VE";
  }

  if (minutes <= -9) {
    return "E";
  }

  if (minutes <= 8) {
    return "OT";
  }

  if (minutes <= 30) {
    return "L";
  }

  if (minutes < 120) {
    return "VL";
  }

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

function buildDriverNotes(issueCategory: string, destination: string) {
  if (issueCategory === "Late Departure") {
    return "Driver confirmed a short loading delay before departure. Duty completed and debrief closed.";
  }

  if (issueCategory === "Late Arrival") {
    return `Driver reported traffic congestion approaching ${destination}. Duty completed and timings confirmed.`;
  }

  return "Driver confirmed the leg was completed as planned with no operational issues.";
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

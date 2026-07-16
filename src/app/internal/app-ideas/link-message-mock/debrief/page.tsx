"use client";

import Link from "next/link";
import DriverName from "../../../DriverName";
import { getStoredDriverName, getStoredDriverUserId } from "../../../driverPdaSession";
import { useEffect, useMemo, useState } from "react";

const sidebarItems = [
  { label: "Duty Execution", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Planning", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Vehicle view", icon: "🚛", href: "/internal/app-ideas/link-message-mock" },
  { label: "Trailer view", icon: "▰", href: "/internal/app-ideas/link-message-mock" },
  { label: "Fleet view", icon: "▱", href: "/internal/app-ideas/link-message-mock" },
  {
    label: "Comms",
    icon: "💬",
    href: "/internal/app-ideas/link-message-mock/comms",
    alertCount: 4,
  },
  { label: "Debrief", icon: "🧾", href: "/internal/app-ideas/link-message-mock/debrief", active: true },
  { label: "RHC Team", icon: "RHC", href: "/internal/app-ideas/link-message-mock/rhc-team" },
];

type DebriefStatus = "Awaiting Debrief" | "In Review" | "Debriefed" | "Action Required";
type DebriefOutcome = "Complete" | "Part Complete" | "Failed" | "Cancelled";
type Division = "Letters" | "Network" | "Contractor";

type DebriefRow = {
  id: string;
  dutyNumber: string;
  division: Division;
  dutyDate: string;
  weekNumber: number;
  dutyOrder: number;
  driverName: string;
  userId: string;
  jobTier: string;
  planType: string;
  traffic: string;
  vehicle: string;
  trailerNumber: string;
  trailerType: string;
  startLocation: string;
  finalDestination: string;
  plannedStartTs: string;
  actualStartTs: string;
  plannedEndTs: string;
  actualEndTs: string;
  depAssets: number;
  arrAssets: number;
  issueCategory: string;
  driverNotes: string;
  gpsDeparture: string;
  gpsArrival: string;
  yorkBarcode: string;
  pod318Status: string;
  routeChange: string;
  trailerChange: string;
  vehicleDefect: string;
  rtcBreakdown: string;
  tachoBreak: string;
  fuelPurchased: string;
  sealNumber: string;
  debriefStatus: DebriefStatus;
  debriefOutcome: DebriefOutcome;
  debriefedBy: string;
  debriefedAt: string;
  actionOwner: string;
  followUpDate: string;
  lateReason: string;
  officeNotes: string;
  checks: DebriefChecks;
};

type DebriefChecks = {
  dutyCompleteConfirmed: boolean;
  timingChecked: boolean;
  gpsChecked: boolean;
  assetsChecked: boolean;
  pod318Checked: boolean;
  tachoBreakChecked: boolean;
  vehicleTrailerChecked: boolean;
  followUpRaised: boolean;
};

type DebriefFormState = {
  debriefStatus: DebriefStatus;
  debriefOutcome: DebriefOutcome;
  issueCategory: string;
  driverNotes: string;
  pod318Status: string;
  routeChange: string;
  trailerChange: string;
  vehicleDefect: string;
  rtcBreakdown: string;
  tachoBreak: string;
  fuelPurchased: string;
  sealNumber: string;
  yorkBarcode: string;
  depAssets: number;
  arrAssets: number;
  lateReason: string;
  actionOwner: string;
  followUpDate: string;
  officeNotes: string;
  checks: DebriefChecks;
};

const DEBRIEF_STORAGE_KEY = "mock-driver-debrief-rows-v1";
const baseDateInput = "2026-07-02";

const issueCategories = [
  "No Issue",
  "Late Departure",
  "Late Arrival",
  "Route Change",
  "Different Location",
  "Missing 318 / POD",
  "Trailer Issue",
  "Vehicle Defect",
  "Breakdown",
  "RTC",
  "Load / Asset Issue",
  "Driver Query",
];

const debriefStatuses: DebriefStatus[] = ["Awaiting Debrief", "In Review", "Debriefed", "Action Required"];
const debriefOutcomes: DebriefOutcome[] = ["Complete", "Part Complete", "Failed", "Cancelled"];
const podStatuses = ["Received", "Pending Upload", "Missing", "Not Required", "Query"];

export default function DebriefPage() {
  const [rows, setRows] = useState<DebriefRow[]>(() => buildInitialDebriefRows());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | DebriefStatus>("All");
  const [issueFilter, setIssueFilter] = useState("All");
  const [selectedRow, setSelectedRow] = useState<DebriefRow | null>(null);

  useEffect(() => {
    const refreshRows = window.setTimeout(() => {
      setRows(readDebriefRowsFromStorage());
    }, 0);

    return () => window.clearTimeout(refreshRows);
  }, []);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        query.length === 0 ||
        [
          row.dutyNumber,
          row.division,
          row.driverName,
          row.userId,
          row.vehicle,
          row.trailerNumber,
          row.issueCategory,
          row.startLocation,
          row.finalDestination,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesStatus = statusFilter === "All" || row.debriefStatus === statusFilter;
      const matchesAwaitingTimingException =
        statusFilter !== "Awaiting Debrief" || hasActualTimingException(row);
      const matchesIssue = issueFilter === "All" || row.issueCategory === issueFilter;

      return matchesSearch && matchesStatus && matchesAwaitingTimingException && matchesIssue;
    });
  }, [rows, searchTerm, statusFilter, issueFilter]);

  const awaitingCount = rows.filter((row) => row.debriefStatus === "Awaiting Debrief").length;
  const actionRequiredCount = rows.filter((row) => row.debriefStatus === "Action Required").length;
  const lateCount = rows.filter((row) => isLate(row.plannedEndTs, row.actualEndTs)).length;
  const missing318Count = rows.filter((row) => row.pod318Status === "Missing" || row.pod318Status === "Pending Upload").length;

  function saveRow(nextRow: DebriefRow) {
    const nextRows = rows.map((row) => (row.id === nextRow.id ? nextRow : row));
    setRows(nextRows);
    saveDebriefRowsToStorage(nextRows);
    setSelectedRow(nextRow);
  }

  function resetMockup() {
    const nextRows = buildInitialDebriefRows();
    setRows(nextRows);
    setSelectedRow(null);
    saveDebriefRowsToStorage(nextRows);
  }

  return (
    <main className="min-h-screen bg-[#f4f6f9] font-sans text-[#1d2633]">
      <OfficeHeader title="MOCK UP" subtitle="Driver Debrief" />

      <div className="flex">
        <OfficeSidebar />

        <section className="min-w-0 flex-1 p-4 lg:p-5">
          <section className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e40000] text-3xl text-white">
                  🧾
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#111827]">Driver Debrief Dashboard</h1>
                  <p className="text-sm font-bold text-[#6b7280]">
                    DCT-style mockup for reviewing completed duties and recording office debrief actions.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/internal/app-ideas/link-message-mock"
                  className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-sm font-black text-[#4b5563] no-underline transition hover:border-[#e40000]"
                >
                  ← Back to Duty Execution
                </Link>
                <button
                  type="button"
                  onClick={() => downloadDebriefRowsAsExcel(filteredRows)}
                  className="rounded-lg bg-[#001b3a] px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#0f2f57]"
                >
                  Export To Excel
                </button>
                <button
                  type="button"
                  onClick={resetMockup}
                  className="rounded-lg border border-[#e40000] bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[#e40000] transition hover:bg-[#fff0f0]"
                >
                  Reset Mock Data
                </button>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-[14px] border border-[#cfd8e3] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#d6001c]">
                  Debrief best practice
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#172033]">What the debrief should cover</h2>
                <p className="mt-3 max-w-[980px] text-sm font-bold leading-6 text-[#4b5563]">
                  The debrief should close the loop between planned duty, driver-reported actuals,
                  GPS evidence, paperwork and anything the office needs to chase. The mockup below
                  keeps a structured checklist and a free-text issue box so it does not rely on notes alone.
                </p>
              </div>
              <div className="rounded-lg bg-[#fff0f0] px-4 py-3 text-sm font-black text-[#e40000]">
                Today 02/07/26 • Week 14
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <SummaryCard label="Duties shown" value={String(filteredRows.length)} />
              <SummaryCard label="Awaiting debrief" value={String(awaitingCount)} />
              <SummaryCard label="Action required" value={String(actionRequiredCount)} />
              <SummaryCard label="Late completed" value={String(lateCount)} />
              <SummaryCard label="318 / POD outstanding" value={String(missing318Count)} />
            </div>
          </section>

          <section className="mt-4 rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_0.8fr_auto] xl:items-end">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">
                  Search debrief
                </span>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Duty, driver, vehicle, trailer, issue or location"
                  className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none transition focus:border-[#e40000]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">
                  Debrief status
                </span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as "All" | DebriefStatus)}
                  className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none transition focus:border-[#e40000]"
                >
                  <option>All</option>
                  {debriefStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">
                  Issue category
                </span>
                <select
                  value={issueFilter}
                  onChange={(event) => setIssueFilter(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none transition focus:border-[#e40000]"
                >
                  <option>All</option>
                  {issueCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  setIssueFilter("All");
                }}
                className="h-11 rounded-lg border border-[#d9dee6] bg-[#f8fafc] px-5 text-sm font-black uppercase tracking-[0.12em] text-[#4b5563] transition hover:border-[#e40000]"
              >
                Clear Filters
              </button>
            </div>
          </section>

          <section className="mt-4 rounded-[14px] border border-[#cfd8e3] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[2380px] border-collapse text-[10px] leading-[1.15] text-[#111827]">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <DebriefHeader label="Debrief Action" headerClass="bg-[#cfeefa]" widthClass="w-[105px]" />
                    <DebriefHeader label="Debrief Status" headerClass="bg-[#cfeefa]" widthClass="w-[120px]" />
                    <DebriefHeader label="Duty Date" headerClass="bg-[#cfeefa]" widthClass="w-[88px]" />
                    <DebriefHeader label="Week Number" headerClass="bg-[#cfeefa]" widthClass="w-[78px]" />
                    <DebriefHeader label="Duty Order" headerClass="bg-[#cfeefa]" widthClass="w-[78px]" />
                    <DebriefHeader label="Duty Number" headerClass="bg-[#cfeefa]" widthClass="w-[95px]" />
                    <DebriefHeader label="Division" headerClass="bg-[#cfeefa]" widthClass="w-[95px]" />
                    <DebriefHeader label="Driver" headerClass="bg-[#cfeefa]" widthClass="w-[135px]" />
                    <DebriefHeader label="Vehicle" headerClass="bg-[#cfeefa]" widthClass="w-[92px]" />
                    <DebriefHeader label="Trailer Number" headerClass="bg-[#cfeefa]" widthClass="w-[105px]" />
                    <DebriefHeader label="Traffic" headerClass="bg-[#fde7c7]" widthClass="w-[78px]" />
                    <DebriefHeader label="Departure Location" headerClass="bg-[#f2e8c9]" widthClass="w-[120px]" />
                    <DebriefHeader label="Planned Start" headerClass="bg-[#f2e8c9]" widthClass="w-[125px]" />
                    <DebriefHeader label="Actual Start" headerClass="bg-[#f2e8c9]" widthClass="w-[125px]" />
                    <DebriefHeader label="Start Diff hh:mm" headerClass="bg-[#f2e8c9]" widthClass="w-[90px]" />
                    <DebriefHeader label="Dep Assets" headerClass="bg-[#f2e8c9]" widthClass="w-[80px]" />
                    <DebriefHeader label="Final Destination" headerClass="bg-[#d9f1d5]" widthClass="w-[120px]" />
                    <DebriefHeader label="Planned Finish" headerClass="bg-[#d9f1d5]" widthClass="w-[125px]" />
                    <DebriefHeader label="Actual Finish" headerClass="bg-[#d9f1d5]" widthClass="w-[125px]" />
                    <DebriefHeader label="Finish Diff hh:mm" headerClass="bg-[#d9f1d5]" widthClass="w-[92px]" />
                    <DebriefHeader label="Arr Assets" headerClass="bg-[#d9f1d5]" widthClass="w-[78px]" />
                    <DebriefHeader label="Issue Category" headerClass="bg-[#fde7c7]" widthClass="w-[130px]" />
                    <DebriefHeader label="Driver Notes" headerClass="bg-[#fde7c7]" widthClass="w-[220px]" />
                    <DebriefHeader label="Outcome" headerClass="bg-[#ead5ea]" widthClass="w-[105px]" />
                    <DebriefHeader label="Follow-up Owner" headerClass="bg-[#ead5ea]" widthClass="w-[130px]" />
                    <DebriefHeader label="Follow-up Date" headerClass="bg-[#ead5ea]" widthClass="w-[105px]" />
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={26} className="border border-black px-4 py-10 text-center text-sm font-black text-[#64748b]">
                        No duties match the selected debrief filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, index) => (
                      <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-[#fcfcfc]"}>
                        <td className="border border-black px-1 py-2 text-center font-normal">
                          <button
                            type="button"
                            onClick={() => setSelectedRow(row)}
                            className="rounded-full bg-[#001b3a] px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#0f2f57]"
                          >
                            Debrief
                          </button>
                        </td>
                        <td className={`${getDebriefStatusCellClass(row.debriefStatus)} border border-black px-1 py-2 font-bold text-black`}>
                          {row.debriefStatus}
                        </td>
                        <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{formatDate(row.dutyDate)}</td>
                        <td className="border border-black px-1 py-2 text-center font-normal">{row.weekNumber}</td>
                        <td className="border border-black px-1 py-2 text-center font-black">{row.dutyOrder}</td>
                        <td className="border border-black px-1 py-2 text-center font-black whitespace-nowrap">{row.dutyNumber}</td>
                        <td className="border border-black px-1 py-2 text-center font-black whitespace-nowrap">{row.division}</td>
                        <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.driverName}</td>
                        <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.vehicle}</td>
                        <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.trailerNumber}</td>
                        <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.traffic}</td>
                        <td className="border border-black px-1 py-2 text-center font-normal uppercase break-words">{row.startLocation}</td>
                        <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{formatDateTime(row.plannedStartTs)}</td>
                        <td className={`${getTimingCellClass(row.plannedStartTs, row.actualStartTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                          {formatDateTime(row.actualStartTs)}
                        </td>
                        <td className={`${getTimingCellClass(row.plannedStartTs, row.actualStartTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                          {formatTimeDifference(row.plannedStartTs, row.actualStartTs)}
                        </td>
                        <td className="border border-black px-1 py-2 text-center font-bold whitespace-nowrap">{row.depAssets}</td>
                        <td className="border border-black px-1 py-2 text-center font-normal uppercase break-words">{row.finalDestination}</td>
                        <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{formatDateTime(row.plannedEndTs)}</td>
                        <td className={`${getTimingCellClass(row.plannedEndTs, row.actualEndTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                          {formatDateTime(row.actualEndTs)}
                        </td>
                        <td className={`${getTimingCellClass(row.plannedEndTs, row.actualEndTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                          {formatTimeDifference(row.plannedEndTs, row.actualEndTs)}
                        </td>
                        <td className="border border-black px-1 py-2 text-center font-bold whitespace-nowrap">{row.arrAssets}</td>
                        <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.issueCategory}</td>
                        <td className="border border-black px-1 py-2 font-normal break-words">{row.driverNotes || "-"}</td>
                        <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.debriefOutcome}</td>
                        <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.actionOwner || "-"}</td>
                        <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.followUpDate ? formatDate(row.followUpDate) : "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>

      {selectedRow && (
        <DebriefModal
          row={selectedRow}
          onClose={() => setSelectedRow(null)}
          onSave={saveRow}
        />
      )}
    </main>
  );
}

function DebriefModal({
  row,
  onClose,
  onSave,
}: {
  row: DebriefRow;
  onClose: () => void;
  onSave: (row: DebriefRow) => void;
}) {
  const [form, setForm] = useState<DebriefFormState>(() => buildFormState(row));
  const delayMinutes = getPositiveDelayMinutes(row.plannedEndTs, row.actualEndTs);
  const checklistComplete = Object.values(form.checks).filter(Boolean).length;
  const checklistTotal = Object.values(form.checks).length;

  function updateField<Key extends keyof DebriefFormState>(key: Key, value: DebriefFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateCheck(key: keyof DebriefChecks, value: boolean) {
    setForm((current) => ({
      ...current,
      checks: {
        ...current.checks,
        [key]: value,
      },
    }));
  }

  function saveDebrief() {
    const now = new Date().toISOString();
    onSave({
      ...row,
      debriefStatus: form.debriefStatus,
      debriefOutcome: form.debriefOutcome,
      issueCategory: form.issueCategory,
      driverNotes: form.driverNotes,
      pod318Status: form.pod318Status,
      routeChange: form.routeChange,
      trailerChange: form.trailerChange,
      vehicleDefect: form.vehicleDefect,
      rtcBreakdown: form.rtcBreakdown,
      tachoBreak: form.tachoBreak,
      fuelPurchased: form.fuelPurchased,
      sealNumber: form.sealNumber,
      yorkBarcode: form.yorkBarcode,
      depAssets: form.depAssets,
      arrAssets: form.arrAssets,
      lateReason: form.lateReason,
      actionOwner: form.actionOwner,
      followUpDate: form.followUpDate,
      officeNotes: form.officeNotes,
      checks: form.checks,
      debriefedBy: "Peter Finch",
      debriefedAt: now,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <section className="flex max-h-[calc(100vh-2rem)] w-full max-w-[1450px] flex-col overflow-hidden rounded-2xl border border-[#d9dee6] bg-[#f4f6f9] shadow-2xl">
        <div className="flex flex-col gap-3 border-b border-[#d9dee6] bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Driver debrief</p>
            <h2 className="mt-1 text-2xl font-black text-[#111827]">{row.dutyNumber}</h2>
            <p className="mt-1 text-sm font-bold text-[#6b7280]">
              Review actual timings, issues, GPS, 318/POD evidence and follow-up actions for the completed duty.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveDebrief}
              className="rounded-lg bg-[#001b3a] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#0f2f57]"
            >
              Save Debrief
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-sm font-black text-[#4b5563] transition hover:border-[#e40000]"
            >
              Close
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4">
          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Step 1</p>
                  <h3 className="mt-2 text-2xl font-black text-[#111827]">Duty summary</h3>
                  <p className="mt-1 text-sm font-bold text-[#6b7280]">
                    This mirrors the duty execution data but is shown as a debrief record.
                  </p>
                </div>
                <div className="rounded-lg bg-[#fff0f0] px-4 py-3 text-sm font-black text-[#e40000]">
                  {formatDate(row.dutyDate)} • Week {row.weekNumber}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <ReadOnlyBox label="Duty number" value={row.dutyNumber} />
                <ReadOnlyBox label="Duty order" value={String(row.dutyOrder)} />
                <ReadOnlyBox label="Division" value={row.division} />
                <ReadOnlyBox label="Driver" value={row.driverName} />
                <ReadOnlyBox label="Vehicle" value={row.vehicle} />
                <ReadOnlyBox label="Trailer" value={row.trailerNumber} />
                <ReadOnlyBox label="Start location" value={row.startLocation} />
                <ReadOnlyBox label="Final destination" value={row.finalDestination} />
                <ReadOnlyBox label="Planned start" value={formatDateTime(row.plannedStartTs)} />
                <ReadOnlyBox label="Actual start" value={formatDateTime(row.actualStartTs)} />
                <ReadOnlyBox label="Planned finish" value={formatDateTime(row.plannedEndTs)} />
                <ReadOnlyBox label="Actual finish" value={formatDateTime(row.actualEndTs)} />
                <ReadOnlyBox label="Start difference" value={formatTimeDifference(row.plannedStartTs, row.actualStartTs)} />
                <ReadOnlyBox label="Finish difference" value={formatTimeDifference(row.plannedEndTs, row.actualEndTs)} />
              </div>
            </div>

            <div className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Debrief score</p>
              <h3 className="mt-2 text-2xl font-black text-[#111827]">Checklist progress</h3>
              <p className="mt-1 text-sm font-bold leading-6 text-[#6b7280]">
                {checklistComplete} of {checklistTotal} debrief checks marked as complete.
              </p>
              <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#e5e7eb]">
                <div
                  className="h-full bg-[#157347] transition-all"
                  style={{ width: `${Math.round((checklistComplete / checklistTotal) * 100)}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <SummaryCard label="Finish delay" value={delayMinutes > 0 ? `${delayMinutes} mins` : "On time"} />
                <SummaryCard label="Current status" value={form.debriefStatus} />
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Step 2</p>
            <h3 className="mt-2 text-2xl font-black text-[#111827]">Debrief decision</h3>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SelectBox label="Debrief status" value={form.debriefStatus} options={debriefStatuses} onChange={(value) => updateField("debriefStatus", value as DebriefStatus)} />
              <SelectBox label="Outcome" value={form.debriefOutcome} options={debriefOutcomes} onChange={(value) => updateField("debriefOutcome", value as DebriefOutcome)} />
              <SelectBox label="Issue category" value={form.issueCategory} options={issueCategories} onChange={(value) => updateField("issueCategory", value)} />
              <SelectBox label="318 / POD status" value={form.pod318Status} options={podStatuses} onChange={(value) => updateField("pod318Status", value)} />
              <NumberBox label="Departure assets" value={form.depAssets} onChange={(value) => updateField("depAssets", value)} />
              <NumberBox label="Arrival assets" value={form.arrAssets} onChange={(value) => updateField("arrAssets", value)} />
              <TextBox label="Seal number" value={form.sealNumber} onChange={(value) => updateField("sealNumber", value)} />
              <TextBox label="York barcode" value={form.yorkBarcode} onChange={(value) => updateField("yorkBarcode", value)} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <TextAreaBox
                label="Late / timing reason"
                value={form.lateReason}
                onChange={(value) => updateField("lateReason", value)}
                placeholder="Explain delay reason, early departure, waiting time, missing driver, site delay etc."
              />
              <TextAreaBox
                label="Driver issue notes"
                value={form.driverNotes}
                onChange={(value) => updateField("driverNotes", value)}
                placeholder="Free text from driver debrief. Keep the structured issue category as well."
              />
            </div>
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-2">
            <div className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Step 3</p>
              <h3 className="mt-2 text-2xl font-black text-[#111827]">Structured checks</h3>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <CheckBox label="Duty complete confirmed" checked={form.checks.dutyCompleteConfirmed} onChange={(value) => updateCheck("dutyCompleteConfirmed", value)} />
                <CheckBox label="Timing checked" checked={form.checks.timingChecked} onChange={(value) => updateCheck("timingChecked", value)} />
                <CheckBox label="GPS/geofence checked" checked={form.checks.gpsChecked} onChange={(value) => updateCheck("gpsChecked", value)} />
                <CheckBox label="Assets and seals checked" checked={form.checks.assetsChecked} onChange={(value) => updateCheck("assetsChecked", value)} />
                <CheckBox label="318/POD checked" checked={form.checks.pod318Checked} onChange={(value) => updateCheck("pod318Checked", value)} />
                <CheckBox label="Tacho/break checked" checked={form.checks.tachoBreakChecked} onChange={(value) => updateCheck("tachoBreakChecked", value)} />
                <CheckBox label="Vehicle/trailer checked" checked={form.checks.vehicleTrailerChecked} onChange={(value) => updateCheck("vehicleTrailerChecked", value)} />
                <CheckBox label="Follow-up raised if needed" checked={form.checks.followUpRaised} onChange={(value) => updateCheck("followUpRaised", value)} />
              </div>
            </div>

            <div className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Step 4</p>
              <h3 className="mt-2 text-2xl font-black text-[#111827]">Exceptions and follow-up</h3>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <TextBox label="Route change" value={form.routeChange} onChange={(value) => updateField("routeChange", value)} />
                <TextBox label="Trailer change" value={form.trailerChange} onChange={(value) => updateField("trailerChange", value)} />
                <TextBox label="Vehicle defect" value={form.vehicleDefect} onChange={(value) => updateField("vehicleDefect", value)} />
                <TextBox label="Breakdown / RTC" value={form.rtcBreakdown} onChange={(value) => updateField("rtcBreakdown", value)} />
                <TextBox label="Tacho / breaks" value={form.tachoBreak} onChange={(value) => updateField("tachoBreak", value)} />
                <TextBox label="Fuel / AdBlue" value={form.fuelPurchased} onChange={(value) => updateField("fuelPurchased", value)} />
                <TextBox label="Action owner" value={form.actionOwner} onChange={(value) => updateField("actionOwner", value)} />
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">Follow-up date</span>
                  <input
                    type="date"
                    value={form.followUpDate}
                    onChange={(event) => updateField("followUpDate", event.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none transition focus:border-[#e40000]"
                  />
                </label>
              </div>
              <div className="mt-3">
                <TextAreaBox
                  label="Office debrief notes"
                  value={form.officeNotes}
                  onChange={(value) => updateField("officeNotes", value)}
                  placeholder="What the debriefer agreed, what needs chasing, and who owns the next action."
                />
              </div>
            </div>
          </section>

          <section className="mt-4 flex flex-col gap-3 rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm font-bold leading-6 text-[#4b5563]">
              Saving this debrief updates the mock table only. It is stored locally in the browser so the demo can show status changes without a backend.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveDebrief}
                className="rounded-lg bg-[#001b3a] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#0f2f57]"
              >
                Save Debrief
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#ccd5e2] bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#4b5563] transition hover:border-[#e40000]"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      </section>
    </div>
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
          <p className="text-base font-black"><DriverName /></p>
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
      <button
        type="button"
        className="mt-auto flex h-[64px] items-center justify-center border-t border-white/10 text-3xl text-white/80 transition hover:bg-[#11171d] hover:text-white"
        aria-label="Collapse sidebar"
      >
        »
      </button>
    </aside>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#d6dee8] bg-[#f8fafc] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#64748b]">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-[#172033]">{value || "-"}</p>
    </div>
  );
}

function DebriefHeader({
  label,
  headerClass,
  widthClass,
}: {
  label: string;
  headerClass: string;
  widthClass: string;
}) {
  return (
    <th className={`${headerClass} ${widthClass} border border-black px-1 py-2 align-bottom text-left font-normal text-black`}>
      <div className="whitespace-normal break-words">{label}</div>
    </th>
  );
}

function ReadOnlyBox({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">{label}</span>
      <input
        value={value}
        readOnly
        className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-[#f8fafc] px-3 text-sm font-black text-[#111827] outline-none"
      />
    </label>
  );
}

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none transition focus:border-[#e40000]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function TextBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none transition focus:border-[#e40000]"
      />
    </label>
  );
}

function NumberBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none transition focus:border-[#e40000]"
      />
    </label>
  );
}

function TextAreaBox({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 min-h-[110px] w-full rounded-lg border border-[#ccd5e2] bg-white px-3 py-3 text-sm font-bold leading-6 text-[#111827] outline-none transition focus:border-[#e40000]"
      />
    </label>
  );
}

function CheckBox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-[#d9dee6] bg-[#f8fafc] px-3 py-3 text-sm font-black text-[#374151]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}

function buildInitialDebriefRows(): DebriefRow[] {
  const drivers = [
    getStoredDriverName(),
    "Peter Finch",
    "John Smith",
    "Sarah Jones",
    "Mark Wilson",
    "David Roberts",
    "Helen Brown",
    "Chris Taylor",
  ];
  const vehicles = ["PE68UHD", "PN21XHD", "MX70RHA", "DK19RHC", "YX72NWH", "PK68MTE"];
  const issuePattern = [
    "No Issue",
    "Late Departure",
    "Late Arrival",
    "Route Change",
    "Missing 318 / POD",
    "Trailer Issue",
    "Different Location",
    "Vehicle Defect",
  ];
  const statusPattern: DebriefStatus[] = [
    "Awaiting Debrief",
    "Awaiting Debrief",
    "In Review",
    "Action Required",
    "Debriefed",
  ];

  return Array.from({ length: 30 }, (_, index) => {
    const dutyNumber = `NWH${String(index + 1).padStart(3, "0")}`;
    const dutyDate = addDaysToInputDate(baseDateInput, Math.floor(index / 10));
    const startMinutes = 75 + ((index * 47) % 910);
    const durationMinutes = 280 + ((index * 35) % 310);
    const actualStartDelay = [-6, 0, 8, 17, 28, -3, 12, 35][index % 8];
    const actualEndDelay = [-4, 3, 15, 31, 48, 0, 22, 55][index % 8];
    const plannedStartTs = buildTimestamp(dutyDate, startMinutes);
    const actualStartTs = buildTimestamp(dutyDate, startMinutes + actualStartDelay);
    const plannedEndTs = buildTimestamp(dutyDate, startMinutes + durationMinutes);
    const actualEndTs = buildTimestamp(dutyDate, startMinutes + durationMinutes + actualEndDelay);
    const issueCategory = issuePattern[index % issuePattern.length];
    const actionRequired = issueCategory !== "No Issue" && index % 3 === 0;
    const debriefStatus = actionRequired ? "Action Required" : statusPattern[index % statusPattern.length];
    const pod318Status = index % 9 === 0 ? "Missing" : index % 6 === 0 ? "Pending Upload" : "Received";
    const division = getMockDivision(index);
    const dutyOrder = getMockDutyOrder(index);
    const driverName = drivers[index % drivers.length];

    return {
      id: dutyNumber,
      dutyNumber,
      division,
      dutyDate,
      weekNumber: 14 + Math.floor(index / 10),
      dutyOrder,
      driverName,
      userId: index % drivers.length === 0
        ? getStoredDriverUserId()
        : `${driverName.toLowerCase().replaceAll(" ", ".")}@mock.driver`,
      jobTier: "Tier 1",
      planType: index % 7 === 0 ? "FLEX" : "BAU",
      traffic: "NWH",
      vehicle: vehicles[index % vehicles.length],
      trailerNumber: String(7338000 + index + 1),
      trailerType: index % 4 === 0 ? "DD95" : "DD92",
      startLocation: index % 5 === 0 ? "North West Hub" : "NWH Outward Dock",
      finalDestination: index % 4 === 0 ? "Manchester VOC" : index % 4 === 1 ? "Preston MC" : index % 4 === 2 ? "Warrington VOC" : "North West Hub",
      plannedStartTs,
      actualStartTs,
      plannedEndTs,
      actualEndTs,
      depAssets: 34 + ((index * 9) % 55),
      arrAssets: 34 + ((index * 7) % 55),
      issueCategory,
      driverNotes: buildDriverNotes(issueCategory),
      gpsDeparture: `${index % 2 === 0 ? "NWH Gate 2" : "NWH Dock 14"} • ${formatDateTime(actualStartTs)}`,
      gpsArrival: `${index % 4 === 0 ? "Manchester VOC" : "North West Hub"} • ${formatDateTime(actualEndTs)}`,
      yorkBarcode: `YRK${String(60000 + index * 37).padStart(6, "0")}`,
      pod318Status,
      routeChange: issueCategory === "Route Change" ? "Driver reported diversion due to road closure." : "No route change reported.",
      trailerChange: issueCategory === "Trailer Issue" ? "Trailer swapped before departure." : "No trailer change reported.",
      vehicleDefect: issueCategory === "Vehicle Defect" ? "Amber defect reported, vehicle remained roadworthy." : "No vehicle defect reported.",
      rtcBreakdown: issueCategory === "Breakdown" || issueCategory === "RTC" ? "Escalated to transport office." : "No breakdown or RTC reported.",
      tachoBreak: index % 6 === 0 ? "Break queried by driver." : "No tacho issue reported.",
      fuelPurchased: index % 8 === 0 ? "Fuel purchased at approved site." : "No fuel purchase reported.",
      sealNumber: `SEAL${String(9000 + index * 11)}`,
      debriefStatus,
      debriefOutcome: issueCategory === "No Issue" ? "Complete" : index % 5 === 0 ? "Part Complete" : "Complete",
      debriefedBy: debriefStatus === "Debriefed" ? "Peter Finch" : "",
      debriefedAt: debriefStatus === "Debriefed" ? new Date().toISOString() : "",
      actionOwner: actionRequired ? "Transport Office" : "",
      followUpDate: actionRequired ? addDaysToInputDate(dutyDate, 1) : "",
      lateReason: actualEndDelay > 10 ? buildLateReason(issueCategory) : "On time or within tolerance.",
      officeNotes: actionRequired ? "Requires office review before the duty can be fully closed." : "",
      checks: buildInitialChecks(debriefStatus, pod318Status),
    };
  });
}

function getMockDutyOrder(index: number) {
  return ((index * 5) % 8) + 1;
}

function getMockDivision(index: number): Division {
  if (index === 4) {
    return "Letters";
  }

  if (index === 9) {
    return "Contractor";
  }

  return "Network";
}

function buildInitialChecks(status: DebriefStatus, pod318Status: string): DebriefChecks {
  const completed = status === "Debriefed";

  return {
    dutyCompleteConfirmed: completed,
    timingChecked: completed,
    gpsChecked: completed,
    assetsChecked: completed,
    pod318Checked: completed && pod318Status === "Received",
    tachoBreakChecked: completed,
    vehicleTrailerChecked: completed,
    followUpRaised: status === "Action Required",
  };
}

function buildDriverNotes(issueCategory: string) {
  if (issueCategory === "No Issue") {
    return "Driver confirmed duty completed as planned.";
  }

  if (issueCategory === "Late Departure") {
    return "Driver reported waiting for trailer release at origin.";
  }

  if (issueCategory === "Late Arrival") {
    return "Driver reported congestion on route and late arrival at destination.";
  }

  if (issueCategory === "Route Change") {
    return "Driver used alternative route after office instruction.";
  }

  if (issueCategory === "Missing 318 / POD") {
    return "Driver completed the duty but 318/POD still needs attaching.";
  }

  if (issueCategory === "Trailer Issue") {
    return "Driver reported trailer issue and completed a trailer swap.";
  }

  if (issueCategory === "Different Location") {
    return "Driver stated destination location differed from planned instruction.";
  }

  return "Driver reported an exception that needs office review.";
}

function buildLateReason(issueCategory: string) {
  if (issueCategory === "No Issue") {
    return "Minor timing difference only.";
  }

  return `${issueCategory} caused the timing exception. Office debriefer to validate evidence and notes.`;
}

function buildFormState(row: DebriefRow): DebriefFormState {
  return {
    debriefStatus: row.debriefStatus,
    debriefOutcome: row.debriefOutcome,
    issueCategory: row.issueCategory,
    driverNotes: row.driverNotes,
    pod318Status: row.pod318Status,
    routeChange: row.routeChange,
    trailerChange: row.trailerChange,
    vehicleDefect: row.vehicleDefect,
    rtcBreakdown: row.rtcBreakdown,
    tachoBreak: row.tachoBreak,
    fuelPurchased: row.fuelPurchased,
    sealNumber: row.sealNumber,
    yorkBarcode: row.yorkBarcode,
    depAssets: row.depAssets,
    arrAssets: row.arrAssets,
    lateReason: row.lateReason,
    actionOwner: row.actionOwner,
    followUpDate: row.followUpDate,
    officeNotes: row.officeNotes,
    checks: row.checks,
  };
}

function readDebriefRowsFromStorage() {
  if (typeof window === "undefined") {
    return buildInitialDebriefRows();
  }

  try {
    const raw = window.localStorage.getItem(DEBRIEF_STORAGE_KEY);

    if (!raw) {
      return buildInitialDebriefRows();
    }

    const parsedRows = JSON.parse(raw) as DebriefRow[];
    return parsedRows.map((row, index) => ({
      ...row,
      division: row.division ?? getMockDivision(index),
      dutyOrder: row.dutyOrder ?? getMockDutyOrder(index),
      driverName: index % 8 === 0 ? getStoredDriverName() : row.driverName,
      userId: index % 8 === 0 ? getStoredDriverUserId() : row.userId,
    }));
  } catch {
    return buildInitialDebriefRows();
  }
}

function saveDebriefRowsToStorage(rows: DebriefRow[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEBRIEF_STORAGE_KEY, JSON.stringify(rows));
}

function buildTimestamp(dateInput: string, minutesFromStart: number) {
  const date = parseInputDate(dateInput);
  date.setMinutes(date.getMinutes() + minutesFromStart);
  return date.toISOString();
}

function addDaysToInputDate(dateInput: string, days: number) {
  const date = parseInputDate(dateInput);
  date.setDate(date.getDate() + days);
  return formatDateInput(date);
}

function parseInputDate(dateInput: string) {
  const [year, month, day] = dateInput.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateInput: string) {
  const date = parseInputDate(dateInput);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function formatDateTime(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatTimeDifference(plannedTs: string, actualTs: string) {
  const planned = new Date(plannedTs).getTime();
  const actual = new Date(actualTs).getTime();

  if (Number.isNaN(planned) || Number.isNaN(actual)) {
    return "-";
  }

  const diffMinutes = Math.round((actual - planned) / 60000);
  const sign = diffMinutes > 0 ? "+" : diffMinutes < 0 ? "-" : "";
  const absoluteMinutes = Math.abs(diffMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getPositiveDelayMinutes(plannedTs: string, actualTs: string) {
  const planned = new Date(plannedTs).getTime();
  const actual = new Date(actualTs).getTime();

  if (Number.isNaN(planned) || Number.isNaN(actual) || actual <= planned) {
    return 0;
  }

  return Math.round((actual - planned) / 60000);
}

function hasActualTimingException(row: DebriefRow) {
  return isLate(row.plannedStartTs, row.actualStartTs) || isLate(row.plannedEndTs, row.actualEndTs);
}

function isLate(plannedTs: string, actualTs: string) {
  return getPositiveDelayMinutes(plannedTs, actualTs) > 0;
}

function getTimingCellClass(plannedTs: string, actualTs: string) {
  const diff = getPositiveDelayMinutes(plannedTs, actualTs);

  if (diff > 0) {
    return "bg-[#fecaca] text-[#7f1d1d]";
  }

  return "bg-[#d9f7e5] text-[#166534]";
}

function getDebriefStatusCellClass(status: DebriefStatus) {
  if (status === "Debriefed") {
    return "bg-[#d9f7e5]";
  }

  if (status === "Action Required") {
    return "bg-[#fecaca]";
  }

  if (status === "In Review") {
    return "bg-[#ffe9c8]";
  }

  return "bg-[#dbeafe]";
}

function downloadDebriefRowsAsExcel(rows: DebriefRow[]) {
  if (typeof window === "undefined" || rows.length === 0) {
    return;
  }

  const headers = [
    "Debrief Status",
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
    "Dep Assets",
    "Final Destination",
    "Planned Finish",
    "Actual Finish",
    "Finish Diff hh:mm",
    "Arr Assets",
    "Issue Category",
    "Driver Notes",
    "Outcome",
    "Follow-up Owner",
    "Follow-up Date",
    "Late Reason",
    "Office Notes",
  ];

  const exportRows = rows.map((row) => [
    row.debriefStatus,
    formatDate(row.dutyDate),
    row.weekNumber,
    row.dutyOrder,
    row.dutyNumber,
    row.division,
    row.driverName,
    row.vehicle,
    row.trailerNumber,
    row.traffic,
    row.startLocation,
    formatDateTime(row.plannedStartTs),
    formatDateTime(row.actualStartTs),
    formatTimeDifference(row.plannedStartTs, row.actualStartTs),
    row.depAssets,
    row.finalDestination,
    formatDateTime(row.plannedEndTs),
    formatDateTime(row.actualEndTs),
    formatTimeDifference(row.plannedEndTs, row.actualEndTs),
    row.arrAssets,
    row.issueCategory,
    row.driverNotes,
    row.debriefOutcome,
    row.actionOwner,
    row.followUpDate ? formatDate(row.followUpDate) : "",
    row.lateReason,
    row.officeNotes,
  ]);

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; }
    th, td { border: 1px solid #000; padding: 6px; vertical-align: middle; }
    th { background: #cfeefa; font-weight: bold; }
  </style>
</head>
<body>
  <table>
    <thead><tr>${headers.map((header) => `<th>${escapeExcelHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>
      ${exportRows
        .map((exportRow) => `<tr>${exportRow.map((cell) => `<td>${escapeExcelHtml(String(cell))}</td>`).join("")}</tr>`)
        .join("")}
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `driver-debrief-mockup-${today}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function escapeExcelHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

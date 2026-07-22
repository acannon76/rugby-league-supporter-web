"use client";

import Link from "next/link";
import DriverName from "../../../../DriverName";
import { useEffect, useMemo, useState } from "react";
import ExportDataMenu from "../../../ExportDataMenu";
import { exportTabularData, type ExportFormat } from "../../../exportData";

type CommsSource = "RTC" | "Breakdown" | "Messaging" | "PMT Confirmation";
type Priority = "Critical" | "High" | "Normal";

type MessageThreadEntry = {
  id: string;
  sender: "Driver" | "Office" | "System" | "M5 Workshops";
  senderName: string;
  message: string;
  timestamp: string;
  priority: Priority;
  direction: "Driver to office" | "Office to driver" | "System" | "Workshop";
};
type ActionType =
  | "Reply sent"
  | "Marked actioned"
  | "Reply and actioned"
  | "Message driver and OK to continue"
  | "VOR vehicle / M5 workshops";

type CommsHistoryRecord = {
  id: string;
  source: CommsSource;
  duty: string;
  driver: string;
  vehicle: string;
  trailer: string;
  priority: Priority;
  received: string;
  receivedDate: string;
  title: string;
  summary: string;
  manager: string;
  action: ActionType;
  replyToDriver: string;
  actionedAt: string;
  finalStatus: "Actioned";
  driverMessage: string;
  replyPriority?: Priority;
  detailSummary?: string;
  messageThread?: MessageThreadEntry[];
  messageThreadSummary?: string;
};

const COMMS_HISTORY_STORAGE_KEY = "link-message-comms-history";
const COMMS_OPEN_STORAGE_KEY = "link-message-comms-open-items";

const sidebarItems = [
  { label: "Duty Execution", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Planning", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Vehicle view", icon: "🚛", href: "/internal/app-ideas/link-message-mock" },
  { label: "Trailer view", icon: "▰", href: "/internal/app-ideas/link-message-mock" },
  { label: "Fleet view", icon: "▱", href: "/internal/app-ideas/link-message-mock" },
  { label: "Comms", icon: "💬", href: "/internal/app-ideas/link-message-mock/comms", active: true },
  { label: "Debrief", icon: "🧾", href: "/internal/app-ideas/link-message-mock/debrief" },
  { label: "RHC Team", icon: "RHC", href: "/internal/app-ideas/link-message-mock/rhc-team" },
  { label: "Live Tracking", icon: "GPS", href: "/internal/app-ideas/link-message-mock/live-tracking" },
  { label: "Reports", icon: "REP", href: "/internal/app-ideas/link-message-mock/reports" },
  { label: "A&D Dashboard", icon: "A&D", href: "/internal/app-ideas/link-message-mock/arrivals-departures" },
];

export default function CommsHistoryPage() {
  const [records, setRecords] = useState<CommsHistoryRecord[]>([]);
  const [sourceFilter, setSourceFilter] = useState<CommsSource | "All">("All");
  const [dutyFilter, setDutyFilter] = useState("");
  const [managerFilter, setManagerFilter] = useState("");

  useEffect(() => {
    setRecords(readHistoryRecords());
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSource = sourceFilter === "All" || record.source === sourceFilter;
      const matchesDuty = record.duty.toLowerCase().includes(dutyFilter.trim().toLowerCase());
      const matchesManager = record.manager.toLowerCase().includes(managerFilter.trim().toLowerCase());
      return matchesSource && matchesDuty && matchesManager;
    });
  }, [records, sourceFilter, dutyFilter, managerFilter]);

  function exportHistory(format: ExportFormat) {
    const headers = [
      "Source",
      "Duty",
      "Driver",
      "Vehicle",
      "Trailer",
      "Priority",
      "Received Date",
      "Received Time",
      "Title",
      "Summary",
      "Manager",
      "Action",
      "Reply To Driver",
      "Reply Priority",
      "Actioned At",
      "Final Status",
      "Detail Summary",
      "Driver Message",
      "Full Message Thread",
    ];

    const rows = filteredRecords.map((record) => [
      record.source,
      record.duty,
      record.driver,
      record.vehicle,
      record.trailer,
      record.priority,
      record.receivedDate,
      record.received,
      record.title,
      record.summary,
      record.manager,
      record.action,
      record.replyToDriver,
      record.replyPriority || record.priority,
      record.actionedAt,
      record.finalStatus,
      record.detailSummary || record.summary,
      record.driverMessage,
      record.messageThreadSummary || buildThreadSummary(record),
    ]);

    exportTabularData({
      format,
      headers,
      rows,
      fileName: `comms-history-${new Date().toISOString().slice(0, 10)}`,
      title: "Comms History Data",
    });
  }

  function resetMockHistory() {
    localStorage.removeItem(COMMS_HISTORY_STORAGE_KEY);
    localStorage.removeItem(COMMS_OPEN_STORAGE_KEY);
    setRecords([]);
  }

  return (
    <main className="min-h-screen bg-[#f4f6f9] font-sans text-[#1d2633]">
      <OfficeHeader title="MOCK UP" subtitle="Comms History" />

      <div className="flex">
        <OfficeSidebar />

        <section className="min-w-0 flex-1 p-4 lg:p-5">
          <section className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e40000] text-lg font-black text-white">
                  HIS
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#111827]">Comms History</h1>
                  <p className="text-sm font-bold text-[#6b7280]">
                    Resolved driver communications, manager actions, replies and timestamps.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={resetMockHistory}
                  className="rounded-lg border border-[#e40000] bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[#e40000] transition hover:bg-[#fff0f0]"
                >
                  Mock Reset
                </button>
                <ExportDataMenu
                  disabled={filteredRecords.length === 0}
                  onExport={exportHistory}
                  buttonClassName="rounded-lg border border-[#111827] bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[#111827] transition hover:border-[#e40000] hover:text-[#e40000] disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:text-[#94a3b8]"
                />
                <Link
                  href="/internal/app-ideas/link-message-mock/comms"
                  className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-sm font-black text-[#4b5563] no-underline transition hover:border-[#e40000]"
                >
                  ← Back to Comms
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-md border border-[#f5a400] bg-[#fff7e6] p-4 shadow-sm">
            <p className="text-sm font-black leading-6 text-[#7a4b00]">
              Mock retention warning: comms history is stored in this browser only and should be treated as a 4-week local history view. Clearing browser storage or changing device will remove the mock history.
            </p>
          </section>

          <section className="mt-4 rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Filters</p>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">Source</span>
                <select
                  value={sourceFilter}
                  onChange={(event) => setSourceFilter(event.target.value as CommsSource | "All")}
                  className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
                >
                  <option value="All">All sources</option>
                  <option value="RTC">RTC</option>
                  <option value="Breakdown">Breakdown</option>
                  <option value="Messaging">Messaging</option>
                  <option value="PMT Confirmation">PMT Confirmation</option>
                </select>
              </label>

              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">Duty</span>
                <input
                  value={dutyFilter}
                  onChange={(event) => setDutyFilter(event.target.value)}
                  placeholder="Example: NWH426"
                  className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
                />
              </label>

              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">Manager</span>
                <input
                  value={managerFilter}
                  onChange={(event) => setManagerFilter(event.target.value)}
                  placeholder="Example: Harry Smith"
                  className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
                />
              </label>
            </div>
          </section>

          <section className="mt-4 overflow-hidden rounded-md border border-[#d9dee6] bg-white shadow-sm">
            <div className="border-b border-[#d9dee6] bg-[#f8fafc] px-4 py-3">
              <h2 className="text-lg font-black text-[#111827]">Resolved communications table</h2>
              <p className="text-sm font-bold text-[#6b7280]">
                {filteredRecords.length} resolved item{filteredRecords.length === 1 ? "" : "s"} currently shown.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[2600px] border-collapse text-left text-sm">
                <thead className="bg-white text-xs uppercase tracking-[0.12em] text-[#6b7280]">
                  <tr>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Source</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Duty</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Driver</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Vehicle</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Trailer</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Priority</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Received</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Title</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Manager</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Action</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Reply To Driver</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Reply Priority</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Actioned At</th>
                    <th className="border-b border-[#d9dee6] px-4 py-3">Final Status</th>
                    <th className="min-w-[440px] border-b border-[#d9dee6] px-4 py-3">Details</th>
                    <th className="min-w-[420px] border-b border-[#d9dee6] px-4 py-3">Driver Message</th>
                    <th className="min-w-[640px] border-b border-[#d9dee6] px-4 py-3">Full Message Thread</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="bg-white transition hover:bg-[#fff0f0]">
                        <td className="border-b border-[#edf0f4] px-4 py-3 font-black text-[#111827]">{record.source}</td>
                        <td className="border-b border-[#edf0f4] px-4 py-3 font-black text-[#374151]">{record.duty}</td>
                        <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#374151]">{record.driver}</td>
                        <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#374151]">{record.vehicle}</td>
                        <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#374151]">{record.trailer}</td>
                        <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#374151]">{record.priority}</td>
                        <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#374151]">{record.receivedDate} {record.received}</td>
                        <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#374151]">{record.title}</td>
                        <td className="border-b border-[#edf0f4] px-4 py-3 font-black text-[#374151]">{record.manager}</td>
                        <td className="border-b border-[#edf0f4] px-4 py-3 font-black text-[#374151]">{record.action}</td>
                        <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#4b5563]">{record.replyToDriver}</td>
                        <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#374151]">{record.replyPriority || record.priority}</td>
                        <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#374151]">{record.actionedAt}</td>
                        <td className="border-b border-[#edf0f4] px-4 py-3"><span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-xs font-black text-[#157347]">{record.finalStatus}</span></td>
                        <td className="min-w-[440px] whitespace-normal border-b border-[#edf0f4] px-4 py-3 font-bold leading-6 text-[#4b5563]">{record.detailSummary || record.summary}</td>
                        <td className="min-w-[420px] whitespace-normal border-b border-[#edf0f4] px-4 py-3 font-bold leading-6 text-[#4b5563]">{record.driverMessage}</td>
                        <td className="min-w-[640px] whitespace-pre-line border-b border-[#edf0f4] px-4 py-3 font-bold leading-6 text-[#4b5563]">{record.messageThreadSummary || buildThreadSummary(record)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={17} className="px-4 py-10 text-center text-base font-black text-[#6b7280]">
                        No resolved communications are in the mock history yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </main>
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
          } ${"active" in item && item.active ? "bg-[#11171d] text-white" : "text-white/75 hover:bg-[#11171d] hover:text-white"}`}
        >
          <span>{item.icon}</span>
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

function buildThreadSummary(record: CommsHistoryRecord) {
  if (record.messageThread && record.messageThread.length > 0) {
    return record.messageThread
      .map((entry) => `${entry.timestamp} | ${entry.senderName} | ${entry.priority} | ${entry.message}`)
      .join("\n");
  }

  return `${record.receivedDate} ${record.received} | ${record.driver} | ${record.priority} | ${record.summary}\n${record.actionedAt} | ${record.manager} | ${record.replyPriority || record.priority} | ${record.replyToDriver}`;
}

function readHistoryRecords(): CommsHistoryRecord[] {
  try {
    const rawHistory = localStorage.getItem(COMMS_HISTORY_STORAGE_KEY);
    if (!rawHistory) {
      return [];
    }

    const parsed = JSON.parse(rawHistory);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

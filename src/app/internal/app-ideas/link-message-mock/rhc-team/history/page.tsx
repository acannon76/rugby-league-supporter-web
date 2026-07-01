"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const RHC_HISTORY_STORAGE_KEY = "mock-rhc-team-history";

type RhcOrder = {
  id: string;
  job?: string;
  rowChecksum?: string;
  modifiedOn?: string;
  orderType: string;
  duty: string;
  jobTier?: string;
  account?: string;
  proposedRateCategory?: string;
  proposedRate?: string;
  date: string;
  day: string;
  week: number;
  startDateTime: string;
  endDateTime: string;
  totalTime: string;
  startLocation: string;
  endLocation: string;
  traffic: string;
  planType: string;
  dutySchedule: string;
  miles: number;
  asDirected: string;
  admName: string;
  rmPfw: string;
  requestedBy: string;
  billingCentre: string;
  siteContactNumber: string;
  primaryReason: string;
  secondReason: string;
  region: string;
  tier: string;
  kit: string;
  dvsRequired?: string;
  rmResponsiblePersonEmail?: string;
  reason: string;
  required: string;
  notes: string;
  sendPortal: boolean;
  send318: boolean;
  submittedAt?: string;
};

const rhcJobTemplateColumns: {
  header: string;
  value: (order: RhcOrder) => string | number | boolean | undefined;
}[] = [
  { header: "(Do Not Modify) Job", value: (order) => order.job },
  { header: "(Do Not Modify) Row Checksum", value: (order) => order.rowChecksum },
  { header: "(Do Not Modify) Modified On", value: (order) => order.modifiedOn },
  { header: "Duty Number", value: (order) => order.duty },
  { header: "JobTier", value: (order) => order.jobTier ?? order.tier },
  { header: "Account", value: (order) => order.account ?? order.billingCentre },
  { header: "Proposed Rate Category For Preferred Haulier", value: (order) => order.proposedRateCategory ?? "Other" },
  { header: "Proposed Rate For Preferred Haulier", value: (order) => order.proposedRate ?? "0" },
  { header: "Week Number", value: (order) => order.week },
  { header: "Plan Type", value: (order) => order.planType },
  { header: "Traffic", value: (order) => order.traffic },
  { header: "Start Location", value: (order) => order.startLocation },
  { header: "Final Destination", value: (order) => order.endLocation },
  { header: "Start Date And Time", value: (order) => order.startDateTime },
  { header: "End Time", value: (order) => order.endDateTime },
  { header: "Day Of Week", value: (order) => order.day },
  { header: "Kit", value: (order) => order.kit },
  { header: "DVS Required", value: (order) => order.dvsRequired ?? "No" },
  { header: "Region", value: (order) => order.region },
  { header: "Duty Schedule", value: (order) => order.dutySchedule },
  { header: "Miles", value: (order) => order.miles },
  { header: "As Directed/Flex Time", value: (order) => order.asDirected },
  { header: "RMResponsiblePersonEmail", value: (order) => order.rmResponsiblePersonEmail ?? "rhc.team@royalmail.com" },
];


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
  { label: "Debrief", icon: "🧾", href: "/internal/app-ideas/link-message-mock/debrief" },
  { label: "RHC Team", icon: "RHC", href: "/internal/app-ideas/link-message-mock/rhc-team" },
  { label: "RHC History", icon: "HIS", href: "/internal/app-ideas/link-message-mock/rhc-team/history", active: true },
];

export default function RhcTeamHistoryPage() {
  const [orders, setOrders] = useState<RhcOrder[]>([]);
  const [searchText, setSearchText] = useState("");
  const [weekFilter, setWeekFilter] = useState("all");
  const [dayFilter, setDayFilter] = useState("all");
  const [planTypeFilter, setPlanTypeFilter] = useState("all");

  useEffect(() => {
    setOrders(readOrdersFromStorage());
  }, []);

  const weekOptions = useMemo(() => Array.from(new Set(orders.map((order) => String(order.week)))).sort((a, b) => Number(a) - Number(b)), [orders]);
  const dayOptions = useMemo(() => Array.from(new Set(orders.map((order) => order.day))).sort(), [orders]);
  const planTypeOptions = useMemo(() => Array.from(new Set(orders.map((order) => order.planType))).sort(), [orders]);

  const filteredOrders = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        order.duty.toLowerCase().includes(search) ||
        order.admName.toLowerCase().includes(search) ||
        order.reason.toLowerCase().includes(search) ||
        order.traffic.toLowerCase().includes(search) ||
        order.day.toLowerCase().includes(search) ||
        String(order.week).includes(search);

      const matchesWeek = weekFilter === "all" || String(order.week) === weekFilter;
      const matchesDay = dayFilter === "all" || order.day === dayFilter;
      const matchesPlanType = planTypeFilter === "all" || order.planType === planTypeFilter;

      return matchesSearch && matchesWeek && matchesDay && matchesPlanType;
    });
  }, [orders, searchText, weekFilter, dayFilter, planTypeFilter]);

  function exportHistory() {
    exportOrdersToExcel(filteredOrders, "RHC-Team-History-Export");
  }

  function clearHistory() {
    window.localStorage.removeItem(RHC_HISTORY_STORAGE_KEY);
    setOrders([]);
  }

  return (
    <main className="min-h-screen bg-[#f4f6f9] font-sans text-[#1d2633]">
      <OfficeHeader title="MOCK UP" subtitle="RHC Team History" />

      <div className="flex">
        <OfficeSidebar />

        <section className="min-w-0 flex-1 p-4 lg:p-5">
          <section className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e40000] text-sm font-black text-white">
                  HIS
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#111827]">RHC Team History</h1>
                  <p className="text-sm font-bold text-[#6b7280]">
                    Review the RHC requests that have been sent from the holding area.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/internal/app-ideas/link-message-mock/rhc-team"
                  className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-sm font-black text-[#4b5563] no-underline transition hover:border-[#e40000]"
                >
                  ← Back to RHC Order
                </Link>
                <button
                  type="button"
                  onClick={exportHistory}
                  className="rounded-lg border border-[#111827] bg-white px-4 py-2 text-sm font-black text-[#111827] transition hover:bg-[#f3f4f6]"
                >
                  Export To Excel
                </button>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="rounded-lg border border-[#e40000] bg-white px-4 py-2 text-sm font-black text-[#e40000] transition hover:bg-[#fff0f0]"
                >
                  Clear Mock History
                </button>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Ordered duties</p>
                <h2 className="mt-2 text-2xl font-black text-[#111827]">RHC requests sent</h2>
                <p className="mt-1 text-sm font-bold text-[#6b7280]">
                  {orders.length} mock request{orders.length === 1 ? "" : "s"} saved in this browser.
                </p>
              </div>

              <div className="grid w-full grid-cols-1 gap-3 lg:max-w-[920px] lg:grid-cols-4">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">Search history</span>
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Duty, ADM, reason or traffic"
                    className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none focus:border-[#e40000]"
                  />
                </label>

                <FilterSelect label="Week Number" value={weekFilter} onChange={setWeekFilter} options={weekOptions} />
                <FilterSelect label="Day Of Week" value={dayFilter} onChange={setDayFilter} options={dayOptions} />
                <FilterSelect label="Plan Type" value={planTypeFilter} onChange={setPlanTypeFilter} options={planTypeOptions} />
              </div>
            </div>

            <p className="mt-4 rounded-lg border border-[#f59e0b] bg-[#fffbeb] px-3 py-2 text-xs font-black text-[#92400e]">
              Warning: RHC Team History is stored locally in this browser for mockup use and will only stay on the system for 4 weeks.
            </p>

            <div className="mt-4 overflow-x-auto rounded-lg border border-[#d9dee6]">
              <table className="min-w-[2300px] w-full border-collapse text-left text-sm">
                <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.1em] text-[#6b7280]">
                  <tr>
                    <th className="px-3 py-3">Sent</th>
                    <th className="px-3 py-3">Duty Number</th>
                    <th className="px-3 py-3">JobTier</th>
                    <th className="px-3 py-3">Account</th>
                    <th className="px-3 py-3">Proposed Rate Category For Preferred Haulier</th>
                    <th className="px-3 py-3">Proposed Rate For Preferred Haulier</th>
                    <th className="px-3 py-3">Week Number</th>
                    <th className="px-3 py-3">Plan Type</th>
                    <th className="px-3 py-3">Traffic</th>
                    <th className="px-3 py-3">Start Location</th>
                    <th className="px-3 py-3">Final Destination</th>
                    <th className="px-3 py-3">Start Date And Time</th>
                    <th className="px-3 py-3">End Time</th>
                    <th className="px-3 py-3">Day Of Week</th>
                    <th className="px-3 py-3">Kit</th>
                    <th className="px-3 py-3">DVS Required</th>
                    <th className="px-3 py-3">Region</th>
                    <th className="px-3 py-3">Duty Schedule</th>
                    <th className="px-3 py-3">Miles</th>
                    <th className="px-3 py-3">As Directed/Flex Time</th>
                    <th className="px-3 py-3">RMResponsiblePersonEmail</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={21} className="px-3 py-8 text-center text-sm font-bold text-[#6b7280]">
                        No RHC Team history records found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={`${order.id}-${order.submittedAt ?? "saved"}`} className="border-t border-[#d9dee6] font-bold text-[#374151]">
                        <td className="px-3 py-3">{formatSubmittedAt(order.submittedAt)}</td>
                        <td className="px-3 py-3 font-black text-[#111827]">{order.duty}</td>
                        <td className="px-3 py-3">{order.jobTier ?? order.tier}</td>
                        <td className="px-3 py-3">{order.account ?? order.billingCentre}</td>
                        <td className="px-3 py-3">{order.proposedRateCategory ?? "Other"}</td>
                        <td className="px-3 py-3">{order.proposedRate ?? "0"}</td>
                        <td className="px-3 py-3">{order.week}</td>
                        <td className="px-3 py-3">{order.planType}</td>
                        <td className="px-3 py-3">{order.traffic}</td>
                        <td className="px-3 py-3">{order.startLocation}</td>
                        <td className="px-3 py-3">{order.endLocation}</td>
                        <td className="px-3 py-3">{order.startDateTime}</td>
                        <td className="px-3 py-3">{order.endDateTime}</td>
                        <td className="px-3 py-3">{order.day}</td>
                        <td className="px-3 py-3">{order.kit}</td>
                        <td className="px-3 py-3">{order.dvsRequired ?? "No"}</td>
                        <td className="px-3 py-3">{order.region}</td>
                        <td className="px-3 py-3">{order.dutySchedule}</td>
                        <td className="px-3 py-3">{order.miles}</td>
                        <td className="px-3 py-3">{order.asDirected}</td>
                        <td className="px-3 py-3">{order.rmResponsiblePersonEmail ?? "rhc.team@royalmail.com"}</td>
                      </tr>
                    ))
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


function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none focus:border-[#e40000]"
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function exportOrdersToExcel(orders: RhcOrder[], fileName: string) {
  if (typeof window === "undefined" || orders.length === 0) {
    return;
  }

  const headerHtml = rhcJobTemplateColumns
    .map((column) => `<th>${escapeExcelCell(column.header)}</th>`)
    .join("");

  const rowsHtml = orders
    .map((order) =>
      `<tr>${rhcJobTemplateColumns
        .map((column) => `<td>${escapeExcelCell(column.value(order))}</td>`)
        .join("")}</tr>`,
    )
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table border="1"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function escapeExcelCell(value: string | number | boolean | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readOrdersFromStorage(): RhcOrder[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawHistory = window.localStorage.getItem(RHC_HISTORY_STORAGE_KEY);
    const orders = rawHistory ? (JSON.parse(rawHistory) as RhcOrder[]) : [];
    const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000;
    const retainedOrders = orders.filter((order) => {
      if (!order.submittedAt) {
        return true;
      }

      const submittedTime = new Date(order.submittedAt).getTime();
      return Number.isNaN(submittedTime) || submittedTime >= fourWeeksAgo;
    });

    if (retainedOrders.length !== orders.length) {
      window.localStorage.setItem(RHC_HISTORY_STORAGE_KEY, JSON.stringify(retainedOrders));
    }

    return retainedOrders;
  } catch {
    return [];
  }
}

function formatSubmittedAt(value: string | undefined) {
  if (!value) {
    return "Mock saved";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Mock saved";
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

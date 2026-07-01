"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CommsSource = "RTC" | "Breakdown" | "Messaging" | "PMT Confirmation";
type CommsStatus = "New" | "Office review" | "Actioned";
type Priority = "Critical" | "High" | "Normal";

type CommsItem = {
  id: string;
  source: CommsSource;
  priority: Priority;
  status: CommsStatus;
  duty: string;
  driver: string;
  vehicle: string;
  trailer: string;
  received: string;
  title: string;
  detail: string;
};

const commsItems: CommsItem[] = [
  {
    id: "RTC-AC004",
    source: "RTC",
    priority: "Critical",
    status: "New",
    duty: "AC004",
    driver: "Andrew Cannon",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "12:08",
    title: "RTC report received",
    detail:
      "Driver has submitted an RTC report. Safety checklist complete, GPS captured and photos attached for office review.",
  },
  {
    id: "BD-AC006",
    source: "Breakdown",
    priority: "High",
    status: "Office review",
    duty: "AC006",
    driver: "Andrew Cannon",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "11:42",
    title: "Breakdown support request",
    detail:
      "Driver reports a vehicle fault and needs recovery advice. Location, duty, vehicle ID and trailer details have been supplied.",
  },
  {
    id: "MSG-AC002",
    source: "Messaging",
    priority: "Normal",
    status: "New",
    duty: "AC002",
    driver: "Andrew Cannon",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "10:55",
    title: "Transport office message",
    detail:
      "General driver-to-office message waiting for review. This would cover the Other messaging route from the PDA.",
  },
  {
    id: "PMT-AC001",
    source: "PMT Confirmation",
    priority: "Normal",
    status: "New",
    duty: "AC001",
    driver: "Andrew Cannon",
    vehicle: "PE68UHD",
    trailer: "7338014",
    received: "09:36",
    title: "PMT confirmation received",
    detail:
      "PMT confirmation has been sent by the driver and is waiting for the office to confirm the next action.",
  },
];

const sourceCards: { source: CommsSource; icon: string; description: string }[] = [
  {
    source: "RTC",
    icon: "RTC",
    description: "Road traffic collision reports from the Driver PDA.",
  },
  {
    source: "Breakdown",
    icon: "🚛",
    description: "Vehicle fault and recovery support requests.",
  },
  {
    source: "Messaging",
    icon: "✉",
    description: "General driver-to-office messages.",
  },
  {
    source: "PMT Confirmation",
    icon: "PMT",
    description: "Driver PMT confirmations requiring office review.",
  },
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
    active: true,
  },
  { label: "Debrief", icon: "🧾", href: "/internal/app-ideas/link-message-mock/debrief" },
  { label: "RHC Team", icon: "RHC", href: "/internal/app-ideas/link-message-mock/rhc-team" },
];

export default function LinkCommsDashboardPage() {
  const [selectedId, setSelectedId] = useState(commsItems[0].id);
  const [statusMessage, setStatusMessage] = useState("Select a driver communication to review the office action panel.");

  const selectedItem = useMemo(
    () => commsItems.find((item) => item.id === selectedId) ?? commsItems[0],
    [selectedId],
  );

  const newCount = commsItems.filter((item) => item.status === "New").length;
  const criticalCount = commsItems.filter((item) => item.priority === "Critical").length;
  const reviewCount = commsItems.filter((item) => item.status === "Office review").length;

  return (
    <main className="min-h-screen bg-[#f4f6f9] font-sans text-[#1d2633]">
      <OfficeHeader title="MOCK UP" subtitle="Comms Dashboard" />

      <div className="flex">
        <OfficeSidebar />

        <section className="min-w-0 flex-1 p-4 lg:p-5">
          <section className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-[#e40000] text-3xl text-white">
                  💬
                  <span className="absolute -bottom-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#111827] px-1 text-xs font-black text-white ring-2 ring-white">
                    4
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#111827]">Office Communications</h1>
                  <p className="text-sm font-bold text-[#6b7280]">
                    Driver PDA messages, RTC reports, breakdown requests and PMT confirmations in one office queue.
                  </p>
                </div>
              </div>

              <Link
                href="/internal/app-ideas/link-message-mock"
                className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-sm font-black text-[#4b5563] no-underline transition hover:border-[#e40000]"
              >
                ← Back to Duty Execution
              </Link>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Open alerts" value="4" tone="red" detail="Items needing office visibility" />
            <KpiCard label="New from PDA" value={String(newCount)} tone="blue" detail="Not yet reviewed by office" />
            <KpiCard label="Safety critical" value={String(criticalCount)} tone="red" detail="RTC or immediate risk" />
            <KpiCard label="Office review" value={String(reviewCount)} tone="amber" detail="Already opened by the office" />
          </section>

          <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-4">
            {sourceCards.map((card) => {
              const count = commsItems.filter((item) => item.source === card.source).length;
              return (
                <button
                  key={card.source}
                  type="button"
                  onClick={() => {
                    const firstMatch = commsItems.find((item) => item.source === card.source);
                    if (firstMatch) {
                      setSelectedId(firstMatch.id);
                      setStatusMessage(`${card.source} queue selected.`);
                    }
                  }}
                  className="rounded-md border border-[#d9dee6] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#e40000] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111827] text-lg font-black text-white">
                      {card.icon}
                    </div>
                    <span className="rounded-full bg-[#e40000] px-3 py-1 text-xs font-black text-white">
                      {count}
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-black text-[#111827]">{card.source}</h2>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#6b7280]">{card.description}</p>
                </button>
              );
            })}
          </section>

          <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="overflow-hidden rounded-md border border-[#d9dee6] bg-white shadow-sm">
              <div className="border-b border-[#d9dee6] bg-[#f8fafc] px-4 py-3">
                <h2 className="text-lg font-black text-[#111827]">Driver communications queue</h2>
                <p className="text-sm font-bold text-[#6b7280]">Click a row to review the message and office actions.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="bg-white text-xs uppercase tracking-[0.12em] text-[#6b7280]">
                    <tr>
                      <th className="border-b border-[#d9dee6] px-4 py-3">Source</th>
                      <th className="border-b border-[#d9dee6] px-4 py-3">Duty</th>
                      <th className="border-b border-[#d9dee6] px-4 py-3">Driver</th>
                      <th className="border-b border-[#d9dee6] px-4 py-3">Priority</th>
                      <th className="border-b border-[#d9dee6] px-4 py-3">Status</th>
                      <th className="border-b border-[#d9dee6] px-4 py-3">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commsItems.map((item) => {
                      const selected = item.id === selectedId;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            setSelectedId(item.id);
                            setStatusMessage(`${item.title} selected.`);
                          }}
                          className={`cursor-pointer transition hover:bg-[#fff0f0] ${
                            selected ? "bg-[#fff0f0]" : "bg-white"
                          }`}
                        >
                          <td className="border-b border-[#edf0f4] px-4 py-3 font-black text-[#111827]">{item.source}</td>
                          <td className="border-b border-[#edf0f4] px-4 py-3 font-black text-[#374151]">{item.duty}</td>
                          <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#374151]">{item.driver}</td>
                          <td className="border-b border-[#edf0f4] px-4 py-3"><PriorityBadge priority={item.priority} /></td>
                          <td className="border-b border-[#edf0f4] px-4 py-3"><StatusBadge status={item.status} /></td>
                          <td className="border-b border-[#edf0f4] px-4 py-3 font-bold text-[#374151]">{item.received}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Office action panel</p>
              <h2 className="mt-2 text-2xl font-black text-[#111827]">{selectedItem.title}</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-[#6b7280]">{selectedItem.detail}</p>

              <div className="mt-5 space-y-3 rounded-md bg-[#f8fafc] p-4 text-sm font-bold text-[#374151]">
                <p><span className="text-[#6b7280]">Duty:</span> {selectedItem.duty}</p>
                <p><span className="text-[#6b7280]">Vehicle:</span> {selectedItem.vehicle}</p>
                <p><span className="text-[#6b7280]">Trailer:</span> {selectedItem.trailer}</p>
                <p><span className="text-[#6b7280]">Received:</span> {selectedItem.received}</p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setStatusMessage(`${selectedItem.duty}: office has acknowledged the ${selectedItem.source} item.`)}
                  className="rounded-lg bg-[#e40000] px-4 py-3 text-sm font-black text-white transition hover:bg-[#b80000]"
                >
                  Acknowledge in office
                </button>
                <button
                  type="button"
                  onClick={() => setStatusMessage(`${selectedItem.duty}: follow-up sent back to driver PDA.`)}
                  className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-3 text-sm font-black text-[#4b5563] transition hover:border-[#e40000]"
                >
                  Send follow-up to driver
                </button>
                <button
                  type="button"
                  onClick={() => setStatusMessage(`${selectedItem.duty}: marked as actioned in mock dashboard.`)}
                  className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-3 text-sm font-black text-[#4b5563] transition hover:border-[#e40000]"
                >
                  Mark as actioned
                </button>
              </div>

              <div className="mt-5 rounded-lg border border-[#d9dee6] bg-[#f8fafc] px-4 py-3 text-sm font-black text-[#111827]">
                {statusMessage}
              </div>
            </aside>
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

function KpiCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "red" | "blue" | "amber";
}) {
  const toneClasses = {
    red: "border-[#e40000] bg-[#fff0f0] text-[#e40000]",
    blue: "border-[#2c80e5] bg-[#eef6ff] text-[#2c80e5]",
    amber: "border-[#f5a400] bg-[#fff7e6] text-[#a66900]",
  }[tone];

  return (
    <div className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">{label}</p>
      <p className={`mt-3 inline-flex rounded-lg border px-3 py-1 text-3xl font-black ${toneClasses}`}>{value}</p>
      <p className="mt-3 text-sm font-bold text-[#6b7280]">{detail}</p>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const classes =
    priority === "Critical"
      ? "bg-[#fff0f0] text-[#e40000] border-[#e40000]"
      : priority === "High"
        ? "bg-[#fff7e6] text-[#a66900] border-[#f5a400]"
        : "bg-[#eef6ff] text-[#2c80e5] border-[#2c80e5]";

  return <span className={`rounded-full border px-3 py-1 text-xs font-black ${classes}`}>{priority}</span>;
}

function StatusBadge({ status }: { status: CommsStatus }) {
  const classes =
    status === "New"
      ? "bg-[#fff0f0] text-[#e40000]"
      : status === "Office review"
        ? "bg-[#fff7e6] text-[#a66900]"
        : "bg-[#ecfdf3] text-[#157347]";

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${classes}`}>{status}</span>;
}

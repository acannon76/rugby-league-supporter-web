"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
  { label: "RHC Team", icon: "RHC", href: "/internal/app-ideas/link-message-mock/rhc-team", active: true },
];

const dutyOptions = [
  { duty: "AC001", origin: "North West Hub", destination: "Warrington VOC", start: "01:15", finish: "12:55" },
  { duty: "AC002", origin: "North West Hub", destination: "Manchester VOC", start: "01:45", finish: "12:45" },
  { duty: "AC003", origin: "North West Hub", destination: "Preston MC", start: "02:10", finish: "11:20" },
  { duty: "AC004", origin: "North West Hub", destination: "Liverpool MC", start: "02:30", finish: "15:05" },
  { duty: "AC005", origin: "North West Hub", destination: "Chester MC", start: "03:00", finish: "14:25" },
  { duty: "AC006", origin: "North West Hub", destination: "Wigan VOC", start: "04:15", finish: "13:40" },
  { duty: "AC007", origin: "North West Hub", destination: "Bolton DO", start: "05:00", finish: "12:15" },
  { duty: "AC008", origin: "North West Hub", destination: "Standby", start: "05:05", finish: "15:30" },
  { duty: "AC009", origin: "North West Hub", destination: "Manchester VOC", start: "09:00", finish: "15:45" },
];

const dayOptions = ["Mon 29 Jun", "Tue 30 Jun", "Wed 01 Jul", "Thu 02 Jul", "Fri 03 Jul", "Sat 04 Jul", "Sun 05 Jul"];

export default function RhcTeamPage() {
  const [selectedDuty, setSelectedDuty] = useState("AC001");
  const [selectedDay, setSelectedDay] = useState("Wed 01 Jul");
  const [sendPortal, setSendPortal] = useState(true);
  const [send318, setSend318] = useState(true);
  const [notes, setNotes] = useState("Order Road Haulage Contractor from LINK duty selection.");
  const [confirmation, setConfirmation] = useState("");

  const duty = useMemo(
    () => dutyOptions.find((item) => item.duty === selectedDuty) ?? dutyOptions[0],
    [selectedDuty],
  );

  function sendMockOrder() {
    const destinations = [sendPortal ? "RHC Portal" : null, send318 ? "318 Data" : null]
      .filter(Boolean)
      .join(" and ");

    setConfirmation(`${selectedDuty} for ${selectedDay} has been prepared and sent to ${destinations || "the selected output"}.`);
  }

  return (
    <main className="min-h-screen bg-[#f4f6f9] font-sans text-[#1d2633]">
      <OfficeHeader title="MOCK UP" subtitle="RHC Team" />

      <div className="flex">
        <OfficeSidebar />

        <section className="min-w-0 flex-1 p-4 lg:p-5">
          <section className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e40000] text-sm font-black text-white">
                  RHC
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#111827]">RHC Team Order Dashboard</h1>
                  <p className="text-sm font-bold text-[#6b7280]">
                    Select a LINK duty and send mock order data to the RHC Portal and 318 Data.
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

          <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <aside className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Step 1</p>
              <h2 className="mt-2 text-2xl font-black text-[#111827]">Choose duty and day</h2>

              <label className="mt-5 block">
                <span className="text-sm font-black text-[#111827]">Duty</span>
                <select
                  value={selectedDuty}
                  onChange={(event) => {
                    setSelectedDuty(event.target.value);
                    setConfirmation("");
                  }}
                  className="mt-2 h-12 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none focus:border-[#e40000]"
                >
                  {dutyOptions.map((item) => (
                    <option key={item.duty} value={item.duty}>
                      {item.duty} - {item.destination}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-black text-[#111827]">Day</span>
                <select
                  value={selectedDay}
                  onChange={(event) => {
                    setSelectedDay(event.target.value);
                    setConfirmation("");
                  }}
                  className="mt-2 h-12 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none focus:border-[#e40000]"
                >
                  {dayOptions.map((day) => (
                    <option key={day}>{day}</option>
                  ))}
                </select>
              </label>

              <section className="mt-5 rounded-lg border border-[#d9dee6] bg-[#f8fafc] p-4">
                <p className="text-sm font-black text-[#111827]">Send data to</p>
                <label className="mt-3 flex items-center gap-2 text-sm font-bold text-[#374151]">
                  <input checked={sendPortal} onChange={(event) => setSendPortal(event.target.checked)} type="checkbox" className="h-4 w-4" />
                  RHC Portal
                </label>
                <label className="mt-3 flex items-center gap-2 text-sm font-bold text-[#374151]">
                  <input checked={send318} onChange={(event) => setSend318(event.target.checked)} type="checkbox" className="h-4 w-4" />
                  318 Data
                </label>
              </section>

              <label className="mt-4 block">
                <span className="text-sm font-black text-[#111827]">Office notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-2 min-h-[110px] w-full rounded-lg border border-[#ccd5e2] bg-white px-3 py-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
                />
              </label>

              <button
                type="button"
                onClick={sendMockOrder}
                className="mt-5 w-full rounded-lg bg-[#e40000] px-4 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#b80000]"
              >
                Send mock RHC order
              </button>

              {confirmation && (
                <section className="mt-4 rounded-lg border-2 border-[#157347] bg-[#ecfdf3] p-4 text-sm font-black leading-6 text-[#157347]">
                  {confirmation}
                </section>
              )}
            </aside>

            <section className="space-y-4">
              <div className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Selected LINK duty</p>
                <h2 className="mt-2 text-4xl font-black text-[#111827]">{duty.duty}</h2>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
                  <InfoBox label="Day" value={selectedDay} />
                  <InfoBox label="Origin" value={duty.origin} />
                  <InfoBox label="Destination" value={duty.destination} />
                  <InfoBox label="Time" value={`${duty.start} - ${duty.finish}`} />
                </div>
              </div>

              <div className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Mock data package</p>
                <h2 className="mt-2 text-2xl font-black text-[#111827]">What would be sent</h2>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <DataPackageCard
                    title="RHC Portal"
                    enabled={sendPortal}
                    rows={[
                      "Duty ID and operating date",
                      "Origin and destination details",
                      "Planned duty timings",
                      "Contractor order note",
                    ]}
                  />
                  <DataPackageCard
                    title="318 Data"
                    enabled={send318}
                    rows={[
                      "Duty number and day",
                      "Trip details from LINK",
                      "Trailer and load requirement placeholder",
                      "Office notes for downstream mockup",
                    ]}
                  />
                </div>
              </div>

              <div className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Duty picker</p>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {dutyOptions.map((item) => (
                    <button
                      key={item.duty}
                      type="button"
                      onClick={() => {
                        setSelectedDuty(item.duty);
                        setConfirmation("");
                      }}
                      className={`rounded-lg border p-3 text-left transition hover:border-[#e40000] ${
                        selectedDuty === item.duty ? "border-[#e40000] bg-[#fff0f0]" : "border-[#d9dee6] bg-[#f8fafc]"
                      }`}
                    >
                      <p className="font-black text-[#111827]">{item.duty}</p>
                      <p className="mt-1 text-xs font-bold text-[#6b7280]">{item.destination}</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d9dee6] bg-[#f8fafc] p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">{label}</p>
      <p className="mt-2 text-sm font-black text-[#111827]">{value}</p>
    </div>
  );
}

function DataPackageCard({
  title,
  enabled,
  rows,
}: {
  title: string;
  enabled: boolean;
  rows: string[];
}) {
  return (
    <section className={`rounded-lg border p-4 ${enabled ? "border-[#157347] bg-[#ecfdf3]" : "border-[#d9dee6] bg-[#f8fafc] opacity-60"}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-[#111827]">{title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${enabled ? "bg-[#157347] text-white" : "bg-[#6b7280] text-white"}`}>
          {enabled ? "Selected" : "Off"}
        </span>
      </div>
      <ul className="mt-4 space-y-2 text-sm font-bold text-[#374151]">
        {rows.map((row) => (
          <li key={row} className="flex gap-2">
            <span className="text-[#e40000]">•</span>
            <span>{row}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SideButton = {
  label: string;
  icon: string;
  href?: string;
  alertCount?: number;
};

type DutyAction = {
  label: string;
  icon: string;
  colour: string;
};

type GanttSegment = {
  start: number;
  width: number;
  icon: string;
  tone: "grey" | "pink" | "stripe" | "white" | "pale";
  label: string;
};

type DutyRow = {
  duty: string;
  segments: GanttSegment[];
};

const sideButtons: SideButton[] = [
  { label: "Settings", icon: "⚙" },
  { label: "Planning", icon: "⚙" },
  { label: "Vehicle view", icon: "🚛" },
  { label: "Trailer view", icon: "▰" },
  { label: "Fleet view", icon: "▱" },
  {
    label: "Comms",
    icon: "💬",
    href: "/internal/app-ideas/link-message-mock/comms",
    alertCount: 4,
  },
  {
    label: "Debrief",
    icon: "🧾",
    href: "/internal/app-ideas/link-message-mock/debrief",
  },
  {
    label: "RHC Team",
    icon: "RHC",
    href: "/internal/app-ideas/link-message-mock/rhc-team",
  },
];

const dutyActions: DutyAction[] = [
  { label: "Open duty", icon: "→", colour: "bg-[#1f7ae0]" },
  { label: "Cancel duty", icon: "×", colour: "bg-[#ef3030]" },
  { label: "Duty information", icon: "i", colour: "bg-[#202733]" },
  { label: "Send message", icon: "↔", colour: "bg-[#202733]" },
  { label: "Duty log", icon: "◷", colour: "bg-[#202733]" },
  { label: "Add action", icon: "+", colour: "bg-[#202733]" },
];

const duties: DutyRow[] = [
  {
    duty: "AC001",
    segments: [
      { start: 2, width: 3.5, icon: "⚑", tone: "grey", label: "Depot start" },
      { start: 5.7, width: 2, icon: "⛓", tone: "white", label: "Coupling" },
      { start: 7.8, width: 8, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 15.8, width: 2.2, icon: "⚙", tone: "pale", label: "Gate check" },
      { start: 18.2, width: 22, icon: "⇄", tone: "stripe", label: "Swap / loading" },
      { start: 40.8, width: 3, icon: "🍴", tone: "white", label: "Break" },
      { start: 44.2, width: 3.8, icon: "⚡", tone: "stripe", label: "Issue" },
      { start: 48.5, width: 3, icon: "📦", tone: "pale", label: "Load" },
      { start: 52, width: 19, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 71.4, width: 3.2, icon: "📦", tone: "pale", label: "Unload" },
      { start: 74.8, width: 2.4, icon: "✋", tone: "grey", label: "Stop" },
    ],
  },
  {
    duty: "AC002",
    segments: [
      { start: 3, width: 3.5, icon: "⚑", tone: "grey", label: "Depot start" },
      { start: 6.8, width: 2.5, icon: "⛓", tone: "white", label: "Coupling" },
      { start: 9.3, width: 29, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 38.7, width: 3.5, icon: "📦", tone: "pale", label: "Unload" },
      { start: 42.5, width: 3, icon: "🍴", tone: "white", label: "Break" },
      { start: 45.8, width: 25.5, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 71.3, width: 2.2, icon: "✋", tone: "grey", label: "End" },
    ],
  },
  {
    duty: "AC003",
    segments: [
      { start: 4.8, width: 3.5, icon: "⚑", tone: "grey", label: "Depot start" },
      { start: 8.5, width: 3, icon: "📦", tone: "pale", label: "Load" },
      { start: 11.8, width: 3.5, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 15.5, width: 3.5, icon: "📦", tone: "pale", label: "Unload" },
      { start: 19.3, width: 5, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 24.8, width: 3.3, icon: "⚙", tone: "pale", label: "Check" },
      { start: 28.5, width: 4.6, icon: "⚡", tone: "stripe", label: "Issue" },
      { start: 33.3, width: 3.5, icon: "🍴", tone: "white", label: "Break" },
      { start: 37.2, width: 3.8, icon: "📦", tone: "pale", label: "Unload" },
      { start: 41.5, width: 5, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 47, width: 3.3, icon: "📦", tone: "pale", label: "Load" },
      { start: 50.6, width: 4, icon: "📦", tone: "white", label: "Check" },
      { start: 55, width: 3.5, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 58.8, width: 3, icon: "📦", tone: "pale", label: "Unload" },
      { start: 62.2, width: 3.5, icon: "⇄", tone: "stripe", label: "Swap" },
      { start: 65.8, width: 2.4, icon: "✋", tone: "grey", label: "End" },
    ],
  },
  {
    duty: "AC004",
    segments: [
      { start: 5.5, width: 2.5, icon: "⚑", tone: "grey", label: "Depot start" },
      { start: 8.3, width: 2.2, icon: "⚙", tone: "stripe", label: "Check" },
      { start: 10.8, width: 2.6, icon: "⚙", tone: "pale", label: "Check" },
      { start: 13.8, width: 2.6, icon: "⚡", tone: "stripe", label: "Issue" },
      { start: 16.8, width: 3.2, icon: "📦", tone: "pale", label: "Load" },
      { start: 20.3, width: 8, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 28.8, width: 3, icon: "📦", tone: "pale", label: "Unload" },
      { start: 32.3, width: 3, icon: "📦", tone: "white", label: "Load" },
      { start: 35.8, width: 8.3, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 44.5, width: 4.5, icon: "⛽", tone: "pale", label: "Fuel" },
      { start: 49.5, width: 3.5, icon: "🍴", tone: "white", label: "Break" },
      { start: 53.5, width: 4.4, icon: "⛽", tone: "pale", label: "Fuel" },
      { start: 58.2, width: 3, icon: "⛓", tone: "white", label: "Coupling" },
      { start: 61.5, width: 3.3, icon: "📦", tone: "pale", label: "Load" },
      { start: 65, width: 7.5, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 72.8, width: 3, icon: "📦", tone: "pale", label: "Unload" },
      { start: 76.2, width: 3, icon: "📦", tone: "pale", label: "Load" },
      { start: 79.5, width: 6.5, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 86.5, width: 4, icon: "⇄", tone: "stripe", label: "Swap" },
      { start: 90.8, width: 2.2, icon: "✋", tone: "grey", label: "End" },
    ],
  },
  {
    duty: "AC005",
    segments: [
      { start: 6, width: 3.8, icon: "⚑", tone: "grey", label: "Depot start" },
      { start: 10.3, width: 3.5, icon: "📦", tone: "pale", label: "Load" },
      { start: 14.2, width: 27, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 41.7, width: 3.5, icon: "📦", tone: "pale", label: "Unload" },
      { start: 45.7, width: 4, icon: "🍴", tone: "white", label: "Break" },
      { start: 50.2, width: 3.4, icon: "📦", tone: "pale", label: "Load" },
      { start: 54, width: 29, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 83.4, width: 3.2, icon: "📦", tone: "pale", label: "Unload" },
      { start: 87, width: 2.2, icon: "✋", tone: "grey", label: "End" },
    ],
  },
  {
    duty: "AC006",
    segments: [
      { start: 8.5, width: 3.8, icon: "⚑", tone: "grey", label: "Depot start" },
      { start: 12.7, width: 3.5, icon: "📦", tone: "pale", label: "Load" },
      { start: 16.6, width: 31, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 48, width: 3.8, icon: "📦", tone: "pale", label: "Unload" },
      { start: 52.2, width: 4.2, icon: "🍴", tone: "white", label: "Break" },
      { start: 57, width: 25, icon: "⇄", tone: "stripe", label: "Swap / issue" },
      { start: 82.5, width: 2.2, icon: "✋", tone: "grey", label: "End" },
    ],
  },
  {
    duty: "AC007",
    segments: [
      { start: 10, width: 3.8, icon: "⚑", tone: "grey", label: "Depot start" },
      { start: 14.2, width: 3.2, icon: "📦", tone: "pale", label: "Load" },
      { start: 17.8, width: 5.5, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 23.7, width: 3.2, icon: "📦", tone: "pale", label: "Unload" },
      { start: 27.2, width: 6, icon: "⇄", tone: "stripe", label: "Swap" },
      { start: 33.5, width: 3.2, icon: "📦", tone: "pale", label: "Load" },
      { start: 37, width: 5.6, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 43, width: 3.5, icon: "📦", tone: "pale", label: "Unload" },
      { start: 46.8, width: 6, icon: "⇄", tone: "stripe", label: "Swap" },
      { start: 53.2, width: 4.5, icon: "⚙", tone: "pale", label: "Check" },
      { start: 58.2, width: 4, icon: "🍴", tone: "white", label: "Break" },
      { start: 62.7, width: 3.2, icon: "📦", tone: "pale", label: "Load" },
      { start: 66.2, width: 3.2, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 69.8, width: 3, icon: "📦", tone: "pale", label: "Unload" },
      { start: 73.2, width: 2.2, icon: "✋", tone: "grey", label: "End" },
    ],
  },
  {
    duty: "AC008",
    segments: [
      { start: 10, width: 3.5, icon: "⚑", tone: "grey", label: "Depot start" },
      { start: 13.8, width: 28, icon: "▤", tone: "pale", label: "Standby" },
      { start: 42.2, width: 4, icon: "🍴", tone: "white", label: "Break" },
      { start: 46.8, width: 12.5, icon: "▤", tone: "pale", label: "Standby" },
      { start: 59.6, width: 4, icon: "🍴", tone: "white", label: "Break" },
      { start: 64.2, width: 3.8, icon: "📦", tone: "pale", label: "Load" },
      { start: 68.2, width: 6, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 74.5, width: 3.5, icon: "📦", tone: "pale", label: "Unload" },
      { start: 78.5, width: 6.4, icon: "⇄", tone: "stripe", label: "Swap" },
      { start: 85.2, width: 2.2, icon: "✋", tone: "grey", label: "End" },
    ],
  },
  {
    duty: "AC009",
    segments: [
      { start: 20, width: 3.8, icon: "⚑", tone: "grey", label: "Depot start" },
      { start: 24.2, width: 2, icon: "⚙", tone: "stripe", label: "Check" },
      { start: 26.5, width: 3.2, icon: "📦", tone: "pale", label: "Load" },
      { start: 30, width: 5.3, icon: "🚚", tone: "pink", label: "Travel" },
      { start: 35.8, width: 3.5, icon: "📦", tone: "pale", label: "Unload" },
      { start: 39.8, width: 5.8, icon: "⇄", tone: "stripe", label: "Swap" },
      { start: 46, width: 4, icon: "🍴", tone: "white", label: "Break" },
      { start: 50.5, width: 29, icon: "☕", tone: "pale", label: "Standby" },
      { start: 79.8, width: 2.2, icon: "✋", tone: "grey", label: "End" },
    ],
  },
];

const timeLabels = Array.from({ length: 16 }, (_, index) => `${String(index + 1).padStart(2, "0")}:00`);

function getMonday(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getIsoWeek(date: Date) {
  const checkDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = checkDate.getUTCDay() || 7;
  checkDate.setUTCDate(checkDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(checkDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((checkDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatDayTab(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatRangeDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getSegmentClasses(tone: GanttSegment["tone"]) {
  if (tone === "pink") {
    return "border-[#e8939e] bg-[#ee98a4]";
  }

  if (tone === "stripe") {
    return "border-[#ff9aa9] bg-[repeating-linear-gradient(135deg,#ffe3e7_0,#ffe3e7_3px,#ff9aa9_3px,#ff9aa9_4px)] text-[#e4002b]";
  }

  if (tone === "white") {
    return "border-[#c6ccd4] bg-white";
  }

  if (tone === "pale") {
    return "border-[#d1d8e2] bg-[#e8eef5]";
  }

  return "border-[#c4c9cf] bg-[#d4d6da]";
}

export default function LinkMessageMockPage() {
  const [activeSideButton, setActiveSideButton] = useState("Settings");
  const [selectedDetail, setSelectedDetail] = useState(
    "Ready. Click a duty icon, left menu button or Gantt segment to test the mock interaction.",
  );

  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => getMonday(today), [today]);
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + index);
        return day;
      }),
    [weekStart],
  );
  const weekEnd = days[6];

  return (
    <main className="min-h-screen bg-[#f4f6f9] font-sans text-[#1d2633]">
      <header className="flex min-h-[64px] items-center justify-between bg-[#e40000] text-white shadow-sm">
        <div className="flex h-full items-center">
          <button
            type="button"
            onClick={() => setSelectedDetail("Main menu button clicked.")}
            className="flex h-[64px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black transition hover:bg-white/10"
            aria-label="Open menu"
          >
            ≡
          </button>
          <div className="px-5">
            <p className="text-2xl font-black uppercase tracking-wide">MOCK UP</p>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">
              Link Message Mock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-4">
          <Link
            href="/internal/app-ideas"
            className="hidden rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-white/15 sm:block"
          >
            ← Back to PDA Home
          </Link>
          <button
            type="button"
            onClick={() => setSelectedDetail("User profile clicked.")}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-[#e40000] transition hover:scale-105"
            aria-label="User profile"
          >
            ●
          </button>
          <div className="hidden text-right sm:block">
            <p className="text-base font-black">Andrew Cannon</p>
            <p className="text-xs font-bold text-white/80">Mock dashboard user</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDetail("Logout icon clicked.")}
            className="hidden border-l border-white/40 pl-5 text-2xl font-black transition hover:text-white/70 sm:block"
            aria-label="Log out"
          >
            ↪
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="flex min-h-[calc(100vh-64px)] w-[68px] flex-col bg-[#252c33] text-white">
          {sideButtons.map((button) => {
            const isActive = button.label === activeSideButton;
            const buttonClasses = `relative flex h-[64px] items-center justify-center border-b border-white/10 transition ${
              button.icon.length > 2 ? "text-sm font-black" : "text-3xl"
            } ${
              isActive ? "bg-[#11171d] text-white" : "text-white/75 hover:bg-[#11171d] hover:text-white"
            }`;
            const buttonContent = (
              <>
                <span>{button.icon}</span>
                {button.alertCount ? (
                  <span className="absolute bottom-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e40000] px-1 text-[11px] font-black leading-none text-white ring-2 ring-[#252c33]">
                    {button.alertCount}
                  </span>
                ) : null}
              </>
            );

            if (button.href) {
              return (
                <Link
                  key={button.label}
                  href={button.href}
                  className={`${buttonClasses} no-underline`}
                  aria-label={button.label}
                  title={button.label}
                >
                  {buttonContent}
                </Link>
              );
            }

            return (
              <button
                key={button.label}
                type="button"
                onClick={() => {
                  setActiveSideButton(button.label);
                  setSelectedDetail(`${button.label} left menu button clicked.`);
                }}
                className={buttonClasses}
                aria-label={button.label}
                title={button.label}
              >
                {buttonContent}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSelectedDetail("Sidebar collapse button clicked.")}
            className="mt-auto flex h-[64px] items-center justify-center border-t border-white/10 text-3xl text-white/80 transition hover:bg-[#11171d] hover:text-white"
            aria-label="Collapse sidebar"
          >
            »
          </button>
        </aside>

        <section className="min-w-0 flex-1 p-4 lg:p-5">
          <div className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e40000] text-3xl text-white">
                  ⚙
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#111827]">Duty Execution</h1>
                  <p className="text-sm font-bold text-[#6b7280]">
                    Interactive mock Gantt view for LINK message workflow.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDetail("Previous week clicked.")}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e40000] text-xl font-black text-white transition hover:bg-[#b80000]"
                  aria-label="Previous week"
                >
                  ‹
                </button>
                <p className="text-base font-black">Week {getIsoWeek(today)}</p>
                <p className="text-base font-medium text-[#374151]">
                  {formatRangeDate(weekStart)} - {formatRangeDate(weekEnd)}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedDetail("Next week clicked.")}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e40000] text-xl font-black text-white transition hover:bg-[#b80000]"
                  aria-label="Next week"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDetail("Hub selector clicked.")}
                  className="ml-0 min-w-[210px] rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-left text-sm font-bold text-[#4b5563] shadow-sm transition hover:border-[#e40000] xl:ml-4"
                >
                  NORTH WEST HUB⌄
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-[#d9dee6] bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {days.map((day) => {
                  const isToday = day.toDateString() === today.toDateString();

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => setSelectedDetail(`${formatDayTab(day)} date tab clicked.`)}
                      className={`rounded-md border px-5 py-3 text-sm font-black transition ${
                        isToday
                          ? "border-[#e40000] bg-[#fff0f0] text-[#e40000]"
                          : "border-[#dce3ec] bg-[#f8fafc] text-[#4b5563] hover:border-[#e40000]"
                      }`}
                    >
                      {formatDayTab(day)}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#4b5563]">
                <LegendDot colour="bg-[#2c80e5]" label="New" />
                <LegendDot colour="bg-[#f5a400]" label="In Progress" />
                <LegendDot colour="bg-[#ef3030]" label="Cancelled" />
                <LegendDot colour="bg-[#3ca34b]" label="Completed" />
                <LegendDot colour="bg-[#8a2be2]" label="Allocated" />
                <LegendDot colour="bg-[#f59e0b]" label="Failed" warning />
                <button
                  type="button"
                  onClick={() => setSelectedDetail("Clear all clicked.")}
                  className="text-[#e40000] underline-offset-2 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="rounded-lg border border-[#d9dee6] bg-[#f8fafc] px-4 py-3 text-sm font-bold text-[#4b5563]">
                Selected: <span className="text-[#111827]">{selectedDetail}</span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm font-bold text-[#4b5563]">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#cbd5e1]" />
                  Amended Duties
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#cbd5e1]" />
                  Show Additional Details
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedDetail("Duty Content Filter clicked.")}
                  className="rounded-md border border-[#d9dee6] bg-[#f5f5f5] px-4 py-2 font-black transition hover:border-[#e40000]"
                >
                  Duty Content Filter
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDetail("Slider filter button clicked.")}
                  className="rounded-md border border-[#d9dee6] bg-[#f5f5f5] px-4 py-2 text-xl font-black transition hover:border-[#e40000]"
                  aria-label="Advanced filters"
                >
                  ≡
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-md border border-[#d9dee6] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <div className="min-w-[1460px]">
                <div className="grid grid-cols-[240px_1fr] border-b border-[#d9dee6] bg-white">
                  <div className="border-r border-[#d9dee6] p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-black">Duty Details</p>
                      <button
                        type="button"
                        onClick={() => setSelectedDetail("Duty detail sort button clicked.")}
                        className="text-xl font-black text-[#4b5563]"
                        aria-label="Sort duty details"
                      >
                        ⇵
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        aria-label="Search duties"
                        placeholder="Search"
                        className="w-full rounded-md border border-[#cfd8e4] px-3 py-2 text-sm outline-none transition focus:border-[#e40000]"
                        onFocus={() => setSelectedDetail("Search box clicked.")}
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedDetail("Search filter clicked.")}
                        className="text-xl text-[#9ca3af]"
                        aria-label="Search filter"
                      >
                        ⌯
                      </button>
                    </div>
                  </div>

                  <div className="relative border-r border-[#d9dee6] bg-white">
                    <div className="grid h-[46px] grid-cols-[repeat(16,minmax(0,1fr))] border-b border-[#d9dee6]">
                      {timeLabels.map((label) => (
                        <div
                          key={label}
                          className="border-l border-[#edf0f4] pt-3 text-center text-xs font-black text-[#4b5563]"
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                    <div className="h-[14px] bg-[repeating-linear-gradient(to_right,#c9cfd8_0,#c9cfd8_1px,transparent_1px,transparent_16px)]" />
                  </div>
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute bottom-0 left-[240px] top-0 z-10 w-[calc(100%-240px)] bg-[repeating-linear-gradient(to_right,transparent_0,transparent_87px,#eef1f5_87px,#eef1f5_88px)]" />
                  <div
                    className="pointer-events-none absolute bottom-0 top-0 z-20 border-l-2 border-dashed border-[#e40000]"
                    style={{ left: "calc(240px + ((100% - 240px) * 0.72))" }}
                  />

                  {duties.map((duty, index) => (
                    <div
                      key={duty.duty}
                      className={`grid min-h-[64px] grid-cols-[240px_1fr] border-b border-[#dfe5ed] ${
                        index % 2 === 0 ? "bg-[#f4f7fb]" : "bg-white"
                      }`}
                    >
                      <div className="z-20 border-r border-[#d9dee6] px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-[#2c80e5]" />
                          <p className="font-black text-[#374151]">{duty.duty}</p>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          {dutyActions.map((action) => (
                            <button
                              key={action.label}
                              type="button"
                              onClick={() =>
                                setSelectedDetail(`${duty.duty}: ${action.label} clicked.`)
                              }
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-black text-white transition hover:scale-110 ${action.colour}`}
                              aria-label={`${duty.duty} ${action.label}`}
                              title={`${duty.duty} ${action.label}`}
                            >
                              {action.icon}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative z-0 h-[64px]">
                        {duty.segments.map((segment, segmentIndex) => (
                          <button
                            key={`${duty.duty}-${segment.label}-${segmentIndex}`}
                            type="button"
                            onClick={() =>
                              setSelectedDetail(`${duty.duty}: ${segment.label} segment clicked.`)
                            }
                            className={`absolute top-[18px] flex h-[24px] items-center justify-center overflow-hidden border text-[12px] font-black text-[#202733] shadow-sm transition hover:z-30 hover:scale-y-125 ${getSegmentClasses(
                              segment.tone,
                            )}`}
                            style={{ left: `${segment.start}%`, width: `${segment.width}%` }}
                            title={`${duty.duty} ${segment.label}`}
                          >
                            <span>{segment.icon}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between px-4 py-3 text-sm font-medium text-[#6b7280]">
                  <p>Showing 1 to {duties.length} of {duties.length} entries</p>
                  <div className="flex items-center gap-3">
                    <button type="button" className="text-lg text-[#9ca3af]" onClick={() => setSelectedDetail("First page clicked.")}>«</button>
                    <button type="button" className="text-lg text-[#9ca3af]" onClick={() => setSelectedDetail("Previous page clicked.")}>‹</button>
                    <button type="button" className="rounded-md bg-[#e40000] px-4 py-2 font-black text-white" onClick={() => setSelectedDetail("Page 1 clicked.")}>1</button>
                    <button type="button" className="text-lg text-[#9ca3af]" onClick={() => setSelectedDetail("Next page clicked.")}>›</button>
                    <button type="button" className="text-lg text-[#9ca3af]" onClick={() => setSelectedDetail("Last page clicked.")}>»</button>
                    <button type="button" className="rounded-md border border-[#d9dee6] px-4 py-2 font-black" onClick={() => setSelectedDetail("Page size clicked.")}>100⌄</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function LegendDot({
  colour,
  label,
  warning = false,
}: {
  colour: string;
  label: string;
  warning?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      {warning ? (
        <span className="text-[#f59e0b]">⚠</span>
      ) : (
        <span className={`h-3 w-3 rounded-full ${colour}`} />
      )}
      {label}
    </span>
  );
}

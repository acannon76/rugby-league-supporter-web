"use client";

import Link from "next/link";
import { Fragment, type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";

import { useDriverName } from "../../DriverName";

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

type HoveredTravelSegment = {
  duty: string;
  segmentIndex: number;
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

const dutySegmentPatterns: DutyRow[] = [
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

const duties: DutyRow[] = Array.from({ length: 30 }, (_, index) => {
  const pattern = dutySegmentPatterns[index % dutySegmentPatterns.length];
  const offset = ((index % 5) - 2) * 1.1;

  return {
    duty: index === 2 ? "NWH254" : `NWH${String(index + 1).padStart(3, "0")}`,
    segments: pattern.segments.map((segment) => ({
      ...segment,
      start: Math.min(94, Math.max(1, Number((segment.start + offset).toFixed(1)))),
    })),
  };
});

const roadHaulageDutyCodes = new Set(["NWH004", "NWH009", "NWH017", "NWH024"]);
const mockTravelLocations = [
  "North West Hub",
  "Manchester VOC",
  "Preston MC",
  "Warrington VOC",
  "Liverpool Mail Centre",
  "North West Hub",
];
const mockVehicleRegistrations = [
  "PE68UHD",
  "PO70KVT",
  "MX69JZF",
  "PN71XRL",
  "PF20LKA",
  "PL72VBT",
  "PK19WMO",
  "PX73HCD",
];
const mockTrailerNumbers = [
  "5320233",
  "24163445",
  "7320234",
  "4330123",
  "5321184",
  "2419087",
  "7321108",
  "4332755",
];

const timeLabels = Array.from({ length: 16 }, (_, index) => `${String(index + 1).padStart(2, "0")}:00`);

const COMMS_OPEN_STORAGE_KEY = "link-message-comms-open-items";

type CommsStorageItem = {
  duty?: string;
  driver?: string;
  source?: string;
  message?: {
    direction?: string;
  };
};

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


function isRoadHaulageDuty(duty: string) {
  return roadHaulageDutyCodes.has(duty);
}

function getDutyNumericIndex(duty: string) {
  const match = duty.match(/(\d+)$/);
  return match ? Number(match[1]) - 1 : 0;
}

function formatDurationLong(durationLabel: string) {
  const match = durationLabel.match(/(\d+)h\s(\d+)m/);

  if (!match) {
    return durationLabel;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const hourText = `${hours} hour${hours === 1 ? "" : "s"}`;

  if (minutes === 0) {
    return hourText;
  }

  return `${hourText} ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function getTravelLegIndex(row: DutyRow, segmentIndex: number) {
  return row.segments
    .slice(0, segmentIndex + 1)
    .filter((segment) => segment.label === "Travel").length - 1;
}

function getTravelTimingStatus(row: DutyRow, segmentIndex: number) {
  const dutyIndex = getDutyNumericIndex(row.duty);
  const travelIndex = Math.max(0, getTravelLegIndex(row, segmentIndex));

  // Deterministic mock timing: approximately one in three travel legs is late.
  return (dutyIndex + travelIndex * 2) % 3 === 1 ? "late" : "onTime";
}

function buildTravelTooltip(row: DutyRow, segmentIndex: number) {
  const segment = row.segments[segmentIndex];

  if (!segment || segment.label !== "Travel") {
    return null;
  }

  const travelSegments = row.segments
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.label === "Travel");
  const travelIndex = travelSegments.findIndex(({ index }) => index === segmentIndex);
  const dutyIndex = getDutyNumericIndex(row.duty);
  const routeBaseIndex = (dutyIndex + Math.max(travelIndex, 0)) % (mockTravelLocations.length - 1);
  const fromLocation = mockTravelLocations[routeBaseIndex];
  const toLocation = mockTravelLocations[routeBaseIndex + 1];
  const vehicle =
    mockVehicleRegistrations[(dutyIndex + Math.max(travelIndex, 0)) % mockVehicleRegistrations.length];
  const trailer = mockTrailerNumbers[(dutyIndex + Math.max(travelIndex, 0)) % mockTrailerNumbers.length];
  const start = formatTimelinePercentAsTime(segment.start);
  const finish = formatTimelinePercentAsTime(segment.start + segment.width);
  const duration = calculateRhcDutyDuration(start, finish);

  return {
    title: `Travel - ${fromLocation.toUpperCase()} to ${toLocation.toUpperCase()}`,
    time: `${start} to ${finish}`,
    duration: formatDurationLong(duration.label),
    vehicle,
    trailer,
    anchor: Math.max(12, Math.min(88, segment.start + segment.width / 2)),
  };
}

export default function LinkMessageMockPage() {
  const driverName = useDriverName();
  const [activeSideButton, setActiveSideButton] = useState("Settings");
  const [selectedDetail, setSelectedDetail] = useState(
    "Ready. Click a duty icon, left menu button or Gantt segment to test the mock interaction.",
  );
  const [rhcPopupDuty, setRhcPopupDuty] = useState<DutyRow | null>(null);
  const [rhcHoldingOrders, setRhcHoldingOrders] = useState<RhcOrder[]>([]);
  const [selectedRhcHoldingIds, setSelectedRhcHoldingIds] = useState<string[]>([]);
  const [activeDutyTab, setActiveDutyTab] = useState<"all" | "roadHaulage">("all");
  const [hoveredTravelSegment, setHoveredTravelSegment] = useState<HoveredTravelSegment | null>(null);
  const [driverMessageDutyIds, setDriverMessageDutyIds] = useState<string[]>([]);
  const [showIssuesOnly, setShowIssuesOnly] = useState(false);

  useEffect(() => {
    function refreshDriverMessageIndicators() {
      if (typeof window === "undefined") {
        return;
      }

      try {
        const raw = window.localStorage.getItem(COMMS_OPEN_STORAGE_KEY);
        if (!raw) {
          setDriverMessageDutyIds([]);
          return;
        }

        const parsed = JSON.parse(raw);
        const openDriverDuties = Array.isArray(parsed)
          ? Array.from(
              new Set(
                parsed
                  .filter((item): item is CommsStorageItem => Boolean(item && typeof item === "object"))
                  .filter((item) =>
                    typeof item.duty === "string" &&
                    typeof item.driver === "string" &&
                    item.driver.trim().toLowerCase() === driverName.trim().toLowerCase() &&
                    (item.message?.direction === "Driver to office" || item.source === "Breakdown"),
                  )
                  .map((item) => item.duty as string),
              ),
            )
          : [];

        setDriverMessageDutyIds(openDriverDuties);
      } catch {
        setDriverMessageDutyIds([]);
      }
    }

    refreshDriverMessageIndicators();
    window.addEventListener("storage", refreshDriverMessageIndicators);
    window.addEventListener("focus", refreshDriverMessageIndicators);

    return () => {
      window.removeEventListener("storage", refreshDriverMessageIndicators);
      window.removeEventListener("focus", refreshDriverMessageIndicators);
    };
  }, [driverName]);

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
  const visibleDuties = useMemo(() => {
    const baseDuties = activeDutyTab === "roadHaulage" ? duties.filter((duty) => isRoadHaulageDuty(duty.duty)) : duties;

    if (!showIssuesOnly) {
      return baseDuties;
    }

    return baseDuties.filter((duty) => {
      const hasDriverMessage = driverMessageDutyIds.includes(duty.duty);
      const hasLateTravelLeg = duty.segments.some(
        (segment, segmentIndex) => segment.label === "Travel" && getTravelTimingStatus(duty, segmentIndex) === "late",
      );

      return hasDriverMessage || hasLateTravelLeg;
    });
  }, [activeDutyTab, driverMessageDutyIds, showIssuesOnly]);

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
            <p className="text-base font-black">{driverName}</p>
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
            <div className="mb-4 flex flex-wrap gap-2 border-b border-[#e5e7eb] pb-3">
              <button
                type="button"
                onClick={() => {
                  setActiveDutyTab("all");
                  setSelectedDetail("All Duties tab opened.");
                }}
                className={`rounded-t-md border px-4 py-3 text-sm font-black transition ${
                  activeDutyTab === "all"
                    ? "border-[#e40000] bg-[#fff5f5] text-[#e40000]"
                    : "border-[#d9dee6] bg-[#f8fafc] text-[#4b5563] hover:border-[#e40000]"
                }`}
              >
                All Duties <span className="ml-1 text-xs text-inherit">({duties.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveDutyTab("roadHaulage");
                  setSelectedDetail("Road Haulage Duties tab opened.");
                }}
                className={`rounded-t-md border px-4 py-3 text-sm font-black transition ${
                  activeDutyTab === "roadHaulage"
                    ? "border-[#e40000] bg-[#fff5f5] text-[#e40000]"
                    : "border-[#d9dee6] bg-[#f8fafc] text-[#4b5563] hover:border-[#e40000]"
                }`}
              >
                Road Haulage Duties <span className="ml-1 text-xs text-inherit">({duties.filter((duty) => isRoadHaulageDuty(duty.duty)).length})</span>
              </button>
            </div>
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
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showIssuesOnly}
                    onChange={(event) => {
                      setShowIssuesOnly(event.target.checked);
                      setSelectedDetail(
                        event.target.checked
                          ? "Show Issues enabled. Displaying duties with driver messages or late travel legs."
                          : "Show Issues disabled. Displaying all duties in the selected tab.",
                      );
                    }}
                    className="h-4 w-4 rounded border-[#cbd5e1]"
                  />
                  Show Issues
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

                  {visibleDuties.map((duty, index) => (
                    <div
                      key={duty.duty}
                      className={`grid min-h-[64px] grid-cols-[240px_1fr] border-b border-[#dfe5ed] ${
                        index % 2 === 0 ? "bg-[#f4f7fb]" : "bg-white"
                      }`}
                    >
                      <div className="z-20 border-r border-[#d9dee6] px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${driverMessageDutyIds.includes(duty.duty) ? "bg-[#e40000]" : "bg-[#2c80e5]"}`} />
                          <p className={`font-black ${driverMessageDutyIds.includes(duty.duty) ? "text-[#e40000]" : "text-[#374151]"}`}>{duty.duty}</p>
                          {driverMessageDutyIds.includes(duty.duty) ? (
                            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#e40000]">Driver Msg</span>
                          ) : null}
                          {isRoadHaulageDuty(duty.duty) ? (
                            <span className="inline-flex h-5 items-center rounded-sm bg-[#facc15] px-1.5 text-[10px] font-black uppercase leading-none text-[#1f2937] shadow-sm">
                              RH
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 flex items-center gap-0.5">
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
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDetail(`${duty.duty}: RHC cover popup opened.`);
                              setRhcPopupDuty(duty);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111827] text-[8px] font-black uppercase tracking-tight text-white transition hover:scale-110 hover:bg-[#e40000]"
                            aria-label={`${duty.duty} RHC cover request`}
                            title={`${duty.duty} RHC cover request`}
                          >
                            RHC
                          </button>
                        </div>
                      </div>

                      <div className="relative z-0 h-[64px]">
                        {duty.segments.map((segment, segmentIndex) => {
                          const travelTimingStatus =
                            segment.label === "Travel"
                              ? getTravelTimingStatus(duty, segmentIndex)
                              : null;

                          return (
                            <Fragment key={`${duty.duty}-${segment.label}-${segmentIndex}`}>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedDetail(`${duty.duty}: ${segment.label} segment clicked.`)
                                }
                                onMouseEnter={() => {
                                  if (segment.label === "Travel") {
                                    setHoveredTravelSegment({ duty: duty.duty, segmentIndex });
                                  }
                                }}
                                onMouseLeave={() => {
                                  if (segment.label === "Travel") {
                                    setHoveredTravelSegment((current) =>
                                      current &&
                                      current.duty === duty.duty &&
                                      current.segmentIndex === segmentIndex
                                        ? null
                                        : current,
                                    );
                                  }
                                }}
                                className={`absolute top-[18px] flex h-[24px] items-center justify-center overflow-hidden border text-[12px] font-black text-[#202733] shadow-sm transition hover:z-30 hover:scale-y-125 ${getSegmentClasses(
                                  segment.tone,
                                )}`}
                                style={{ left: `${segment.start}%`, width: `${segment.width}%` }}
                                title={`${duty.duty} ${segment.label}`}
                              >
                                <span>{segment.icon}</span>
                              </button>

                              {travelTimingStatus ? (
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none absolute top-[41px] z-[35] h-[5px] rounded-b-[2px] shadow-sm ${
                                    travelTimingStatus === "late"
                                      ? "bg-[#e40000]"
                                      : "bg-[#159447]"
                                  }`}
                                  style={{ left: `${segment.start}%`, width: `${segment.width}%` }}
                                />
                              ) : null}
                            </Fragment>
                          );
                        })}
                        {hoveredTravelSegment?.duty === duty.duty ? (() => {
                          const tooltip = buildTravelTooltip(duty, hoveredTravelSegment.segmentIndex);

                          if (!tooltip) {
                            return null;
                          }

                          return (
                            <div
                              className="pointer-events-none absolute bottom-[42px] z-40 w-[330px] -translate-x-1/2 rounded-xl bg-[#334763] px-4 py-3 text-left text-white shadow-2xl"
                              style={{ left: `${tooltip.anchor}%` }}
                            >
                              <p className="text-[15px] font-black leading-tight">{tooltip.title}</p>
                              <p className="mt-1 text-sm font-medium">Time - {tooltip.time}</p>
                              <p className="text-sm font-medium">Duration - {tooltip.duration}</p>
                              <p className="text-sm font-medium">Vehicle - {tooltip.vehicle}</p>
                              <p className="text-sm font-medium">Trailer - {tooltip.trailer}</p>
                              <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-[#334763]" />
                            </div>
                          );
                        })() : null}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between px-4 py-3 text-sm font-medium text-[#6b7280]">
                  <p>Showing 1 to {visibleDuties.length} of {visibleDuties.length} entries</p>
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

      {rhcPopupDuty && (
        <RhcDutyCoverPopup
          dutyRow={rhcPopupDuty}
          holdingOrders={rhcHoldingOrders}
          selectedHoldingIds={selectedRhcHoldingIds}
          setHoldingOrders={setRhcHoldingOrders}
          setSelectedHoldingIds={setSelectedRhcHoldingIds}
          onClose={() => setRhcPopupDuty(null)}
        />
      )}
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


type RhcActionPopup = {
  title: string;
  message: string;
  tone: "success" | "warning";
};

type RhcDutyOption = {
  duty: string;
  start: string;
  finish: string;
  startLocation: string;
  endLocation: string;
  totalTime: string;
  crossesMidnight: boolean;
};

type RhcOrder = {
  id: string;
  job: string;
  rowChecksum: string;
  modifiedOn: string;
  orderType: string;
  duty: string;
  jobTier: string;
  account: string;
  proposedRateCategory: string;
  proposedRate: string;
  date: string;
  day: string;
  week: number;
  start: string;
  finish: string;
  totalTime: string;
  startDateTime: string;
  endDateTime: string;
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
  dvsRequired: string;
  rmResponsiblePersonEmail: string;
  reason: string;
  required: string;
  notes: string;
  sendPortal: boolean;
  send318: boolean;
  submittedAt?: string;
};

const DUTY_EXECUTION_RHC_STORAGE_KEY = "mock-rhc-team-history";
const WEEK_ONE_START_DATE = "2026-03-30";
const orderTypeOptions = ["Order", "Amend", "Cancel"];
const rmPfwOptions = ["RM", "PFW"];
const planTypeOptions = ["BAU", "BT", "FLEX", "INT", "Sprinter"];
const admOptions = ["John Smith", "Peter Jones", "Sarah Jane"];
const regionOptions = [
  "Anglia",
  "Belfast",
  "London",
  "Midlands",
  "North East",
  "North West",
  "Scotland",
  "South",
  "South East",
  "South West",
];
const kitOptions = [
  "Traction Only",
  "RHC Box or C/S",
  "RHC Box",
  "RHC Box (T/L)",
  "RM DDT - Anderson Leads",
  "18/26T",
  "7.5T",
  "3.5T Van",
  "Curtainsider",
  "Rollerbed",
];
const reasonOptions = [
  "Agency Shortfall",
  "Central Plan",
  "CPC Request",
  "Local Distribution Request",
  "O Licence Restrictions",
  "Rigid Fleet",
  "Sprinter",
  "Trailer Shortage",
  "Vehicle Shortage",
];
const dutyScheduleOptions = [
  "NWH-PR-NWH-MN-NWH",
  "NWH_SDC_NWH",
  "NWH-YDC-NE-NWH",
  "NWH-MSH-NWH",
  "NWH-PRDC-NWH",
  "NWH-SWINDON-NWH",
  "NWH-SWDC-NWH",
];

const rhcJobTemplateColumns: {
  header: string;
  value: (order: RhcOrder) => string | number | boolean | undefined;
}[] = [
  { header: "(Do Not Modify) Job", value: (order) => order.job },
  { header: "(Do Not Modify) Row Checksum", value: (order) => order.rowChecksum },
  { header: "(Do Not Modify) Modified On", value: (order) => order.modifiedOn },
  { header: "Duty Number", value: (order) => order.duty },
  { header: "JobTier", value: (order) => order.jobTier },
  { header: "Account", value: (order) => order.account },
  { header: "Proposed Rate Category For Preferred Haulier", value: (order) => order.proposedRateCategory },
  { header: "Proposed Rate For Preferred Haulier", value: (order) => order.proposedRate },
  { header: "Week Number", value: (order) => order.week },
  { header: "Plan Type", value: (order) => order.planType },
  { header: "Traffic", value: (order) => order.traffic },
  { header: "Start Location", value: (order) => order.startLocation },
  { header: "Final Destination", value: (order) => order.endLocation },
  { header: "Start Date And Time", value: (order) => order.startDateTime },
  { header: "End Time", value: (order) => order.endDateTime },
  { header: "Day Of Week", value: (order) => order.day },
  { header: "Kit", value: (order) => order.kit },
  { header: "DVS Required", value: (order) => order.dvsRequired },
  { header: "Region", value: (order) => order.region },
  { header: "Duty Schedule", value: (order) => order.dutySchedule },
  { header: "Miles", value: (order) => order.miles },
  { header: "As Directed/Flex Time", value: (order) => order.asDirected },
  { header: "RMResponsiblePersonEmail", value: (order) => order.rmResponsiblePersonEmail },
];

const hiddenUiJobTemplateHeaders = new Set([
  "(Do Not Modify) Job",
  "(Do Not Modify) Row Checksum",
  "(Do Not Modify) Modified On",
  "Account",
  "Proposed Rate Category For Preferred Haulier",
  "Proposed Rate For Preferred Haulier",
]);

function RhcDutyCoverPopup({
  dutyRow,
  holdingOrders,
  selectedHoldingIds,
  setHoldingOrders,
  setSelectedHoldingIds,
  onClose,
}: {
  dutyRow: DutyRow;
  holdingOrders: RhcOrder[];
  selectedHoldingIds: string[];
  setHoldingOrders: Dispatch<SetStateAction<RhcOrder[]>>;
  setSelectedHoldingIds: Dispatch<SetStateAction<string[]>>;
  onClose: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState(getTodayDateInput());
  const [sendPortal, setSendPortal] = useState(true);
  const [send318, setSend318] = useState(true);
  const [orderType, setOrderType] = useState(orderTypeOptions[0]);
  const [admName, setAdmName] = useState(admOptions[0]);
  const [rmPfw, setRmPfw] = useState(rmPfwOptions[0]);
  const [requestedBy, setRequestedBy] = useState("Peter Finch");
  const [billingCentre, setBillingCentre] = useState("NWH");
  const [siteContactNumber, setSiteContactNumber] = useState("01925 765432");
  const [primaryReason, setPrimaryReason] = useState(reasonOptions[1]);
  const [secondReason, setSecondReason] = useState(reasonOptions[1]);
  const [region, setRegion] = useState("North West");
  const [planType, setPlanType] = useState(planTypeOptions[0]);
  const tier = "Tier 1";
  const [kit, setKit] = useState(kitOptions[0]);
  const [dutySchedule] = useState(dutyScheduleOptions[0]);
  const [confirmation, setConfirmation] = useState("");
  const [manifestFileNames, setManifestFileNames] = useState<string[]>([]);
  const [actionPopup, setActionPopup] = useState<RhcActionPopup | null>(null);

  const duty = useMemo(() => buildDutyOptionFromGanttRow(dutyRow), [dutyRow]);
  const selectedDateLabel = formatShortDate(selectedDate);
  const todayLabel = formatShortDate(getTodayDateInput());
  const dutyStartDay = getDayName(selectedDate);
  const weekNumber = getMockWeekNumber(selectedDate);

  const currentOrder = buildRhcOrder({
    duty,
    selectedDate,
    orderType,
    admName,
    rmPfw,
    requestedBy,
    billingCentre,
    siteContactNumber,
    primaryReason,
    secondReason,
    region,
    planType,
    required: "RHC cover required from Duty Execution screen.",
    tier,
    kit,
    coverReason: primaryReason,
    dutySchedule,
    notes: "Order Road Haulage Contractor from Duty Execution duty row.",
    sendPortal,
    send318,
  });

  function addToHoldingArea() {
    const nextOrder = {
      ...currentOrder,
      id: `${currentOrder.duty}-${currentOrder.date}-${Date.now()}`,
    };

    setHoldingOrders((current) => [...current, nextOrder]);
    setSelectedHoldingIds((current) => [...current, nextOrder.id]);
    setConfirmation(`${nextOrder.duty} added to the holding area. Upload the 318's if needed, then submit the selected Duty Execution RHC requests.`);
  }

  function toggleHoldingSelection(id: string) {
    setSelectedHoldingIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function removeHoldingOrder(id: string) {
    setHoldingOrders((current) => current.filter((item) => item.id !== id));
    setSelectedHoldingIds((current) => current.filter((item) => item !== id));
  }

  function sendSelectedOrders() {
    const selectedIds = [...selectedHoldingIds];
    const selectedOrders = holdingOrders.filter((order) => selectedIds.includes(order.id));

    if (selectedOrders.length === 0) {
      const message = "No duties have been selected in the holding area. Tick at least one duty before submitting this Duty Execution RHC request.";
      setConfirmation(message);
      setActionPopup({ title: "Nothing sent", message, tone: "warning" });
      return;
    }

    const missing318s = send318
      ? selectedOrders.filter((order) => !hasMatching318File(order.duty, manifestFileNames))
      : [];

    let mockUploadWarning = "";

    if (send318 && manifestFileNames.length === 0) {
      mockUploadWarning = "318's have not been uploaded. This is a mockup warning only, so the selected requests have still been sent.";
    } else if (missing318s.length > 0) {
      mockUploadWarning = `318 file name warning: ${missing318s.map((order) => order.duty).join(", ")} do not have matching 318 file names. This is a mockup warning only, so the selected requests have still been sent.`;
    }

    const submittedAt = new Date().toISOString();
    const submittedOrders = selectedOrders.map((order) => ({ ...order, submittedAt }));

    saveDutyExecutionOrders(submittedOrders);
    setHoldingOrders((current) => current.filter((order) => !selectedIds.includes(order.id)));
    setSelectedHoldingIds((current) => current.filter((id) => !selectedIds.includes(id)));

    const sentDutyList = submittedOrders.map((order) => order.duty).join(", ");
    const summary = buildRhcWeeklySubmissionSummary(submittedOrders);
    const message = buildRhcSubmissionPopupMessage({
      orders: submittedOrders,
      sentDutyList,
      summary,
      mockUploadWarning,
    });

    setActionPopup({ title: "Duty Execution RHC request submitted", message, tone: "success" });
    setConfirmation(`${submittedOrders.length} RHC request${submittedOrders.length === 1 ? "" : "s"} submitted from Duty Execution: ${sentDutyList}.`);
  }

  function exportHoldingArea() {
    exportOrdersToExcel(holdingOrders, "RHC-Holding-Area-Export");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <section className="flex max-h-[calc(100vh-2rem)] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-[#d9dee6] bg-[#f4f6f9] shadow-2xl">
        <div className="flex flex-col gap-3 border-b border-[#d9dee6] bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">RHC cover request</p>
            <h2 className="mt-1 text-2xl font-black text-[#111827]">{duty.duty}</h2>
            <p className="mt-1 text-sm font-bold text-[#6b7280]">
              Build the RHC request directly from the Duty Execution row. This is separate from the existing RHC Team order pages.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-sm font-black text-[#4b5563] transition hover:border-[#e40000]"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <section className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Step 1</p>
                <h3 className="mt-2 text-2xl font-black text-[#111827]">Request details</h3>
                <p className="mt-1 text-sm font-bold text-[#6b7280]">
                  These are the common request fields that should not need changing for every duty.
                </p>
              </div>
              <div className="rounded-lg bg-[#fff0f0] px-4 py-3 text-sm font-black text-[#e40000]">
                Today {todayLabel} • Week {weekNumber}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <RhcSelectField label="Order / Amend / Cancel" value={orderType} onChange={setOrderType} options={orderTypeOptions} />
              <RhcSelectField label="ADM" value={admName} onChange={setAdmName} options={admOptions} />
              <RhcSelectField label="RM / PFW" value={rmPfw} onChange={setRmPfw} options={rmPfwOptions} />
              <RhcTextField label="Requested by" value={requestedBy} onChange={setRequestedBy} placeholder="Planner's name" />
              <RhcTextField label="Billing centre" value={billingCentre} onChange={setBillingCentre} placeholder="Blank" />
              <RhcTextField label="Site contact number" value={siteContactNumber} onChange={setSiteContactNumber} placeholder="Blank" />
              <RhcSelectField label="Primary reason" value={primaryReason} onChange={setPrimaryReason} options={reasonOptions} />
              <RhcSelectField label="Second reason" value={secondReason} onChange={setSecondReason} options={reasonOptions} />
              <RhcSelectField label="Region" value={region} onChange={setRegion} options={regionOptions} />
              <RhcReadOnlyField label="Tier" value={tier} />
              <RhcSelectField label="Plan type" value={planType} onChange={setPlanType} options={planTypeOptions} />
              <RhcSelectField label="Kit" value={kit} onChange={setKit} options={kitOptions} />
            </div>
          </section>

          <section className="mt-4 rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Step 2</p>
                <h3 className="mt-2 text-2xl font-black text-[#111827]">Cover date</h3>
                <p className="mt-1 text-sm font-bold text-[#6b7280]">
                  Select the date the duty needs covering, then add it to the holding area.
                </p>
              </div>
              <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-[1fr_auto] xl:max-w-[760px] xl:items-end">
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-black text-[#111827]">
                    <span>Day / date</span>
                    <span aria-hidden="true">📅</span>
                  </span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                      setConfirmation("");
                    }}
                    className="mt-2 h-12 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none focus:border-[#e40000]"
                  />
                  <p className="mt-2 text-xs font-black text-[#6b7280]">
                    {dutyStartDay} • {selectedDateLabel} • Week {weekNumber}
                  </p>
                </label>
                <button
                  type="button"
                  onClick={addToHoldingArea}
                  className="h-12 rounded-lg bg-[#e40000] px-6 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#b80000]"
                >
                  Add Duty To Holding Area
                </button>
              </div>
            </div>

            {confirmation && (
              <section className="mt-4 rounded-lg border-2 border-[#157347] bg-[#ecfdf3] p-4 text-sm font-black leading-6 text-[#157347]">
                {confirmation}
              </section>
            )}
          </section>

          <section className="mt-4 rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Step 3</p>
                <h3 className="mt-2 text-2xl font-black text-[#111827]">Holding area</h3>
                <p className="mt-1 text-sm font-bold text-[#6b7280]">
                  Select the requests, upload the 318&apos;s, then submit them through this separate Duty Execution RHC route.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,360px)_auto_auto_auto] lg:items-center">
                <section className="rounded-lg border border-[#d9dee6] bg-[#f8fafc] px-4 py-3">
                  <p className="text-sm font-black text-[#111827]">Send data to</p>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-[#374151]">
                      <input checked={sendPortal} onChange={(event) => setSendPortal(event.target.checked)} type="checkbox" className="h-4 w-4" />
                      RHC Portal
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold text-[#374151]">
                      <input checked={send318} onChange={(event) => setSend318(event.target.checked)} type="checkbox" className="h-4 w-4" />
                      318 Data
                    </label>
                  </div>
                  <p className="mt-2 rounded-md border border-[#f59e0b] bg-[#fffbeb] px-2 py-1 text-[11px] font-black leading-5 text-[#92400e]">
                    Mock warning: 318 file names should match the selected duty number. This will not stop the mock send.
                  </p>
                </section>

                <button
                  type="button"
                  onClick={exportHoldingArea}
                  className="rounded-lg border border-[#111827] bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#111827] transition hover:bg-[#f3f4f6]"
                >
                  Export To Excel
                </button>

                <label className="cursor-pointer rounded-lg border border-[#e40000] bg-white px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-[#e40000] transition hover:bg-[#fff0f0]">
                  Upload 318&apos;s
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const files = Array.from(event.currentTarget.files ?? []).map((file: File) => file.name);
                      setManifestFileNames(files);
                      setConfirmation(files.length > 0 ? `${files.length} 318 file${files.length === 1 ? "" : "s"} selected.` : "");
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={sendSelectedOrders}
                  className="rounded-lg bg-[#111827] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#252c33]"
                >
                  Submit Selected RHC Request
                </button>
              </div>
            </div>

            {manifestFileNames.length > 0 && (
              <p className="mt-3 rounded-lg border border-[#d9dee6] bg-[#f8fafc] px-3 py-2 text-xs font-black text-[#6b7280]">
                318 file{manifestFileNames.length === 1 ? "" : "s"} uploaded: {manifestFileNames.join(", ")}
              </p>
            )}

            <div className="mt-4 overflow-x-auto rounded-lg border border-[#d9dee6]">
              <table className="min-w-[2000px] w-full border-collapse text-left text-sm">
                <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.1em] text-[#6b7280]">
                  <tr>
                    <th className="px-3 py-3">Send</th>
                    {rhcJobTemplateColumns.map((column) => (
                      <th key={column.header} className={rhcJobTemplateColumnClass(column.header)}>
                        {column.header}
                      </th>
                    ))}
                    <th className="px-3 py-3">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingOrders.length === 0 ? (
                    <tr>
                      <td colSpan={rhcJobTemplateColumns.length + 2} className="px-3 py-8 text-center text-sm font-bold text-[#6b7280]">
                        No duties in the holding area yet.
                      </td>
                    </tr>
                  ) : (
                    holdingOrders.map((order) => (
                      <tr key={order.id} className="border-t border-[#d9dee6] font-bold text-[#374151]">
                        <td className="px-3 py-3">
                          <input
                            checked={selectedHoldingIds.includes(order.id)}
                            onChange={() => toggleHoldingSelection(order.id)}
                            type="checkbox"
                            className="h-4 w-4"
                          />
                        </td>
                        {rhcJobTemplateColumns.map((column) => (
                          <td
                            key={`${order.id}-${column.header}`}
                            className={rhcJobTemplateColumnClass(
                              column.header,
                              column.header === "Duty Number" ? "font-black text-[#111827]" : "",
                            )}
                          >
                            {formatRhcTableCell(column.value(order))}
                          </td>
                        ))}
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => removeHoldingOrder(order.id)}
                            className="rounded-md border border-[#e40000] px-3 py-2 text-xs font-black uppercase text-[#e40000]"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>

      {actionPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <section
            className={`w-full max-w-2xl rounded-2xl border-2 bg-white p-6 shadow-2xl ${
              actionPopup.tone === "success" ? "border-[#157347]" : "border-[#f59e0b]"
            }`}
          >
            <p
              className={`text-xs font-black uppercase tracking-[0.16em] ${
                actionPopup.tone === "success" ? "text-[#157347]" : "text-[#92400e]"
              }`}
            >
              {actionPopup.title}
            </p>
            <h2 className="mt-3 text-2xl font-black text-[#111827]">
              {actionPopup.tone === "success" ? "Requests sent successfully" : "Action needed"}
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm font-bold leading-6 text-[#374151]">{actionPopup.message}</p>
            <button
              type="button"
              onClick={() => setActionPopup(null)}
              className={`mt-5 w-full rounded-lg px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition ${
                actionPopup.tone === "success" ? "bg-[#157347] hover:bg-[#0f5f39]" : "bg-[#f59e0b] hover:bg-[#d97706]"
              }`}
            >
              OK
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function RhcTextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none focus:border-[#e40000]"
      />
    </label>
  );
}

function RhcReadOnlyField({ label, value }: { label: string; value: string }) {
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

function RhcSelectField({
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
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function buildDutyOptionFromGanttRow(row: DutyRow): RhcDutyOption {
  const firstSegmentStart = Math.min(...row.segments.map((segment) => segment.start));
  const lastSegmentEnd = Math.max(...row.segments.map((segment) => segment.start + segment.width));
  const start = formatTimelinePercentAsTime(firstSegmentStart);
  const finish = formatTimelinePercentAsTime(lastSegmentEnd);
  const duration = calculateRhcDutyDuration(start, finish);

  return {
    duty: row.duty,
    start,
    finish,
    startLocation: "North West Hub",
    endLocation: "North West Hub",
    totalTime: duration.label,
    crossesMidnight: duration.crossesMidnight,
  };
}

function formatTimelinePercentAsTime(percent: number) {
  const timelineStartMinutes = 60;
  const timelineLengthMinutes = 16 * 60;
  const roundedMinutes = Math.round((timelineStartMinutes + (percent / 100) * timelineLengthMinutes) / 5) * 5;
  const normalisedMinutes = ((roundedMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalisedMinutes / 60);
  const minutes = normalisedMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function rhcJobTemplateColumnClass(header: string, extra = "") {
  return [
    "px-3 py-3",
    hiddenUiJobTemplateHeaders.has(header) ? "hidden" : "",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatRhcTableCell(value: string | number | boolean | undefined) {
  return String(value ?? "");
}

function hasMatching318File(duty: string, fileNames: string[]) {
  const dutyName = normalise318FileName(duty);

  return fileNames.some((fileName) => {
    const normalisedFileName = normalise318FileName(fileName);
    return normalisedFileName === dutyName || normalisedFileName.includes(dutyName);
  });
}

function normalise318FileName(value: string) {
  return value
    .replace(/\.[^/.]+$/, "")
    .trim()
    .toLowerCase();
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
  link.download = `${fileName}-${formatDateForInput(new Date())}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function buildRhcWeeklySubmissionSummary(orders: RhcOrder[]) {
  const weeklySummary = new Map<number, { duties: number; minutes: number }>();

  orders.forEach((order) => {
    const current = weeklySummary.get(order.week) ?? { duties: 0, minutes: 0 };
    weeklySummary.set(order.week, {
      duties: current.duties + 1,
      minutes: current.minutes + parseRhcTotalTimeToMinutes(order.totalTime),
    });
  });

  return [...weeklySummary.entries()]
    .sort(([weekA], [weekB]) => weekA - weekB)
    .map(([week, summary]) => ({ week, ...summary }));
}

function buildRhcSubmissionPopupMessage({
  orders,
  sentDutyList,
  summary,
  mockUploadWarning,
}: {
  orders: RhcOrder[];
  sentDutyList: string;
  summary: { week: number; duties: number; minutes: number }[];
  mockUploadWarning: string;
}) {
  const orderCountLabel = `${orders.length} dut${orders.length === 1 ? "y" : "ies"}`;
  const summaryLines = summary
    .map((item) => `Week ${item.week}: ${item.duties} dut${item.duties === 1 ? "y" : "ies"} • ${formatRhcMinutesAsHours(item.minutes)}`)
    .join("\n");

  const lines = [
    "The duties will be sent directly to the RHC Portal.",
    "The RHC Team will assume this is authorised by your ADM and process the order.",
    "",
    `Submission summary: ${orderCountLabel}`,
    summaryLines,
    "",
    `Duties selected: ${sentDutyList}.`,
  ];

  if (mockUploadWarning) {
    lines.push("", mockUploadWarning);
  }

  return lines.join("\n");
}

function parseRhcTotalTimeToMinutes(totalTime: string) {
  const match = totalTime.match(/(\d+)h\s*(\d+)m/i);

  if (!match) {
    return 0;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function formatRhcMinutesAsHours(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function escapeExcelCell(value: string | number | boolean | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildRhcOrder({
  duty,
  selectedDate,
  orderType,
  admName,
  rmPfw,
  requestedBy,
  billingCentre,
  siteContactNumber,
  primaryReason,
  secondReason,
  region,
  planType,
  required,
  tier,
  kit,
  coverReason,
  dutySchedule,
  notes,
  sendPortal,
  send318,
}: {
  duty: RhcDutyOption;
  selectedDate: string;
  orderType: string;
  admName: string;
  rmPfw: string;
  requestedBy: string;
  billingCentre: string;
  siteContactNumber: string;
  primaryReason: string;
  secondReason: string;
  region: string;
  planType: string;
  required: string;
  tier: string;
  kit: string;
  coverReason: string;
  dutySchedule: string;
  notes: string;
  sendPortal: boolean;
  send318: boolean;
}): RhcOrder {
  const week = getMockWeekNumber(selectedDate);
  const day = getDayName(selectedDate);
  const traffic = duty.duty.startsWith("WAVOC") ? "WAVOC" : "NWH";

  return {
    id: `${duty.duty}-${selectedDate}`,
    job: "",
    rowChecksum: "",
    modifiedOn: "",
    orderType,
    duty: duty.duty,
    jobTier: tier,
    account: billingCentre,
    proposedRateCategory: "Other",
    proposedRate: "0",
    date: selectedDate,
    day,
    week,
    start: duty.start,
    finish: duty.finish,
    totalTime: duty.totalTime,
    startDateTime: formatRhcDateTime(selectedDate, duty.start),
    endDateTime: formatRhcDateTime(selectedDate, duty.finish, duty.crossesMidnight),
    startLocation: duty.startLocation,
    endLocation: duty.endLocation,
    traffic,
    planType,
    dutySchedule,
    miles: seededRhcRange(`${duty.duty}-${selectedDate}-miles`, 100, 300),
    asDirected: seededRhcTime(`${duty.duty}-${selectedDate}-as-directed`, 0, 360),
    admName,
    rmPfw,
    requestedBy,
    billingCentre,
    siteContactNumber,
    primaryReason,
    secondReason,
    region,
    tier,
    kit,
    dvsRequired: "No",
    rmResponsiblePersonEmail: "rhc.team@royalmail.com",
    reason: coverReason,
    required,
    notes,
    sendPortal,
    send318,
  };
}

function saveDutyExecutionOrders(orders: RhcOrder[]) {
  if (typeof window === "undefined") {
    return;
  }

  const current = readDutyExecutionOrdersFromStorage();
  window.localStorage.setItem(DUTY_EXECUTION_RHC_STORAGE_KEY, JSON.stringify([...orders, ...current]));
}

function readDutyExecutionOrdersFromStorage(): RhcOrder[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawHistory = window.localStorage.getItem(DUTY_EXECUTION_RHC_STORAGE_KEY);
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
      window.localStorage.setItem(DUTY_EXECUTION_RHC_STORAGE_KEY, JSON.stringify(retainedOrders));
    }

    return retainedOrders;
  } catch {
    return [];
  }
}

function calculateRhcDutyDuration(start: string, finish: string) {
  const startMinutes = rhcTimeToMinutes(start);
  const finishMinutes = rhcTimeToMinutes(finish);
  const crossesMidnight = finishMinutes < startMinutes;
  const totalMinutes = (crossesMidnight ? finishMinutes + 24 * 60 : finishMinutes) - startMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    crossesMidnight,
    label: `${hours}h ${String(minutes).padStart(2, "0")}m`,
  };
}

function rhcTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function parseDateInput(dateInput: string) {
  const [year, month, day] = dateInput.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatShortDate(dateInput: string) {
  const date = parseDateInput(dateInput);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
}

function getTodayDateInput() {
  return formatDateForInput(new Date());
}

function getDayName(dateInput: string) {
  return parseDateInput(dateInput).toLocaleDateString("en-GB", { weekday: "long" });
}

function getMockWeekNumber(dateInput: string) {
  const selectedDate = parseDateInput(dateInput);
  const weekOneStart = parseDateInput(WEEK_ONE_START_DATE);
  const selectedStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const baseStart = new Date(weekOneStart.getFullYear(), weekOneStart.getMonth(), weekOneStart.getDate());
  const daysDifference = Math.floor((selectedStart.getTime() - baseStart.getTime()) / (24 * 60 * 60 * 1000));
  const weekIndex = Math.floor(daysDifference / 7);

  return ((weekIndex % 52) + 52) % 52 + 1;
}

function formatRhcDateTime(dateInput: string, time: string, addDay = false) {
  const date = parseDateInput(dateInput);

  if (addDay) {
    date.setDate(date.getDate() + 1);
  }

  return `${formatShortDate(formatDateForInput(date))} ${time}`;
}

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function seededRhcRange(seed: string, min: number, max: number) {
  const value = hashRhcSeed(seed);
  return min + (value % (max - min + 1));
}

function seededRhcTime(seed: string, minMinutes: number, maxMinutes: number) {
  const totalMinutes = seededRhcRange(seed, minMinutes, maxMinutes);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function hashRhcSeed(seed: string) {
  return seed.split("").reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) >>> 0;
  }, 7);
}

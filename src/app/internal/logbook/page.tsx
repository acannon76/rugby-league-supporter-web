"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DriverName from "../DriverName";
import VehicleCheckTimer from "../vehicle-checks/VehicleCheckTimer";
import {
  altLogbookStorageKey,
  formatDateTime,
  type AltLogbookEntry,
} from "../vehicle-checks-altData";
import { motiveLogbookHistoryStorageKey } from "../vehicle-checks-alt/motiveCheckData";

const DRIVER_NAMES = [
  "Andrew Cannon",
  "Sarah Wilson",
  "Michael Turner",
  "James Patel",
  "Emma Roberts",
  "David Thompson",
  "Rachel Jones",
  "Paul Williams",
  "Claire Morgan",
  "Stephen Brown",
  "Laura Evans",
  "Mark Taylor",
];

const DEFECT_EXAMPLES = [
  "Tyres: Nearside rear tyre tread low",
  "Electrics: Offside marker light not working",
  "Body: Minor damage to nearside cab step",
  "Brakes: Brake warning indicator illuminated",
  "Windows: Windscreen washer jet blocked",
  "Engine: Engine warning light reported",
  "Suspension: Air suspension warning displayed",
];

const FIX_SUMMARIES = [
  "Tyre replaced and pressure checked",
  "Marker light bulb replaced and tested",
  "Cab step secured and panel edge repaired",
  "Brake sensor reset and system re-tested",
  "Washer jet cleaned and flow restored",
  "Diagnostic check completed and fault cleared",
  "Air line inspected and suspension recalibrated",
];

const FIXED_BY_NAMES = [
  "Wigan Workshop",
  "Fleet Maintenance Team",
  "Mobile Technician A. Hughes",
  "Night Shift Workshop",
  "Transport Engineering",
  "Workshop Controller S. Green",
  "Regional Fleet Support",
];

function createHistoricalEntries(): AltLogbookEntry[] {
  const entries: AltLogbookEntry[] = [];
  const newestHistoricalStart = new Date(2026, 7, 6, 12, 25).getTime();
  let mileage = 684155;

  for (let index = 0; index < 60; index += 1) {
    const startTimestamp = newestHistoricalStart - index * 18 * 60 * 60 * 1000;
    const durationMinutes = 9 + (index % 9);
    const endTimestamp = startTimestamp + durationMinutes * 60 * 1000;
    const hasDefects = index % 8 === 3 || index % 13 === 6;
    const defectText = DEFECT_EXAMPLES[index % DEFECT_EXAMPLES.length];
    const mileageStart = mileage - (index % 4 === 0 ? 1 : 0);
    const mileageEnd = mileageStart + 1 + (index % 3);
    mileage = mileageStart - 42 - (index % 11);
    const pmt = hasDefects ? `PMT10${String(520 + index).padStart(3, "0")}` : "";

    entries.push({
      startDateTime: formatDateTime(new Date(startTimestamp)),
      endDateTime: formatDateTime(new Date(endTimestamp)),
      startTimestamp,
      endTimestamp,
      driverName: DRIVER_NAMES[index % DRIVER_NAMES.length],
      mileageStart: `${mileageStart.toLocaleString("en-GB")} km`,
      mileageEnd: `${mileageEnd.toLocaleString("en-GB")} km`,
      hasDefects,
      defectsSummary: hasDefects ? [defectText] : ["NIL Defects"],
      pmts: hasDefects ? [pmt] : [],
    });
  }

  return entries;
}

function parseDisplayDateTime(value: string | undefined) {
  if (!value) {
    return 0;
  }

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) {
    return 0;
  }

  const [, day, month, year, hour, minute] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  ).getTime();
}

function normaliseStoredEntry(entry: Partial<AltLogbookEntry>): AltLogbookEntry {
  const fallbackEndTimestamp =
    entry.endTimestamp || parseDisplayDateTime(entry.endDateTime || entry.completedAt) || Date.now();
  const fallbackStartTimestamp =
    entry.startTimestamp || parseDisplayDateTime(entry.startDateTime) || fallbackEndTimestamp - 12 * 60 * 1000;

  return {
    startDateTime:
      entry.startDateTime || formatDateTime(new Date(fallbackStartTimestamp)),
    endDateTime:
      entry.endDateTime || entry.completedAt || formatDateTime(new Date(fallbackEndTimestamp)),
    startTimestamp: fallbackStartTimestamp,
    endTimestamp: fallbackEndTimestamp,
    driverName: entry.driverName || "Mock Driver",
    registration: entry.registration || "PA25 RTY",
    mileageStart: entry.mileageStart || "684,218 km",
    mileageEnd: entry.mileageEnd || "Not entered",
    hasDefects: Boolean(entry.hasDefects),
    decision: entry.decision,
    defectsSummary:
      entry.defectsSummary && entry.defectsSummary.length > 0
        ? entry.defectsSummary
        : ["NIL Defects"],
    pmts: entry.pmts || [],
    photoEvidence: entry.photoEvidence || [],
  };
}

function getOutcomeContent(entry: AltLogbookEntry, rowIndex: number) {
  if (entry.decision === "monitor") {
    return {
      title: "OK to continue with duty",
      summary: "Amber issue recorded under PMT for review at the next service.",
      fixedBy: "Awaiting next service",
    };
  }

  if (entry.decision === "stop") {
    return {
      title: "Do not use vehicle — return to transport office",
      summary: "Red defect recorded under PMT. Speak to the manager before using the vehicle.",
      fixedBy: "Awaiting manager / workshop action",
    };
  }

  if (!entry.hasDefects) {
    return {
      title: "OK to continue with duty",
      summary: "No fix required after driver vehicle check.",
      fixedBy: `Checked by ${entry.driverName}`,
    };
  }

  if (rowIndex === 0) {
    return {
      title: "Return to / contact office",
      summary: "PMT sent to manager and repair action is awaiting allocation.",
      fixedBy: "Pending manager / workshop action",
    };
  }

  const defectIndex = rowIndex % FIX_SUMMARIES.length;
  return {
    title: "Return to / contact office",
    summary: FIX_SUMMARIES[defectIndex],
    fixedBy: `Fixed by ${FIXED_BY_NAMES[defectIndex]}`,
  };
}

export default function LogbookPage() {
  // LOGBOOK_STATUS_LAYOUT_V2
  const [currentEntry, setCurrentEntry] = useState<AltLogbookEntry | null>(null);
  const [savedChecks, setSavedChecks] = useState<AltLogbookEntry[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const latest = window.localStorage.getItem(altLogbookStorageKey);
        if (latest) setCurrentEntry(normaliseStoredEntry(JSON.parse(latest)));
        const raw = window.localStorage.getItem(motiveLogbookHistoryStorageKey);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) setSavedChecks(parsed.map(normaliseStoredEntry));
      } catch {
        // Invalid mock history should not prevent the Logbook opening.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const logbookEntries = useMemo(
    () =>
      [...savedChecks,
        ...(currentEntry && !savedChecks.some((entry) => entry.endTimestamp === currentEntry.endTimestamp) ? [currentEntry] : []),
        ...createHistoricalEntries(),
      ].sort((left, right) => right.startTimestamp - left.startTimestamp),
    [currentEntry, savedChecks]
  );

  const currentCheckState =
    currentEntry === null ? "pending" : currentEntry.decision === "monitor" ? "monitor" : currentEntry.hasDefects ? "failed" : "passed";

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-3 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-white bg-[#7d0017] text-base font-black text-white">
              HGV
            </div>

            <div>
              <h1 className="text-3xl font-black leading-none text-white sm:text-4xl">
                Logbook
              </h1>
              <p className="mt-1 text-xs font-bold leading-5 text-[#ffecef] sm:text-sm">
                Vehicle check results are shown newest first.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <VehicleCheckTimer />

            <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ffd9df]">
                Driver
              </p>
              <p className="text-sm font-black text-white"><DriverName /></p>
            </div>

            <Link
              href="/internal/app-ideas"
              className="px-2 text-sm font-black text-white no-underline"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 pt-4 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-2 sm:grid-cols-3">
          <Link
            href="/internal/vehicle-checks-alt"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[16px] bg-[#18243a] px-4 py-3 text-sm font-black text-white no-underline shadow-sm transition hover:bg-[#0f172a]"
          >
            Motive Unit Checks
          </Link>

          <button
            type="button"
            disabled
            title="Trailer check mockup to be added"
            className="min-h-[44px] cursor-not-allowed rounded-[16px] border border-[#d6dce5] bg-white px-4 py-3 text-sm font-black text-[#64748b] opacity-80"
          >
            Trailer Checks
          </button>

          <button
            type="button"
            disabled
            title="Rigid check mockup to be added"
            className="min-h-[44px] cursor-not-allowed rounded-[16px] border border-[#d6dce5] bg-white px-4 py-3 text-sm font-black text-[#64748b] opacity-80"
          >
            Rigid Checks
          </button>
        </div>
      </section>

      <section className="px-4 py-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px] space-y-4">
          <div
            className={`rounded-[20px] border px-5 py-4 shadow-sm ${
              currentCheckState === "passed"
                ? "border-[#b9e6c8] bg-[#eaf8ef]"
                : currentCheckState === "monitor"
                ? "border-[#f8df8d] bg-[#fff7e6]"
                : "border-[#f3c2cb] bg-[#fff1f3]"
            }`}
          >
            <p
              className={`text-xs font-black uppercase tracking-[0.18em] ${
                currentCheckState === "passed" ? "text-[#078a3d]" : currentCheckState === "monitor" ? "text-[#92400e]" : "text-[#b00020]"
              }`}
            >
              {currentCheckState === "pending"
                ? "Checks required"
                : currentCheckState === "failed"
                ? "Defect found"
                : currentCheckState === "monitor"
                ? "Amber issue recorded"
                : "Checks complete"}
            </p>

            <h2 className="mt-1 text-2xl font-black text-[#18243a]">
              {currentCheckState === "pending"
                ? "Driver must complete Checks"
                : currentCheckState === "failed"
                ? "Do not use vehicle — report to Office"
                : "Driver OK to continue"}
            </h2>

            <p className="mt-2 text-sm font-bold leading-5 text-[#18243a]">
              {currentCheckState === "pending"
                ? "The current vehicle check has not been completed. Complete the checks before continuing the duty."
                : currentCheckState === "failed"
                ? "A RED defect has been recorded. Do not use the vehicle. Return to the transport office and speak to your manager."
                : currentCheckState === "monitor"
                ? "An AMBER issue has been recorded under a PMT. You may continue; it will be reviewed at the next service."
                : "Vehicle checks are complete and no defects were found. The driver is clear to continue with duty."}
            </p>
          </div>

          <section className="overflow-hidden rounded-[24px] border border-[#d6dce5] bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-[#d6dce5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
                  Vehicle check history
                </p>
                <h2 className="mt-1 text-2xl font-black text-[#18243a]">
                  {logbookEntries.length} completed checks
                </h2>
              </div>

              <p className="text-xs font-bold text-[#64748b]">
                Sorted newest to oldest by Start Time
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full table-fixed border-collapse text-left">
                <colgroup>
                  <col className="w-[48px]" />
                  <col className="w-[120px]" />
                  <col className="w-[125px]" />
                  <col className="w-[125px]" />
                  <col className="w-[105px]" />
                  <col className="w-[105px]" />
                  <col className="w-[105px]" />
                  <col className="w-[170px]" />
                  <col className="w-[95px]" />
                  <col />
                </colgroup>
                <thead className="bg-[#18243a] text-white">
                  <tr>
                    <TableHeader>
                      <span className="sr-only">Vehicle</span>
                    </TableHeader>
                    <TableHeader>Vehicle / Trailer</TableHeader>
                    <TableHeader>Start Time</TableHeader>
                    <TableHeader>End Time</TableHeader>
                    <TableHeader>Driver</TableHeader>
                    <TableHeader>Mileage Start</TableHeader>
                    <TableHeader>Mileage End</TableHeader>
                    <TableHeader>Defects Found</TableHeader>
                    <TableHeader>PMT</TableHeader>
                    <TableHeader>Outcome / Fix Summary</TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {logbookEntries.map((entry, index) => (
                    <tr
                      key={`${entry.startTimestamp}-${entry.driverName}-${index}`}
                      className={`border-b border-[#e2e8f0] ${
                        index === 0 ? "bg-[#fff7e6]" : index % 2 === 0 ? "bg-[#fbfcfd]" : "bg-white"
                      }`}
                    >
                      <td className="w-[54px] border-r border-[#e2e8f0] px-2 py-3 align-top">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fbe7eb] text-[#b00020]"
                          title="Vehicle check"
                          aria-label="Vehicle check"
                        >
                          <TruckIcon />
                        </div>
                      </td>
                      <TableCell strong>{entry.registration || "PA25 RTY"}</TableCell>
                      <TableCell>
                        <DateTimeStack value={entry.startDateTime} />
                      </TableCell>
                      <TableCell>
                        <DateTimeStack value={entry.endDateTime} />
                      </TableCell>
                      <TableCell strong>{entry.driverName}</TableCell>
                      <TableCell>{entry.mileageStart}</TableCell>
                      <TableCell>{entry.mileageEnd}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block max-w-full break-words whitespace-normal rounded-full px-3 py-1 text-xs font-black ${
                            entry.hasDefects
                              ? entry.decision === "monitor" ? "bg-[#fff3cd] text-[#92400e]" : "bg-[#ffe6eb] text-[#b00020]"
                              : "bg-[#e8f7ee] text-[#078a3d]"
                          }`}
                        >
                          {entry.hasDefects
                            ? entry.defectsSummary.join("; ")
                            : "NIL Defects"}
                        </span>
                        {entry.photoEvidence?.map((photo) => <a key={photo.check} href={photo.dataUrl} target="_blank" rel="noreferrer" className="mt-2 block text-xs font-bold text-[#b00020] underline">View photo for {photo.check}</a>)}
                      </TableCell>
                      <TableCell>{entry.pmts.length > 0 ? entry.pmts.join(", ") : "-"}</TableCell>
                      <TableCell>
                        {(() => {
                          const outcome = getOutcomeContent(entry, index);
                          return (
                            <div className="min-w-0 space-y-1 break-words whitespace-normal">
                              <p className="break-words font-black leading-5 text-[#18243a]">{outcome.title}</p>
                              <p className="break-words text-xs font-bold leading-5 text-[#64748b]">{outcome.summary}</p>
                              <p className="break-words text-xs font-black leading-5 text-[#b00020]">{outcome.fixedBy}</p>
                            </div>
                          );
                        })()}
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/internal/vehicle-checks-alt"
              className="inline-flex items-center justify-center rounded-[24px] bg-[#18243a] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white no-underline shadow-sm transition hover:bg-[#0f172a]"
            >
              Continue to Vehicle Checks
            </Link>

            <Link
              href="/internal/app-ideas"
              className="inline-flex items-center justify-center rounded-[24px] bg-[#b00020] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white no-underline shadow-sm transition hover:bg-[#7d0017]"
            >
              Finish
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function DateTimeStack({ value }: { value: string }) {
  const [date, ...timeParts] = value.trim().split(/\s+/);
  const time = timeParts.join(" ");

  return (
    <span className="block leading-5">
      <span className="block font-black text-[#18243a]">{date}</span>
      {time && <span className="block font-bold text-[#475569]">{time}</span>}
    </span>
  );
}

function TruckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h10v9H3z" />
      <path d="M13 9h4l4 4v2h-8z" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M3 15h2m6 0h4m4 0h2" />
    </svg>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-normal break-words border-r border-white/10 px-3 py-3 text-[10px] font-black uppercase leading-4 tracking-[0.10em] last:border-r-0">
      {children}
    </th>
  );
}

function TableCell({
  children,
  strong = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <td
      className={`min-w-0 break-words whitespace-normal border-r border-[#e2e8f0] px-3 py-3 align-top text-sm last:border-r-0 ${
        strong ? "font-black text-[#18243a]" : "font-bold text-[#475569]"
      }`}
    >
      {children}
    </td>
  );
}

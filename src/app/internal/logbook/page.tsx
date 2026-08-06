"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DriverName from "../DriverName";
import {
  altLogbookStorageKey,
  formatDateTime,
  type AltLogbookEntry,
} from "../vehicle-checks-altData";

const DEFAULT_START_TS = new Date(2026, 7, 6, 17, 47).getTime();
const DEFAULT_END_TS = new Date(2026, 7, 6, 17, 59).getTime();

const emptyEntry: AltLogbookEntry = {
  startDateTime: formatDateTime(new Date(DEFAULT_START_TS)),
  endDateTime: formatDateTime(new Date(DEFAULT_END_TS)),
  startTimestamp: DEFAULT_START_TS,
  endTimestamp: DEFAULT_END_TS,
  driverName: "Mock Driver",
  mileageStart: "684,218 km",
  mileageEnd: "Not entered",
  hasDefects: false,
  defectsSummary: ["NIL Defects"],
  pmts: [],
};

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
    mileageStart: entry.mileageStart || "684,218 km",
    mileageEnd: entry.mileageEnd || "Not entered",
    hasDefects: Boolean(entry.hasDefects),
    defectsSummary:
      entry.defectsSummary && entry.defectsSummary.length > 0
        ? entry.defectsSummary
        : ["NIL Defects"],
    pmts: entry.pmts || [],
  };
}

export default function LogbookPage() {
  const [currentEntry] = useState<AltLogbookEntry>(() => {
    if (typeof window === "undefined") {
      return emptyEntry;
    }

    const saved = window.localStorage.getItem(altLogbookStorageKey);
    return saved ? normaliseStoredEntry(JSON.parse(saved)) : emptyEntry;
  });

  const logbookEntries = useMemo(
    () =>
      [currentEntry, ...createHistoricalEntries()].sort(
        (left, right) => right.startTimestamp - left.startTimestamp
      ),
    [currentEntry]
  );

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#7d0017] text-lg font-black text-white">
              HGV
            </div>

            <div>
              <p className="text-lg font-black leading-none text-white">Logbook</p>
              <p className="text-sm font-black leading-none text-[#ffd9df]">
                DriverOS Concept
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2">
              <p className="text-xs font-black uppercase tracking-widest text-[#ffd9df]">
                Driver
              </p>
              <p className="text-base font-black text-white"><DriverName /></p>
            </div>

            <Link href="/internal/vehicle-checks-alt" className="text-sm font-black text-white no-underline">
              Back
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#b00020] px-4 py-6 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">
            Driver daily check results
          </p>

          <h1 className="text-[42px] font-black leading-[0.95] sm:text-[64px]">
            Logbook
          </h1>

          <p className="mt-4 max-w-[850px] text-sm font-bold leading-6 text-[#ffecef] sm:text-base">
            Vehicle check results are displayed as one row per completed check. The latest Start Date and Time appears first.
          </p>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px] space-y-6">
          <div
            className={`rounded-[24px] border p-5 shadow-sm ${
              currentEntry.hasDefects
                ? "border-[#f3c2cb] bg-[#fff1f3]"
                : "border-[#b9e6c8] bg-[#eaf8ef]"
            }`}
          >
            <p
              className={`text-xs font-black uppercase tracking-[0.18em] ${
                currentEntry.hasDefects ? "text-[#b00020]" : "text-[#078a3d]"
              }`}
            >
              {currentEntry.hasDefects
                ? "Manager action required"
                : "Driver OK to continue with duty"}
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#18243a]">
              {currentEntry.hasDefects
                ? "PMT sent to manager to process"
                : "Vehicle checks completed with no defects"}
            </h2>

            <p className="mt-3 text-sm font-bold leading-6 text-[#18243a]">
              {currentEntry.hasDefects
                ? "The defect details have been sent to Vehicle History. The driver must return to or contact the office for further instruction."
                : "No defects were found. The driver is clear to continue with duty."}
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
                Sorted newest to oldest by Start Date and Time
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1280px] w-full border-collapse text-left">
                <thead className="bg-[#18243a] text-white">
                  <tr>
                    <TableHeader>Start Date and Time</TableHeader>
                    <TableHeader>End Date and Time</TableHeader>
                    <TableHeader>Driver</TableHeader>
                    <TableHeader>Mileage Start</TableHeader>
                    <TableHeader>Mileage End</TableHeader>
                    <TableHeader>Defects Found</TableHeader>
                    <TableHeader>PMT</TableHeader>
                    <TableHeader>Outcome</TableHeader>
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
                      <TableCell strong>{entry.startDateTime}</TableCell>
                      <TableCell>{entry.endDateTime}</TableCell>
                      <TableCell strong>{entry.driverName}</TableCell>
                      <TableCell>{entry.mileageStart}</TableCell>
                      <TableCell>{entry.mileageEnd}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                            entry.hasDefects
                              ? "bg-[#ffe6eb] text-[#b00020]"
                              : "bg-[#e8f7ee] text-[#078a3d]"
                          }`}
                        >
                          {entry.hasDefects
                            ? entry.defectsSummary.join("; ")
                            : "NIL Defects"}
                        </span>
                      </TableCell>
                      <TableCell>{entry.pmts.length > 0 ? entry.pmts.join(", ") : "-"}</TableCell>
                      <TableCell>
                        {entry.hasDefects
                          ? "Return to / contact office"
                          : "OK to continue with duty"}
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/internal/vehicle-check-history"
              className="inline-flex items-center justify-center rounded-[24px] bg-[#18243a] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white no-underline shadow-sm transition hover:bg-[#0f172a]"
            >
              View Vehicle History
            </Link>

            <Link
              href="/internal/vehicle-check-type"
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

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap border-r border-white/10 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] last:border-r-0">
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
      className={`border-r border-[#e2e8f0] px-4 py-3 align-top text-sm last:border-r-0 ${
        strong ? "font-black text-[#18243a]" : "font-bold text-[#475569]"
      }`}
    >
      {children}
    </td>
  );
}

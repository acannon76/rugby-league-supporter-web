"use client";

import Link from "next/link";
import { useState } from "react";
import DriverName from "../DriverName";
import {
  altLogbookStorageKey,
  type AltLogbookEntry,
} from "../vehicle-checks-altData";

const emptyEntry: AltLogbookEntry = {
  completedAt: "Not available",
  driverName: "Mock Driver",
  mileageStart: "684,218 km",
  mileageEnd: "Not entered",
  hasDefects: false,
  defectsSummary: ["NIL Defects"],
  pmts: [],
};

export default function LogbookPage() {
  const [entry] = useState<AltLogbookEntry>(() => {
    if (typeof window === "undefined") {
      return emptyEntry;
    }

    const saved = window.localStorage.getItem(altLogbookStorageKey);
    return saved ? JSON.parse(saved) : emptyEntry;
  });

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[950px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="mx-auto max-w-[950px]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">
            Driver daily check result
          </p>

          <h1 className="text-[42px] font-black leading-[0.95] sm:text-[64px]">
            Logbook
          </h1>

          <p className="mt-4 max-w-[760px] text-sm font-bold leading-6 text-[#ffecef] sm:text-base">
            The completed vehicle check has been summarised below for the driver record.
          </p>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[950px] space-y-6">
          <div
            className={`rounded-[24px] border p-5 shadow-sm ${
              entry.hasDefects
                ? "border-[#f3c2cb] bg-[#fff1f3]"
                : "border-[#b9e6c8] bg-[#eaf8ef]"
            }`}
          >
            <p
              className={`text-xs font-black uppercase tracking-[0.18em] ${
                entry.hasDefects ? "text-[#b00020]" : "text-[#078a3d]"
              }`}
            >
              {entry.hasDefects ? "Manager action required" : "Driver OK to continue with duty"}
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#18243a]">
              {entry.hasDefects
                ? "PMT sent to manager to process"
                : "Vehicle checks completed with no defects"}
            </h2>

            <p className="mt-3 text-sm font-bold leading-6 text-[#18243a]">
              {entry.hasDefects
                ? "The defect details have been sent to Vehicle History. The driver must return to or contact the office for further instruction."
                : "No defects were found. The driver is clear to continue with duty."}
            </p>

            {entry.hasDefects && entry.pmts.length > 0 && (
              <p className="mt-3 text-sm font-black text-[#b00020]">
                PMT reference{entry.pmts.length === 1 ? "" : "s"}: {entry.pmts.join(", ")}
              </p>
            )}
          </div>

          <section className="rounded-[28px] border border-[#d6dce5] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
                Driver logbook entry
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#18243a] sm:text-3xl">
                Vehicle check details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="Date and Time" value={entry.completedAt} />
              <InfoCard label="Driver" value={entry.driverName} />
              <InfoCard label="Mileage Start" value={entry.mileageStart} />
              <InfoCard label="Mileage End" value={entry.mileageEnd} />
              <InfoCard
                label="Defects Found"
                value={entry.hasDefects ? `${entry.defectsSummary.length} defect(s)` : "NIL Defects"}
              />
              <InfoCard
                label="Outcome"
                value={entry.hasDefects ? "Contact / return to office" : "OK to continue with duty"}
              />
            </div>

            <div className="mt-5 rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
                Defect detail
              </p>

              <ul className="mt-3 space-y-2 text-sm font-bold leading-6 text-[#18243a]">
                {entry.defectsSummary.map((item, index) => (
                  <li key={`${item}-${index}`} className="rounded-2xl bg-white px-4 py-3 border border-[#e2e8f0]">
                    {item}
                  </li>
                ))}
              </ul>
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[#e2e8f0] bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b00020]">
        {label}
      </p>
      <p className="mt-2 text-base font-black text-[#18243a]">{value}</p>
    </div>
  );
}

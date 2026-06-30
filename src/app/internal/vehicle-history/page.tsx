"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import VehicleCheckTimer, { startVehicleCheckTimer } from "../vehicle-checks/VehicleCheckTimer";

type VehicleDetail = {
  label: string;
  value: string;
};

type HistoryItem = {
  pmt: string;
  issue: string;
  type: "Vehicle Issue" | "Defect" | "Maintenance";
  reported: string;
  fixed: string;
  mileageReported: string;
  status: "Closed";
  notes: string;
};

const driverName = "Andrew Cannon";

const vehicleDetails: VehicleDetail[] = [
  { label: "Registration", value: "PE68UHD" },
  { label: "Last Mileage", value: "684,218 km" },
  { label: "Weight", value: "41T" },
  { label: "Axle", value: "4x2" },
  { label: "Asset", value: "23301273" },
  { label: "Fuel", value: "Diesel" },
  { label: "Trailer", value: "7338014" },
  { label: "Type", value: "DD95" },
];

const historyItems: HistoryItem[] = [
  {
    pmt: "PMT104582",
    issue: "Nearside door dent",
    type: "Vehicle Issue",
    reported: "12/05/2026",
    fixed: "15/05/2026",
    mileageReported: "681,442 km",
    status: "Closed",
    notes:
      "Minor bodywork dent reported on nearside cab door. Repaired by workshop panel team.",
  },
  {
    pmt: "PMT104231",
    issue: "Engine warning light / sensor fault",
    type: "Defect",
    reported: "03/05/2026",
    fixed: "04/05/2026",
    mileageReported: "679,886 km",
    status: "Closed",
    notes:
      "Diagnostic check identified faulty pressure sensor. Sensor replaced and vehicle tested.",
  },
  {
    pmt: "PMT103977",
    issue: "Rear offside tyre replacement",
    type: "Maintenance",
    reported: "24/04/2026",
    fixed: "24/04/2026",
    mileageReported: "677,921 km",
    status: "Closed",
    notes:
      "Tyre wear found during inspection. Tyre replaced before vehicle returned to service.",
  },
  {
    pmt: "PMT103445",
    issue: "Air leak traced to coupling line",
    type: "Defect",
    reported: "11/04/2026",
    fixed: "12/04/2026",
    mileageReported: "674,508 km",
    status: "Closed",
    notes:
      "Small air leak identified on trailer coupling line. Pipe connection repaired and re-tested.",
  },
  {
    pmt: "PMT102881",
    issue: "Mirror housing damage",
    type: "Vehicle Issue",
    reported: "29/03/2026",
    fixed: "31/03/2026",
    mileageReported: "671,337 km",
    status: "Closed",
    notes:
      "Offside mirror housing cracked. Unit replaced and visibility check completed.",
  },
  {
    pmt: "PMT102214",
    issue: "Front marker bulb replacement",
    type: "Maintenance",
    reported: "14/03/2026",
    fixed: "14/03/2026",
    mileageReported: "668,904 km",
    status: "Closed",
    notes:
      "Failed marker bulb replaced during workshop inspection.",
  },
];

export default function VehicleHistoryPage() {
 const [extraHistoryItems, setExtraHistoryItems] = useState<HistoryItem[]>([]);

useEffect(() => {
  const frame = window.requestAnimationFrame(() => {
    const savedExtraHistory = window.localStorage.getItem(
      "hgv-mock-vehicle-history-extra"
    );

    if (savedExtraHistory) {
      setExtraHistoryItems(JSON.parse(savedExtraHistory));
    }
  });

  return () => window.cancelAnimationFrame(frame);
}, []);

function clearAddedMockHistory() {
  window.localStorage.removeItem("hgv-mock-vehicle-history-extra");
  setExtraHistoryItems([]);
}

const combinedHistoryItems = [...extraHistoryItems, ...historyItems];








  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#7d0017] text-lg font-black text-white">
              HGV
            </div>

            <div>
              <p className="text-lg font-black leading-none text-white">
                Vehicle History
              </p>
              <p className="text-sm font-black leading-none text-[#ffd9df]">
                Driver PDA Concept
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
            <VehicleCheckTimer />

            <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2">
              <p className="text-xs font-black uppercase tracking-widest text-[#ffd9df]">
                Driver
              </p>
              <p className="text-base font-black text-white">{driverName}</p>
            </div>

            <Link
              href="/internal/vehicle-check-type"
              className="text-sm font-black text-white no-underline"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#b00020] px-4 py-6 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1100px]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">
            Driver daily check
          </p>

          <h1 className="text-[42px] font-black leading-[0.95] sm:text-[64px]">
            Vehicle History
          </h1>

          <p className="mt-4 max-w-[760px] text-sm font-bold leading-6 text-[#ffecef] sm:text-base">
            Review previous vehicle issues, defects and maintenance history
            before continuing to today&apos;s vehicle checks. Last recorded
            mileage is shown from the previous vehicle use.
          </p>

          <div className="mt-5 rounded-[24px] bg-white/95 p-2 shadow-sm">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {vehicleDetails.map((detail) => (
                <div
                  key={detail.label}
                  className={`rounded-2xl border px-3 py-2 ${
                    detail.label === "Last Mileage"
                      ? "border-[#f8df8d] bg-[#fff7e6]"
                      : "border-[#ead6dc] bg-[#fff7f8]"
                  }`}
                >
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.16em] ${
                      detail.label === "Last Mileage"
                        ? "text-[#92400e]"
                        : "text-[#b00020]"
                    }`}
                  >
                    {detail.label}
                  </p>

                  <p className="mt-1 text-sm font-black text-[#18243a]">
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1100px] space-y-6">
          <section className="rounded-[28px] border border-[#d6dce5] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
                Vehicle overview
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#18243a] sm:text-3xl">
                Visual history markers
              </h2>

              <p className="mt-2 text-sm font-bold leading-6 text-[#64748b]">
                Mock vehicle views showing previously reported areas and
                inspection points.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <Image
                src="/images/truck-history-overview.png"
                alt="Vehicle history visual marker overview showing front, rear, left side, right side and top view of the vehicle"
                width={782}
                height={162}
                className="h-auto w-full rounded-[18px] border border-[#e2e8f0] bg-white object-contain"
              />
            </div>

            <div className="mt-4 rounded-[20px] border border-[#f8df8d] bg-[#fff7e6] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f59e0b] text-lg font-black text-white">
                  ★
                </div>

                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#92400e]">
                    Current visual marker
                  </p>

                  <p className="mt-1 text-sm font-bold leading-6 text-[#18243a]">
                    Star marker shows a previously recorded nearside door dent,
                    reported on 12/05/2026 at 681,442 km and closed under
                    PMT104582.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#d6dce5] bg-white p-5 shadow-sm sm:p-6">
  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
        Previous records
      </p>

      <h2 className="mt-2 text-2xl font-black text-[#18243a] sm:text-3xl">
        Past vehicle history
      </h2>

      <p className="mt-2 text-sm font-bold leading-6 text-[#64748b]">
        Fictitious mock entries showing previously raised PMTs for the
        vehicle, including the mileage when each issue was reported.
      </p>
    </div>

    {extraHistoryItems.length > 0 && (
      <button
        type="button"
        onClick={clearAddedMockHistory}
        className="rounded-[18px] bg-[#18243a] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-[#b00020]"
      >
        MOCKUP Clear Added History
      </button>
    )}
  </div>

  {extraHistoryItems.length > 0 && (
    <div className="mb-4 rounded-[20px] border border-[#f8df8d] bg-[#fff7e6] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#92400e]">
        Mockup added history
      </p>
      <p className="mt-1 text-sm font-bold leading-6 text-[#18243a]">
        {extraHistoryItems.length} temporary item
        {extraHistoryItems.length === 1 ? "" : "s"} added from submitted vehicle
        checks. Use the clear button to reset the mock history back to the
        original examples.
      </p>
    </div>
  )}

  <div className="space-y-4">





              {combinedHistoryItems.map((item, index) => (
  <HistoryCard key={`${item.pmt}-${index}`} item={item} />
))}
            </div>
          </section>

          <div className="flex justify-end">
            <Link
  href="/internal/vehicle-checks"
  onClick={startVehicleCheckTimer}
  className="inline-flex w-full items-center justify-center rounded-[24px] bg-[#b00020] px-6 py-5 text-sm font-black uppercase tracking-[0.16em] text-white no-underline shadow-sm transition hover:bg-[#7d0017] sm:w-auto"
>
  Continue to Vehicle Checks
</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const typeClasses =
    item.type === "Defect"
      ? "border-[#f3c2cb] bg-[#ffe6eb] text-[#b00020]"
      : item.type === "Vehicle Issue"
      ? "border-[#f8df8d] bg-[#fef3c7] text-[#92400e]"
      : "border-[#b9e6c8] bg-[#e8f7ee] text-[#078a3d]";

  return (
    <article className="rounded-[24px] border border-[#d6dce5] bg-[#fbfbfc] p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-black text-[#18243a]">{item.issue}</p>

            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${typeClasses}`}
            >
              {item.type}
            </span>
          </div>

          <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-[#b00020]">
            {item.pmt}
          </p>

          <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
            {item.notes}
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3 lg:min-w-[330px]">
          <InfoMini label="Reported" value={item.reported} />
          <InfoMini label="Fixed" value={item.fixed} />
          <InfoMini label="Mileage" value={item.mileageReported} />
          <InfoMini label="Status" value={item.status} />
          <InfoMini label="PMT" value={item.pmt} />
        </div>
      </div>
    </article>
  );
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b00020]">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#18243a]">{value}</p>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DriverName, { useDriverName } from "../DriverName";
import VehicleCheckTimer from "../vehicle-checks/VehicleCheckTimer";
import {
  altCheckCategories,
  altHistoryStorageKey,
  altLogbookStorageKey,
  altMileageStorageKey,
  altStatusStorageKey,
  altVehicleDetails,
  formatDateTime,
  type AltCheckStatus,
  type AltHistoryItem,
  type AltLogbookEntry,
  type AltVehicleCheckCategory,
} from "../vehicle-checks-altData";

export default function VehicleChecksAltPage() {
  const router = useRouter();
  const driverName = useDriverName();
  const [statuses, setStatuses] = useState<Record<number, AltCheckStatus>>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const savedStatuses = window.localStorage.getItem(altStatusStorageKey);
    return savedStatuses ? JSON.parse(savedStatuses) : {};
  });
  const [currentMileage, setCurrentMileage] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem(altMileageStorageKey) || "";
  });

  function saveStatuses(nextStatuses: Record<number, AltCheckStatus>) {
    setStatuses(nextStatuses);
    window.localStorage.setItem(altStatusStorageKey, JSON.stringify(nextStatuses));
  }

  function updateCurrentMileage(value: string) {
    const cleanedValue = value.replace(/[^\d]/g, "");
    setCurrentMileage(cleanedValue);
    window.localStorage.setItem(altMileageStorageKey, cleanedValue);
  }

  function markOk(number: number) {
    const currentStatus = statuses[number] || "none";
    saveStatuses({
      ...statuses,
      [number]: currentStatus === "ok" ? "none" : "ok",
    });
  }

  const completedCount = altCheckCategories.filter(
    (category) => (statuses[category.number] || "none") !== "none"
  ).length;
  const allChecksComplete = completedCount === altCheckCategories.length;

  function formatMileage(value: string) {
    if (!value) {
      return "Not entered";
    }

    return `${Number(value).toLocaleString("en-GB")} km`;
  }

  function completeVehicleChecks() {
    if (!allChecksComplete) {
      return;
    }

    const historyRaw = window.localStorage.getItem(altHistoryStorageKey);
    const historyItems: AltHistoryItem[] = historyRaw ? JSON.parse(historyRaw) : [];
    const defectItems = historyItems.filter((item) =>
      (statuses[item.categoryNumber] || "none") === "defect"
    );

    const endTimestamp = Date.now();
    const storedStartTimestamp = Number(
      window.localStorage.getItem("hgv-check-timer-started-at")
    );
    const startTimestamp =
      Number.isFinite(storedStartTimestamp) && storedStartTimestamp > 0
        ? storedStartTimestamp
        : endTimestamp - 12 * 60 * 1000;

    const logbookEntry: AltLogbookEntry = {
      startDateTime: formatDateTime(new Date(startTimestamp)),
      endDateTime: formatDateTime(new Date(endTimestamp)),
      startTimestamp,
      endTimestamp,
      driverName,
      mileageStart:
        altVehicleDetails.find((item) => item.label === "Last Mileage")?.value ||
        "684,218 km",
      mileageEnd: formatMileage(currentMileage),
      hasDefects: defectItems.length > 0,
      defectsSummary:
        defectItems.length > 0
          ? defectItems.map((item) =>
              `${item.categoryTitle}: ${item.description || "Defect recorded"}`
            )
          : ["NIL Defects"],
      pmts: defectItems.map((item) => item.pmt),
    };

    window.localStorage.setItem(altLogbookStorageKey, JSON.stringify(logbookEntry));

    // Reset the completed check so the next vehicle check starts blank.
    window.localStorage.removeItem(altStatusStorageKey);
    window.localStorage.removeItem(altMileageStorageKey);
    window.localStorage.removeItem("hgv-check-timer-started-at");
    altCheckCategories.forEach((category) => {
      window.localStorage.removeItem(`hgv-alt-category-state-${category.slug}`);
    });
    setStatuses({});
    setCurrentMileage("");

    router.push("/internal/logbook");
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[900px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#7d0017] text-lg font-black text-white">
              HGV
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-lg font-black leading-none text-white">
                  Vehicle Checks
                </p>
                <p className="text-sm font-black leading-none text-[#ffd9df]">
                  DriverOS Concept
                </p>
              </div>

              <VehicleCheckTimer />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2">
              <p className="text-xs font-black uppercase tracking-widest text-[#ffd9df]">
                Driver
              </p>
              <p className="text-base font-black text-white"><DriverName /></p>
            </div>

            <Link
              href="/internal/vehicle-check-history"
              className="text-sm font-black text-white no-underline"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#b00020] px-4 py-6 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[900px]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">
            Driver daily check
          </p>

          <h1 className="text-[42px] font-black leading-[0.95] sm:text-[64px]">
            Vehicle Checks
          </h1>

          <p className="mt-4 max-w-[720px] text-sm font-bold leading-6 text-[#ffecef] sm:text-base">
            Enter the current mileage in kilometres. All 13 categories can be opened individually. Record a defect directly against the selected category when needed.
          </p>

          <div className="mt-5 rounded-[24px] bg-white/95 p-2 shadow-sm">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {altVehicleDetails.map((detail) => (
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
                  <p className="mt-1 text-sm font-black text-[#18243a]">{detail.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/25 bg-white/10 p-3">
            <label
              htmlFor="alt-current-mileage"
              className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd9df]"
            >
              Current Mileage / KM
            </label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                id="alt-current-mileage"
                type="text"
                inputMode="numeric"
                value={currentMileage}
                onChange={(event) => updateCurrentMileage(event.target.value)}
                placeholder="Enter current mileage"
                className="min-h-[52px] flex-1 rounded-2xl border border-white/30 bg-white px-4 text-lg font-black text-[#18243a] outline-none placeholder:text-[#94a3b8] focus:border-[#ffd9df]"
              />

              <div className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ffd9df]">
                  Last Use
                </p>
                <p className="text-sm font-black text-white">684,218 km</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[20px] border border-white/25 bg-white/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd9df]">
              Completion Progress
            </p>

            <p className="mt-1 text-lg font-black text-white">
              {completedCount} of {altCheckCategories.length} categories completed
            </p>

            <p className="mt-1 text-sm font-bold text-[#ffecef]">
              Tick a category if no issue is found, or open the category to add a defect description and photo evidence.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[900px] space-y-3">
          {altCheckCategories.map((check) => (
            <CheckRow
              key={check.slug}
              check={check}
              status={statuses[check.number] || "none"}
              onMarkOk={() => markOk(check.number)}
            />
          ))}

          <button
            type="button"
            onClick={completeVehicleChecks}
            disabled={!allChecksComplete}
            className={`mt-6 w-full rounded-[24px] px-5 py-5 text-sm font-black uppercase tracking-[0.16em] shadow-sm transition ${
              allChecksComplete
                ? "bg-[#b00020] text-white hover:bg-[#7d0017]"
                : "cursor-not-allowed bg-[#cbd5e1] text-[#64748b]"
            }`}
          >
            {allChecksComplete
              ? "Vehicle Checks Complete"
              : `Vehicle Checks Complete ${completedCount}/${altCheckCategories.length}`}
          </button>
        </div>
      </section>
    </main>
  );
}

function CheckRow({
  check,
  status,
  onMarkOk,
}: {
  check: AltVehicleCheckCategory;
  status: AltCheckStatus;
  onMarkOk: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_74px] gap-3">
      <Link
        href={`/internal/vehicle-checks-alt/${check.slug}`}
        className="flex min-h-[82px] items-center gap-4 rounded-[24px] border border-[#d6dce5] bg-white p-4 text-[#111] no-underline shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#b00020] text-lg font-black text-white">
          {check.number}
        </div>

        <div>
          <h2 className="text-lg font-black leading-tight text-[#18243a] sm:text-xl">
            {check.title}
          </h2>

          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#b00020]">
            Open check →
          </p>
        </div>
      </Link>

      <button
        type="button"
        onClick={onMarkOk}
        className={`flex min-h-[82px] items-center justify-center rounded-[24px] border text-3xl font-black shadow-sm transition ${
          status === "ok"
            ? "border-[#078a3d] bg-[#078a3d] text-white"
            : status === "defect"
            ? "border-[#b00020] bg-[#b00020] text-white"
            : "border-[#d6dce5] bg-white text-[#94a3b8]"
        }`}
        aria-label={`Mark ${check.title} as OK`}
      >
        {status === "ok" ? "✓" : status === "defect" ? "×" : "□"}
      </button>
    </div>
  );
}

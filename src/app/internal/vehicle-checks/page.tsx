"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CheckStatus = "none" | "ok" | "vehicleIssue" | "defect";

type VehicleCheck = {
  number: number;
  title: string;
  href: string;
  active: boolean;
};

type VehicleDetail = {
  label: string;
  value: string;
};

const driverName = "Andrew Cannon";

const vehicleDetails: VehicleDetail[] = [
  { label: "Registration", value: "PE68UHD" },
  { label: "Last Mileage", value: "684,218 km" },
  { label: "Weight", value: "41T" },
  { label: "Axle", value: "6x2" },
  { label: "Asset", value: "23301273" },
  { label: "Fuel", value: "Diesel" },
  { label: "Trailer", value: "7338014" },
  { label: "Type", value: "DD95" },
];

const checks: VehicleCheck[] = [
  {
    number: 1,
    title: "Brake System Defects",
    href: "/internal/vehicle-checks/brake-system-defects",
    active: true,
  },
  {
    number: 2,
    title: "Steering & Controls",
    href: "/internal/vehicle-checks/steering-controls",
    active: true,
  },
  {
    number: 3,
    title: "Tyres Wheels & Suspension",
    href: "/internal/vehicle-checks/tyres-wheels-suspension",
    active: true,
  },
  {
    number: 4,
    title: "Light, Visibility & Warning Devices",
    href: "/internal/vehicle-checks/lights-visibility-warning-devices",
    active: true,
  },
  {
    number: 5,
    title: "Trailer & Coupling Checks",
    href: "/internal/vehicle-checks/trailer-coupling-defects",
    active: true,
  },
  {
    number: 6,
    title: "Load Security & Vehicle Security",
    href: "/internal/vehicle-checks/load-security-vehicle-security",
    active: true,
  },
  {
    number: 7,
    title: "Fluid Leaks & Mech Failures",
    href: "/internal/vehicle-checks/fluid-leaks-mechanical-failures",
    active: true,
  },
  {
    number: 8,
    title: "Legal & Compliance",
    href: "/internal/vehicle-checks/legal-compliance-failures",
    active: true,
  },
  {
    number: 9,
    title: "Safety Equipment & Emergency Systems",
    href: "/internal/vehicle-checks/safety-equipment-emergency-systems",
    active: true,
  },
  {
    number: 10,
    title: "Structural & General Condition",
    href: "/internal/vehicle-checks/structural-general-vehicle-condition",
    active: true,
  },
];

const statusStorageKey = "hgv-vehicle-check-status";
const mileageStorageKey = "hgv-current-mileage-km";

export default function VehicleChecksPage() {
  const [statuses, setStatuses] = useState<Record<number, CheckStatus>>({});
  const [currentMileage, setCurrentMileage] = useState("");

  useEffect(() => {
    const savedStatuses = window.localStorage.getItem(statusStorageKey);
    const savedMileage = window.localStorage.getItem(mileageStorageKey);

    if (savedStatuses) {
      setStatuses(JSON.parse(savedStatuses));
    }

    if (savedMileage) {
      setCurrentMileage(savedMileage);
    }
  }, []);

  function saveStatus(nextStatuses: Record<number, CheckStatus>) {
    setStatuses(nextStatuses);
    window.localStorage.setItem(statusStorageKey, JSON.stringify(nextStatuses));
  }

  function updateCurrentMileage(value: string) {
    const cleanedValue = value.replace(/[^\d]/g, "");

    setCurrentMileage(cleanedValue);
    window.localStorage.setItem(mileageStorageKey, cleanedValue);
  }

  function markOk(number: number) {
    const currentStatus = statuses[number] || "none";

    const nextStatuses: Record<number, CheckStatus> = {
      ...statuses,
      [number]: currentStatus === "ok" ? "none" : "ok",
    };

    saveStatus(nextStatuses);
  }

  const completedCategoryCount = checks.filter(
    (check) => (statuses[check.number] || "none") !== "none"
  ).length;

  const allCategoriesComplete = completedCategoryCount === checks.length;

  function continueToSummary() {
    if (!allCategoriesComplete) {
      return;
    }

    window.location.href = "/internal/vehicle-checks/summary";
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[900px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#7d0017] text-lg font-black text-white">
              HGV
            </div>

            <div>
              <p className="text-lg font-black leading-none text-white">
                Vehicle Checks
              </p>
              <p className="text-sm font-black leading-none text-[#ffd9df]">
                Driver PDA Concept
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2">
              <p className="text-xs font-black uppercase tracking-widest text-[#ffd9df]">
                Driver
              </p>
              <p className="text-base font-black text-white">{driverName}</p>
            </div>

            <Link
              href="/internal/vehicle-history"
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
            Enter the current mileage in kilometres. All 10 categories must be
            completed before the final summary can be submitted.
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

          <div className="mt-4 rounded-[24px] border border-white/25 bg-white/10 p-3">
            <label
              htmlFor="current-mileage"
              className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd9df]"
            >
              Current Mileage / KM
            </label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                id="current-mileage"
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
              {completedCategoryCount} of {checks.length} categories completed
            </p>

            {!allCategoriesComplete && (
              <p className="mt-1 text-sm font-bold text-[#ffecef]">
                Complete all categories before continuing to the summary.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[900px] space-y-3">
          {checks.map((check) => (
            <CheckRow
              key={check.number}
              check={check}
              status={statuses[check.number] || "none"}
              onMarkOk={() => markOk(check.number)}
            />
          ))}

          <button
            type="button"
            onClick={continueToSummary}
            disabled={!allCategoriesComplete}
            className={`mt-6 w-full rounded-[24px] px-5 py-5 text-sm font-black uppercase tracking-[0.16em] shadow-sm transition ${
              allCategoriesComplete
                ? "bg-[#b00020] text-white hover:bg-[#7d0017]"
                : "cursor-not-allowed bg-[#cbd5e1] text-[#64748b]"
            }`}
          >
            {allCategoriesComplete
              ? "Continue to Vehicle Check Summary"
              : `Complete all categories first ${completedCategoryCount}/${checks.length}`}
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
  check: VehicleCheck;
  status: CheckStatus;
  onMarkOk: () => void;
}) {
  const statusDisplay = getStatusDisplay(status);

  return (
    <div className="grid grid-cols-[1fr_74px] gap-3">
      {check.active ? (
        <Link
          href={check.href}
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
      ) : (
        <button
          type="button"
          className="flex min-h-[82px] w-full items-center gap-4 rounded-[24px] border border-[#d6dce5] bg-white p-4 text-left text-[#111] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#b00020] text-lg font-black text-white">
            {check.number}
          </div>

          <div>
            <h2 className="text-lg font-black leading-tight text-[#18243a] sm:text-xl">
              {check.title}
            </h2>

            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#b00020]">
              Page to be added
            </p>
          </div>
        </button>
      )}

      <button
        type="button"
        onClick={onMarkOk}
        className={`flex min-h-[82px] items-center justify-center rounded-[24px] border text-3xl font-black shadow-sm transition ${
          status === "ok"
            ? "border-[#078a3d] bg-[#078a3d] text-white"
            : status === "vehicleIssue"
            ? "border-[#f59e0b] bg-[#f59e0b] text-white"
            : status === "defect"
            ? "border-[#b00020] bg-[#b00020] text-white"
            : "border-[#d6dce5] bg-white text-[#94a3b8]"
        }`}
        aria-label={`Mark ${check.title} as OK`}
      >
        {statusDisplay}
      </button>
    </div>
  );
}

function getStatusDisplay(status: CheckStatus) {
  if (status === "ok") {
    return "✓";
  }

  if (status === "vehicleIssue") {
    return "?";
  }

  if (status === "defect") {
    return "×";
  }

  return "□";
}
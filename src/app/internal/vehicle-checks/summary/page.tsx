"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CheckStatus = "none" | "ok" | "vehicleIssue" | "defect";

type CategoryConfig = {
  number: number;
  title: string;
  storageKeyPrefix: string;
  checks: {
    number: number;
    title: string;
  }[];
};

type SummaryIssue = {
  categoryNumber: number;
  categoryTitle: string;
  checkNumber: number;
  checkTitle: string;
  status: CheckStatus;
  description: string;
  photoName: string;
};

type HistoryEntry = {
  pmt: string;
  issue: string;
  type: "Vehicle Issue" | "Defect" | "Maintenance";
  reported: string;
  fixed: string;
  mileageReported: string;
  status: "Open" | "Closed" | "Monitor";
  notes: string;
};

const driverName = "Andrew Cannon";
const registration = "PE68UHD";

const vehicleCheckStatusStorageKey = "hgv-vehicle-check-status";
const currentMileageStorageKey = "hgv-current-mileage-km";
const mockHistoryStorageKey = "hgv-mock-vehicle-history-extra";

const categories: CategoryConfig[] = [
  {
    number: 1,
    title: "Brake System Defects",
    storageKeyPrefix: "hgv-brake-system-defects",
    checks: [
      { number: 1, title: "Brake pedal not operating correctly" },
      { number: 2, title: "Handbrake not holding vehicle" },
      { number: 3, title: "Weak or failed brakes" },
      { number: 4, title: "Brake warning lights" },
      { number: 5, title: "Brake fluid leaks" },
      { number: 6, title: "Air brake pressure faults" },
      { number: 7, title: "Hydraulic brake defects" },
      { number: 8, title: "Fork-lift or pallet truck brake failure" },
    ],
  },
  {
    number: 2,
    title: "Steering & Controls",
    storageKeyPrefix: "hgv-steering-controls",
    checks: [
      { number: 1, title: "Excessive steering free play" },
      { number: 2, title: "Steering pulling badly" },
      { number: 3, title: "Steering locking or stiffness" },
      { number: 4, title: "Defective hydraulic steering controls" },
      { number: 5, title: "Loss of vehicle control" },
    ],
  },
  {
    number: 3,
    title: "Tyres Wheels & Suspension",
    storageKeyPrefix: "hgv-tyres-wheels-suspension",
    checks: [
      { number: 1, title: "Tyres below legal tread depth" },
      { number: 2, title: "Bulges, cuts or exposed cords" },
      { number: 3, title: "Unsafe tyre pressures" },
      { number: 4, title: "Loose or missing wheel nuts" },
      { number: 5, title: "Damaged wheels" },
      { number: 6, title: "Unsafe trailer tyres" },
      { number: 7, title: "Suspension defects affecting safety" },
    ],
  },
  {
    number: 4,
    title: "Light, Visibility & Warning Devices",
    storageKeyPrefix: "hgv-lights-visibility-warning-devices",
    checks: [
      { number: 1, title: "Headlights not working" },
      { number: 2, title: "Brake lights defective" },
      { number: 3, title: "Indicators defective" },
      { number: 4, title: "Trailer lights not working" },
      { number: 5, title: "Mirrors damaged or missing" },
      { number: 6, title: "Windscreen damage affecting vision" },
      { number: 7, title: "Wipers or washers not operating" },
      { number: 8, title: "Horn not working" },
    ],
  },
  {
    number: 5,
    title: "Trailer & Coupling Checks",
    storageKeyPrefix: "hgv-trailer-coupling-defects",
    checks: [
      { number: 1, title: "Faulty trailer connection" },
      { number: 2, title: "Unsafe 5th wheel connection" },
      { number: 3, title: "Trailer insecure" },
      { number: 4, title: "Trailer legs not stowed" },
      { number: 5, title: "Air or electrical lines disconnected" },
      { number: 6, title: "Trailer number plate missing" },
      { number: 7, title: "Coupling locking fault" },
    ],
  },
  {
    number: 6,
    title: "Load Security & Vehicle Security",
    storageKeyPrefix: "hgv-load-security-vehicle-security",
    checks: [
      { number: 1, title: "Load insecure" },
      { number: 2, title: "Damaged or missing restraint straps" },
      { number: 3, title: "Risk of falling load" },
      { number: 4, title: "Doors insecure" },
      { number: 5, title: "Vehicle cannot be secured" },
      { number: 6, title: "Mail or load security risk" },
    ],
  },
  {
    number: 7,
    title: "Fluid Leaks & Mech Failures",
    storageKeyPrefix: "hgv-fluid-leaks-mechanical-failures",
    checks: [
      { number: 1, title: "Fuel leaks" },
      { number: 2, title: "Oil leaks" },
      { number: 3, title: "Coolant leaks" },
      { number: 4, title: "Hydraulic leaks" },
      { number: 5, title: "Overheating engine" },
      { number: 6, title: "Serious engine defects" },
      { number: 7, title: "Air leaks affecting braking systems" },
    ],
  },
  {
    number: 8,
    title: "Legal & Compliance",
    storageKeyPrefix: "hgv-legal-compliance-failures",
    checks: [
      { number: 1, title: "Road fund licence expired or missing" },
      { number: 2, title: "O licence missing" },
      { number: 3, title: "Vehicle inspection or service overdue" },
      { number: 4, title: "Vehicle height not displayed in cab" },
      { number: 5, title: "Vehicle declared unroadworthy" },
      { number: 6, title: "Mandatory defect reporting not completed" },
    ],
  },
  {
    number: 9,
    title: "Safety Equipment & Emergency Systems",
    storageKeyPrefix: "hgv-safety-equipment-emergency-systems",
    checks: [
      { number: 1, title: "Seat belt defective" },
      { number: 2, title: "Emergency stop not working" },
      { number: 3, title: "Fire extinguisher missing" },
      { number: 4, title: "Emergency exits blocked" },
      { number: 5, title: "Driver safety systems defective" },
      { number: 6, title: "Fork-lift seat cut-out defective" },
    ],
  },
  {
    number: 10,
    title: "Structural & General Condition",
    storageKeyPrefix: "hgv-structural-general-vehicle-condition",
    checks: [
      { number: 1, title: "Dangerous bodywork damage" },
      { number: 2, title: "Sharp or protruding panels" },
      { number: 3, title: "Unsafe floors or trip hazards" },
      { number: 4, title: "Security cage damage" },
      { number: 5, title: "Severe vehicle damage after collision" },
      { number: 6, title: "Unsafe cleanliness affecting operation" },
      { number: 7, title: "Structural defects affecting safe use" },
    ],
  },
];

export default function VehicleCheckSummaryPage() {
  const [categoryStatuses, setCategoryStatuses] = useState<
    Record<number, CheckStatus>
  >({});
  const [issues, setIssues] = useState<SummaryIssue[]>([]);
  const [currentMileage, setCurrentMileage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [createdPmt, setCreatedPmt] = useState("");

  useEffect(() => {
    const savedCategoryStatuses = window.localStorage.getItem(
      vehicleCheckStatusStorageKey
    );
    const savedMileage = window.localStorage.getItem(currentMileageStorageKey);

    if (savedCategoryStatuses) {
      setCategoryStatuses(JSON.parse(savedCategoryStatuses));
    }

    if (savedMileage) {
      setCurrentMileage(savedMileage);
    }

    setIssues(buildSummaryIssues());
  }, []);

  const amberIssues = useMemo(
    () => issues.filter((issue) => issue.status === "vehicleIssue"),
    [issues]
  );

  const redDefects = useMemo(
    () => issues.filter((issue) => issue.status === "defect"),
    [issues]
  );

  const hasAmber = amberIssues.length > 0;
  const hasRed = redDefects.length > 0;

  const overallDecision = hasRed
    ? "stop"
    : hasAmber
    ? "monitor"
    : "clear";

  function buildSummaryIssues() {
    const summaryIssues: SummaryIssue[] = [];

    categories.forEach((category) => {
      const savedStatuses = window.localStorage.getItem(
        `${category.storageKeyPrefix}-status`
      );
      const savedDescriptions = window.localStorage.getItem(
        `${category.storageKeyPrefix}-descriptions`
      );
      const savedPhotoNames = window.localStorage.getItem(
        `${category.storageKeyPrefix}-photo-names`
      );

      const statuses: Record<number, CheckStatus> = savedStatuses
        ? JSON.parse(savedStatuses)
        : {};

      const descriptions: Record<number, string> = savedDescriptions
        ? JSON.parse(savedDescriptions)
        : {};

      const photoNames: Record<number, string> = savedPhotoNames
        ? JSON.parse(savedPhotoNames)
        : {};

      category.checks.forEach((check) => {
        const status = statuses[check.number] || "none";

        if (status === "vehicleIssue" || status === "defect") {
          summaryIssues.push({
            categoryNumber: category.number,
            categoryTitle: category.title,
            checkNumber: check.number,
            checkTitle: check.title,
            status,
            description: descriptions[check.number] || "",
            photoName: photoNames[check.number] || "",
          });
        }
      });
    });

    return summaryIssues;
  }

  function createMockPmtNumber() {
    const randomNumber = Math.floor(100000 + Math.random() * 899999);
    return `PMT${randomNumber}`;
  }

  function getTodayDateUk() {
    return new Date().toLocaleDateString("en-GB");
  }

  function finaliseMockup() {
    const pmtNumber = hasRed ? createMockPmtNumber() : "";
    const today = getTodayDateUk();

    const savedHistory = window.localStorage.getItem(mockHistoryStorageKey);
    const existingHistory: HistoryEntry[] = savedHistory
      ? JSON.parse(savedHistory)
      : [];

    const newHistoryEntries: HistoryEntry[] = issues.map((issue) => ({
      pmt: issue.status === "defect" ? pmtNumber : "No PMT required",
      issue: `${issue.categoryTitle}: ${issue.checkTitle}`,
      type: issue.status === "defect" ? "Defect" : "Vehicle Issue",
      reported: today,
      fixed: issue.status === "defect" ? "Awaiting workshop" : "Monitor only",
      mileageReported: currentMileage
        ? `${Number(currentMileage).toLocaleString("en-GB")} km`
        : "Not entered",
      status: issue.status === "defect" ? "Open" : "Monitor",
      notes:
        issue.description ||
        (issue.status === "defect"
          ? "Defect recorded during driver daily vehicle check."
          : "Vehicle issue recorded during driver daily vehicle check."),
    }));

    window.localStorage.setItem(
      mockHistoryStorageKey,
      JSON.stringify([...newHistoryEntries, ...existingHistory])
    );

    setCreatedPmt(pmtNumber);
    setSubmitted(true);
  }

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
                Check Summary
              </p>
              <p className="text-sm font-black leading-none text-[#ffd9df]">
                Vehicle Checks
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
              href="/internal/vehicle-checks"
              className="text-sm font-black text-white no-underline"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#b00020] px-4 py-7 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1100px]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">
            Driver daily check result
          </p>

          <h1 className="text-[42px] font-black leading-[0.95] sm:text-[64px]">
            Vehicle Check Summary
          </h1>

          <p className="mt-4 max-w-[760px] text-sm font-bold leading-6 text-[#ffecef] sm:text-base">
            Review the completed category results before submitting the mock
            daily vehicle check.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryMini label="Vehicle" value={registration} />
            <SummaryMini
              label="Mileage"
              value={
                currentMileage
                  ? `${Number(currentMileage).toLocaleString("en-GB")} km`
                  : "Not entered"
              }
            />
            <SummaryMini
              label="Amber Issues"
              value={amberIssues.length.toString()}
            />
            <SummaryMini label="Red Defects" value={redDefects.length.toString()} />
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1100px] space-y-6">
          <DecisionPanel
            overallDecision={overallDecision}
            createdPmt={createdPmt}
            submitted={submitted}
          />

          <section className="rounded-[28px] border border-[#d6dce5] bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
              Category results
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#18243a]">
              All 10 categories
            </h2>

            <div className="mt-5 grid gap-3">
              {categories.map((category) => (
                <CategoryResultRow
                  key={category.number}
                  category={category}
                  status={categoryStatuses[category.number] || "none"}
                />
              ))}
            </div>
          </section>

          {(hasAmber || hasRed) && (
            <section className="rounded-[28px] border border-[#d6dce5] bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
                Issues and defects
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#18243a]">
                Items added to vehicle history
              </h2>

              <div className="mt-5 space-y-4">
                {issues.map((issue) => (
                  <IssueCard key={`${issue.categoryNumber}-${issue.checkNumber}`} issue={issue} />
                ))}
              </div>
            </section>
          )}

          <button
            type="button"
            onClick={finaliseMockup}
            disabled={submitted}
            className={`w-full rounded-[24px] px-5 py-5 text-sm font-black uppercase tracking-[0.16em] text-white shadow-sm transition ${
              submitted
                ? "cursor-not-allowed bg-[#94a3b8]"
                : hasRed
                ? "bg-[#b00020] hover:bg-[#7d0017]"
                : hasAmber
                ? "bg-[#f59e0b] hover:bg-[#92400e]"
                : "bg-[#078a3d] hover:bg-[#056b30]"
            }`}
          >
            {submitted
              ? "Mockup Submitted"
              : hasRed
              ? "Submit and Create PMT"
              : hasAmber
              ? "Submit with Vehicle Issues"
              : "Submit Checks - Vehicle OK"}
          </button>

          {submitted && (
            <Link
              href="/internal/vehicle-history"
              className="flex w-full items-center justify-center rounded-[24px] bg-[#18243a] px-5 py-5 text-sm font-black uppercase tracking-[0.16em] text-white no-underline shadow-sm transition hover:bg-[#0f172a]"
            >
              View Updated Vehicle History
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

function SummaryMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ffd9df]">
        {label}
      </p>
      <p className="mt-1 text-base font-black text-white">{value}</p>
    </div>
  );
}

function DecisionPanel({
  overallDecision,
  submitted,
  createdPmt,
}: {
  overallDecision: "clear" | "monitor" | "stop";
  submitted: boolean;
  createdPmt: string;
}) {
  if (overallDecision === "stop") {
    return (
      <section className="rounded-[28px] border border-[#b00020] bg-[#ffe6eb] p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
          Vehicle must not be used
        </p>
        <h2 className="mt-2 text-3xl font-black text-[#7d0017]">
          Red defect recorded
        </h2>
        <p className="mt-3 text-sm font-bold leading-6 text-[#18243a]">
          A red defect means the vehicle cannot be used until the defect has
          been fixed and cleared by workshop.
        </p>
        {submitted && createdPmt && (
          <p className="mt-3 rounded-2xl bg-white p-4 text-sm font-black text-[#b00020]">
            Mock PMT created: {createdPmt}
          </p>
        )}
      </section>
    );
  }

  if (overallDecision === "monitor") {
    return (
      <section className="rounded-[28px] border border-[#f59e0b] bg-[#fff7e6] p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#92400e]">
          Vehicle can still be used
        </p>
        <h2 className="mt-2 text-3xl font-black text-[#92400e]">
          Amber vehicle issue recorded
        </h2>
        <p className="mt-3 text-sm font-bold leading-6 text-[#18243a]">
          Amber vehicle issues will be added to vehicle history for monitoring,
          but no PMT is created in this mockup.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-[#078a3d] bg-[#e8f7ee] p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#078a3d]">
        Vehicle can be used
      </p>
      <h2 className="mt-2 text-3xl font-black text-[#056b30]">
        All checks completed OK
      </h2>
      <p className="mt-3 text-sm font-bold leading-6 text-[#18243a]">
        No amber vehicle issues or red defects have been recorded.
      </p>
    </section>
  );
}

function CategoryResultRow({
  category,
  status,
}: {
  category: CategoryConfig;
  status: CheckStatus;
}) {
  return (
    <div className="grid grid-cols-[1fr_74px] gap-3">
      <div className="flex min-h-[74px] items-center gap-4 rounded-[22px] border border-[#d6dce5] bg-[#fbfbfc] p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#b00020] text-sm font-black text-white">
          {category.number}
        </div>
        <div>
          <p className="text-lg font-black text-[#18243a]">{category.title}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#64748b]">
            {getStatusLabel(status)}
          </p>
        </div>
      </div>

      <div
        className={`flex min-h-[74px] items-center justify-center rounded-[22px] border text-3xl font-black ${
          status === "ok"
            ? "border-[#078a3d] bg-[#078a3d] text-white"
            : status === "vehicleIssue"
            ? "border-[#f59e0b] bg-[#f59e0b] text-white"
            : status === "defect"
            ? "border-[#b00020] bg-[#b00020] text-white"
            : "border-[#d6dce5] bg-white text-[#94a3b8]"
        }`}
      >
        {getStatusDisplay(status)}
      </div>
    </div>
  );
}

function IssueCard({ issue }: { issue: SummaryIssue }) {
  const isDefect = issue.status === "defect";

  return (
    <article
      className={`rounded-[24px] border p-4 shadow-sm ${
        isDefect
          ? "border-[#f3c2cb] bg-[#fff7f8]"
          : "border-[#f8df8d] bg-[#fff7e6]"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p
            className={`text-xs font-black uppercase tracking-[0.16em] ${
              isDefect ? "text-[#b00020]" : "text-[#92400e]"
            }`}
          >
            {isDefect ? "Red Defect" : "Amber Vehicle Issue"}
          </p>

          <h3 className="mt-2 text-xl font-black text-[#18243a]">
            {issue.categoryTitle}: {issue.checkTitle}
          </h3>

          <p className="mt-2 text-sm font-bold leading-6 text-[#64748b]">
            {issue.description || "No description entered."}
          </p>

          {issue.photoName && (
            <p className="mt-2 text-xs font-bold text-[#64748b]">
              Photo selected: {issue.photoName}
            </p>
          )}
        </div>

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl font-black text-white ${
            isDefect ? "bg-[#b00020]" : "bg-[#f59e0b]"
          }`}
        >
          {isDefect ? "×" : "?"}
        </div>
      </div>
    </article>
  );
}

function getStatusDisplay(status: CheckStatus) {
  if (status === "ok") return "✓";
  if (status === "vehicleIssue") return "?";
  if (status === "defect") return "×";
  return "□";
}

function getStatusLabel(status: CheckStatus) {
  if (status === "ok") return "Completed OK";
  if (status === "vehicleIssue") return "Vehicle issue recorded";
  if (status === "defect") return "Defect recorded";
  return "Not completed";
}
export {};
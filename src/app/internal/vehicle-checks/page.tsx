"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CheckStatus = "none" | "ok" | "issue";

type VehicleCheck = {
  number: number;
  title: string;
  href: string;
  active: boolean;
};

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
    href: "#",
    active: false,
  },
  {
    number: 3,
    title: "Tyres Wheels & Suspension",
    href: "#",
    active: false,
  },
  {
    number: 4,
    title: "Light, Visibility & Warning Devices",
    href: "#",
    active: false,
  },
  {
    number: 5,
    title: "Trailer & Coupling Checks",
    href: "#",
    active: false,
  },
  {
    number: 6,
    title: "Load Security & Vehicle Security",
    href: "#",
    active: false,
  },
  {
    number: 7,
    title: "Fluid Leaks & Mech Failures",
    href: "#",
    active: false,
  },
  {
    number: 8,
    title: "Legal & Compliance",
    href: "#",
    active: false,
  },
  {
    number: 9,
    title: "Safety Equipment & Emergency Systems",
    href: "#",
    active: false,
  },
  {
    number: 10,
    title: "Structural & General Condition",
    href: "#",
    active: false,
  },
];

const storageKey = "hgv-vehicle-check-status";

export default function VehicleChecksPage() {
  const [statuses, setStatuses] = useState<Record<number, CheckStatus>>({});

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);

    if (saved) {
      setStatuses(JSON.parse(saved));
    }
  }, []);

  function saveStatus(nextStatuses: Record<number, CheckStatus>) {
    setStatuses(nextStatuses);
    window.localStorage.setItem(storageKey, JSON.stringify(nextStatuses));
  }

  function markOk(number: number) {
    const currentStatus = statuses[number] || "none";

    const nextStatuses: Record<number, CheckStatus> = {
  ...statuses,
  [number]: currentStatus === "ok" ? "none" : "ok",
};

    saveStatus(nextStatuses);
  }

  function markOpened(number: number) {
    const nextStatuses: Record<number, CheckStatus> = {
  ...statuses,
  [number]: "issue",
};

    saveStatus(nextStatuses);
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[900px] items-center justify-between gap-5">
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

          <Link
            href="/internal/app-ideas"
            className="text-sm font-black text-white no-underline"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="bg-[#b00020] px-4 py-7 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[900px]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">
            Driver daily check
          </p>

          <h1 className="text-[42px] font-black leading-[0.95] sm:text-[64px]">
            Vehicle Checks
          </h1>

          <p className="mt-4 max-w-[720px] text-sm font-bold leading-6 text-[#ffecef] sm:text-base">
            Select the green tick if the check is OK. Open a category to record
            or review an issue.
          </p>
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
              onOpen={() => markOpened(check.number)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function CheckRow({
  check,
  status,
  onMarkOk,
  onOpen,
}: {
  check: VehicleCheck;
  status: CheckStatus;
  onMarkOk: () => void;
  onOpen: () => void;
}) {
  const statusDisplay = getStatusDisplay(status);

  return (
    <div className="grid grid-cols-[1fr_74px] gap-3">
      {check.active ? (
        <Link
          href={check.href}
          onClick={onOpen}
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
          onClick={onOpen}
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
            : status === "issue"
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

  if (status === "issue") {
    return "×";
  }

  return "□";
}
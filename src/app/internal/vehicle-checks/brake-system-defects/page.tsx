"use client";

import Link from "next/link";
import { useState } from "react";

type CheckStatus = "none" | "ok" | "defect";

type BrakeCheck = {
  number: number;
  title: string;
};

const brakeChecks: BrakeCheck[] = [
  {
    number: 1,
    title: "Air pressure warning system",
  },
  {
    number: 2,
    title: "Service brake operation",
  },
  {
    number: 3,
    title: "Parking brake operation",
  },
  {
    number: 4,
    title: "Brake pedal feel",
  },
  {
    number: 5,
    title: "Brake lines or visible damage",
  },
  {
    number: 6,
    title: "Air leaks or pressure loss",
  },
];

export default function BrakeSystemDefectsPage() {
  const [statuses, setStatuses] = useState<Record<number, CheckStatus>>({});
  const [descriptions, setDescriptions] = useState<Record<number, string>>({});
  const [photoNames, setPhotoNames] = useState<Record<number, string>>({});

  function setCheckStatus(number: number, status: CheckStatus) {
    setStatuses((current) => ({
      ...current,
      [number]: status,
    }));
  }

  function updateDescription(number: number, value: string) {
    setDescriptions((current) => ({
      ...current,
      [number]: value,
    }));
  }

  function updatePhotoName(number: number, fileName: string) {
    setPhotoNames((current) => ({
      ...current,
      [number]: fileName,
    }));
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[900px] items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#7d0017] text-lg font-black text-white">
              1
            </div>

            <div>
              <p className="text-lg font-black leading-none text-white">
                Brake System Defects
              </p>
              <p className="text-sm font-black leading-none text-[#ffd9df]">
                Vehicle Checks
              </p>
            </div>
          </div>

          <Link
            href="/internal/vehicle-checks"
            className="text-sm font-black text-white no-underline"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="bg-[#b00020] px-4 py-7 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[900px]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">
            Vehicle check category 1
          </p>

          <h1 className="text-[42px] font-black leading-[0.95] sm:text-[64px]">
            Brake System Defects
          </h1>

          <p className="mt-4 max-w-[720px] text-sm font-bold leading-6 text-[#ffecef] sm:text-base">
            Select OK if the check is satisfactory. Select Defect to add a
            description and take a photo.
          </p>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[900px] space-y-4">
          {brakeChecks.map((check) => (
            <BrakeCheckCard
              key={check.number}
              check={check}
              status={statuses[check.number] || "none"}
              description={descriptions[check.number] || ""}
              photoName={photoNames[check.number] || ""}
              onSetStatus={(status) => setCheckStatus(check.number, status)}
              onDescriptionChange={(value) =>
                updateDescription(check.number, value)
              }
              onPhotoSelected={(fileName) =>
                updatePhotoName(check.number, fileName)
              }
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function BrakeCheckCard({
  check,
  status,
  description,
  photoName,
  onSetStatus,
  onDescriptionChange,
  onPhotoSelected,
}: {
  check: BrakeCheck;
  status: CheckStatus;
  description: string;
  photoName: string;
  onSetStatus: (status: CheckStatus) => void;
  onDescriptionChange: (value: string) => void;
  onPhotoSelected: (fileName: string) => void;
}) {
  const cameraInputId = `camera-input-${check.number}`;

  return (
    <section className="rounded-[26px] border border-[#d6dce5] bg-white p-5 shadow-sm">
      <div className="mb-4 grid grid-cols-[1fr_74px] items-start gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
            Check {check.number}
          </p>

          <h2 className="mt-2 text-2xl font-black leading-tight text-[#18243a]">
            {check.title}
          </h2>
        </div>

        <div
          className={`flex h-[74px] items-center justify-center rounded-[22px] border text-4xl font-black ${
            status === "ok"
              ? "border-[#078a3d] bg-[#078a3d] text-white"
              : status === "defect"
              ? "border-[#b00020] bg-[#b00020] text-white"
              : "border-[#d6dce5] bg-[#f3f5f8] text-[#94a3b8]"
          }`}
        >
          {status === "ok" ? "✓" : status === "defect" ? "×" : "□"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSetStatus("ok")}
          className={`rounded-2xl px-4 py-3 text-sm font-black ${
            status === "ok"
              ? "bg-[#078a3d] text-white"
              : "bg-[#e8f7ee] text-[#078a3d]"
          }`}
        >
          OK
        </button>

        <button
          type="button"
          onClick={() => onSetStatus("defect")}
          className={`rounded-2xl px-4 py-3 text-sm font-black ${
            status === "defect"
              ? "bg-[#b00020] text-white"
              : "bg-[#ffe6eb] text-[#b00020]"
          }`}
        >
          Defect
        </button>
      </div>

      {status === "defect" && (
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="rounded-2xl bg-[#f3f5f8] p-4">
            <label
              htmlFor={`description-${check.number}`}
              className="text-xs font-black uppercase tracking-[0.16em] text-[#b00020]"
            >
              Defect description
            </label>

            <textarea
              id={`description-${check.number}`}
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Type defect details here..."
              className="mt-3 min-h-[120px] w-full resize-none rounded-2xl border border-[#d6dce5] bg-white p-4 text-sm font-bold leading-6 text-[#18243a] outline-none focus:border-[#b00020]"
            />
          </div>

          <div className="rounded-2xl bg-[#f3f5f8] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b00020]">
              Photo evidence
            </p>

            <label
              htmlFor={cameraInputId}
              className="mt-3 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b00020] bg-white p-4 text-center text-[#b00020]"
            >
              <span className="text-3xl font-black">📷</span>
              <span className="mt-2 text-sm font-black">Open Camera</span>
              <span className="mt-1 text-xs font-bold text-[#64748b]">
                Take or attach photo
              </span>
            </label>

            <input
              id={cameraInputId}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  onPhotoSelected(file.name);
                }
              }}
            />

            {photoName && (
              <p className="mt-3 rounded-xl bg-white p-3 text-xs font-bold leading-5 text-[#18243a]">
                Photo selected: {photoName}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
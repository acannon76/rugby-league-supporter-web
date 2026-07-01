"use client";

import Link from "next/link";
import { useState } from "react";
import VehicleCheckTimer from "../../vehicle-checks/VehicleCheckTimer";

type BreakdownSafetyKey =
  | "safeLocation"
  | "vehicleProtected"
  | "needsEmergencyHelpChecked"
  | "officeAware";

type PhotoItem = {
  id: string;
  name: string;
};

type SafeStatus = "Yes" | "No" | "Need Assistance";

const safetyChecks: { key: BreakdownSafetyKey; label: string; help: string }[] = [
  {
    key: "safeLocation",
    label: "I am in a safe place away from moving traffic",
    help: "Move to a safe area before completing the breakdown report where possible.",
  },
  {
    key: "vehicleProtected",
    label: "Vehicle secured as far as possible",
    help: "Use hazard lights and warning equipment only when it is safe to do so.",
  },
  {
    key: "needsEmergencyHelpChecked",
    label: "I have checked whether emergency assistance is needed",
    help: "If there is danger, injury or a live lane risk, emergency services should be contacted first.",
  },
  {
    key: "officeAware",
    label: "The transport office is aware of the breakdown",
    help: "The office needs to know quickly so recovery and duty support can be arranged.",
  },
];

const safeStatusOptions: SafeStatus[] = ["Yes", "No", "Need Assistance"];

export default function BreakdownPage() {
  const [checks, setChecks] = useState<Record<BreakdownSafetyKey, boolean>>({
    safeLocation: false,
    vehicleProtected: false,
    needsEmergencyHelpChecked: false,
    officeAware: false,
  });

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [location, setLocation] = useState("");
  const [direction, setDirection] = useState("");
  const [duty, setDuty] = useState("318");
  const [vehicleId, setVehicleId] = useState("23301273");
  const [trailerNumber, setTrailerNumber] = useState("7338014");
  const [safeStatus, setSafeStatus] = useState<SafeStatus | "">("");
  const [breakdownFault, setBreakdownFault] = useState("");
  const [supportNeeded, setSupportNeeded] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function toggleCheck(key: BreakdownSafetyKey) {
    setChecks((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function addPhotos(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const nextPhotos = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      name: file.name,
    }));

    setPhotos((current) => [...current, ...nextPhotos]);
  }

  function removePhoto(id: string) {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  }

  function submitBreakdownReport() {
    setSubmitted(true);
  }

  const completedChecks = Object.values(checks).filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#001b3a]">
      <header className="bg-[#c4002f] px-4 py-5 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white text-base font-black">
              HGV
            </div>

            <div>
              <h1 className="text-xl font-black leading-none sm:text-2xl">
                Breakdown
              </h1>
              <p className="text-sm font-black leading-none sm:text-base">
                Driver PDA Concept
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
            <VehicleCheckTimer />

            <div className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-right">
              <p className="text-xs font-black uppercase tracking-[0.16em]">
                Driver
              </p>
              <p className="text-base font-black">Andrew Cannon</p>
            </div>

            <Link
              href="/internal/app-ideas"
              className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-black text-white no-underline transition hover:bg-white/20"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px] space-y-6">
          <section className="rounded-[28px] border-2 border-[#e2a100] bg-[#fff6dd] p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">
              Breakdown support request
            </p>

            <h2 className="mt-3 text-4xl font-black leading-tight text-[#001b3a] sm:text-5xl">
              Report a breakdown
            </h2>

            <p className="mt-4 max-w-[940px] text-base font-black leading-7 text-[#2f3b4a]">
              Use this mock screen to send a breakdown report to the transport office.
              Enter the location, direction if on a motorway, the breakdown fault,
              duty details and any photos that may help recovery support.
            </p>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.82fr_1.18fr]">
            <section className="rounded-[28px] border border-[#d0d7df] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">
                    Step 1
                  </p>
                  <h3 className="mt-2 text-3xl font-black text-[#001b3a]">
                    Driver safety check
                  </h3>
                </div>

                <div className="rounded-2xl bg-[#fff6dd] px-4 py-3 text-right">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8b6a1c]">
                    Complete
                  </p>
                  <p className="text-xl font-black text-[#001b3a]">
                    {completedChecks}/{safetyChecks.length}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {safetyChecks.map((check) => (
                  <button
                    key={check.key}
                    type="button"
                    onClick={() => toggleCheck(check.key)}
                    className={`w-full rounded-[18px] border p-4 text-left shadow-sm transition ${
                      checks[check.key]
                        ? "border-[#067a35] bg-[#d9f7e5]"
                        : "border-[#e2b24a] bg-[#fff1c2]"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${
                          checks[check.key] ? "bg-[#067a35]" : "bg-[#e2a100]"
                        }`}
                      >
                        {checks[check.key] ? "✓" : "!"}
                      </div>

                      <div>
                        <p className="text-base font-black text-[#001b3a]">
                          {check.label}
                        </p>
                        <p className="mt-1 text-sm font-bold leading-6 text-[#61748b]">
                          {check.help}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <section className="mt-5 rounded-[20px] border-2 border-[#e2a100] bg-[#fff6dd] p-4">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#a66900]">
                  Recovery reminder
                </p>
                <p className="mt-2 text-sm font-black leading-6 text-[#2f3b4a]">
                  If the vehicle is in a dangerous position, on a live lane, or the driver
                  feels unsafe, emergency support must be prioritised before completing the report.
                </p>
              </section>
            </section>

            <section className="rounded-[28px] border border-[#d0d7df] bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">
                Step 2
              </p>

              <h3 className="mt-2 text-3xl font-black text-[#001b3a]">
                Breakdown report form
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextInput
                  label="Breakdown location"
                  value={location}
                  onChange={setLocation}
                />
                <TextInput
                  label="Direction if on a motorway"
                  value={direction}
                  onChange={setDirection}
                />
                <TextInput label="Duty" value={duty} onChange={setDuty} />
                <TextInput label="Vehicle ID" value={vehicleId} onChange={setVehicleId} />
                <TextInput
                  label="Trailer number"
                  value={trailerNumber}
                  onChange={setTrailerNumber}
                />
              </div>

              <section className="mt-4 rounded-[20px] border border-[#d0d7df] bg-[#f8fafc] p-4">
                <p className="text-sm font-black text-[#001b3a]">Are you safe?</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  {safeStatusOptions.map((option) => {
                    const selected = safeStatus === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSafeStatus(option)}
                        className={`rounded-[14px] border px-4 py-3 text-sm font-black transition ${
                          selected
                            ? option === "Yes"
                              ? "border-[#067a35] bg-[#d9f7e5] text-[#067a35]"
                              : "border-[#c4002f] bg-[#fff0f2] text-[#c4002f]"
                            : "border-[#d0d7df] bg-white text-[#001b3a]"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </section>

              <TextArea
                label="Breakdown fault"
                value={breakdownFault}
                onChange={setBreakdownFault}
                placeholder="Describe the fault, warning lights, symptoms, whether the vehicle can move, and any immediate concerns."
              />

              <TextArea
                label="Additional support needed"
                value={supportNeeded}
                onChange={setSupportNeeded}
                placeholder="Add any extra information that may help the office, recovery team or planner."
              />

              <section className="mt-5 rounded-[22px] border border-[#d0d7df] bg-[#f8fafc] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">
                      Breakdown photos
                    </p>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#61748b]">
                      Add photos if needed to show the vehicle position, warning lights,
                      damage or anything useful for the transport office.
                    </p>
                  </div>

                  <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#c4002f] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
                    Add Photos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      capture="environment"
                      className="hidden"
                      onChange={(event) => addPhotos(event.target.files)}
                    />
                  </label>
                </div>

                {photos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-black text-[#001b3a]">
                      {photos.length} photo{photos.length === 1 ? "" : "s"} added
                    </p>

                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="flex items-center justify-between rounded-[14px] border border-[#d0d7df] bg-white px-4 py-3"
                      >
                        <span className="truncate text-sm font-bold text-[#001b3a]">
                          {photo.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="ml-3 text-lg font-black text-[#c4002f]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <button
                type="button"
                onClick={submitBreakdownReport}
                className="mt-6 w-full rounded-full bg-[#c4002f] px-5 py-5 text-sm font-black uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-[#920022]"
              >
                Send Breakdown Report To Office / CPC
              </button>

              {submitted && (
                <section className="mt-5 rounded-[20px] border-2 border-[#067a35] bg-[#d9f7e5] p-5">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-[#067a35]">
                    Breakdown report sent
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#064e3b]">
                    This confirms the breakdown details have been captured in the mockup.
                    In the live version this would send the details and any attached
                    photos to the transport office immediately.
                  </p>
                </section>
              )}
            </section>
          </section>
        </div>
      </section>
    </main>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#001b3a]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-[14px] border border-[#d0d7df] bg-white px-4 text-base font-bold text-[#001b3a] outline-none focus:border-[#c4002f]"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-black text-[#001b3a]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 min-h-[110px] w-full rounded-[14px] border border-[#d0d7df] bg-white px-4 py-3 text-base font-bold text-[#001b3a] outline-none focus:border-[#c4002f]"
      />
    </label>
  );
}

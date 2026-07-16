"use client";

import Link from "next/link";
import DriverName from "../../DriverName";
import { useEffect, useState } from "react";
import VehicleCheckTimer from "../../vehicle-checks/VehicleCheckTimer";

type SafetyCheckKey =
  | "driverSafe"
  | "othersSafe"
  | "vehicleSecure"
  | "policeContacted"
  | "insuranceContacted"
  | "officeNotified";

type PhotoItem = {
  id: string;
  name: string;
};

const safetyChecks: { key: SafetyCheckKey; label: string; help: string }[] = [
  {
    key: "driverSafe",
    label: "I am safe and away from immediate danger",
    help: "Move to a safe place before completing any report.",
  },
  {
    key: "othersSafe",
    label: "I have checked whether anyone else needs help",
    help: "If anyone is injured, emergency services must be contacted first.",
  },
  {
    key: "vehicleSecure",
    label: "Vehicle and scene made safe where possible",
    help: "Use hazard lights and warning equipment only when safe to do so.",
  },
  {
    key: "policeContacted",
    label: "Police / emergency services contacted if required",
    help: "Call 999 for injury, danger, blocked road, serious damage or unsafe situation.",
  },
  {
    key: "insuranceContacted",
    label: "RM Insurance",
    help: "Have you contacted %^$£$% Insurance.",
  },
  {
    key: "officeNotified",
    label: "Transport office / head office notified",
    help: "The office needs immediate awareness so the duty can be managed.",
  },
];

export default function RtcPage() {
  const [checks, setChecks] = useState<Record<SafetyCheckKey, boolean>>({
    driverSafe: false,
    othersSafe: false,
    vehicleSecure: false,
    policeContacted: false,
    insuranceContacted: false,
    officeNotified: false,
  });

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [location, setLocation] = useState("");
  const [gpsCoordinates, setGpsCoordinates] = useState("Fetching current GPS coordinates...");
  const [incidentTime, setIncidentTime] = useState("");
  const [injuries, setInjuries] = useState("");
  const [policeReference, setPoliceReference] = useState("");
  const [thirdPartyDetails, setThirdPartyDetails] = useState("");
  const [damageDetails, setDamageDetails] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGpsCoordinates("GPS coordinates unavailable on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        setGpsCoordinates(`${latitude}, ${longitude}`);
      },
      () => {
        setGpsCoordinates("GPS coordinates unavailable.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, []);

  function toggleCheck(key: SafetyCheckKey) {
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

  function submitMockReport() {
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
                RTC Report
              </h1>
              <p className="text-sm font-black leading-none sm:text-base">
                Road Traffic Collision Mockup
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
            <VehicleCheckTimer />

            <div className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-right">
              <p className="text-xs font-black uppercase tracking-[0.16em]">
                Driver
              </p>
              <p className="text-base font-black"><DriverName /></p>
            </div>

            <Link
              href="/internal/app-ideas"
              className="text-sm font-black text-white no-underline"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-7 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px] space-y-6">
          <section className="rounded-[28px] border-2 border-[#c4002f] bg-[#fff0f2] p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">
              Immediate safety first
            </p>

            <h2 className="mt-3 text-4xl font-black leading-tight text-[#001b3a] sm:text-5xl">
              Report RTC immediately
            </h2>

            <p className="mt-4 max-w-[920px] text-base font-black leading-7 text-[#222]">
              Before completing this mock form, the driver should make sure they
              are safe, check whether anyone else needs help, contact police or
              emergency services where required, and notify the transport office
              or head office as soon as possible.
            </p>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[28px] border border-[#d0d7df] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">
                    Step 1
                  </p>
                  <h3 className="mt-2 text-3xl font-black text-[#001b3a]">
                    Safety checklist
                  </h3>
                </div>

                <div className="rounded-2xl bg-[#f4f1ec] px-4 py-3 text-right">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#61748b]">
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

              <section className="mt-5 rounded-[20px] border-2 border-[#c4002f] bg-[#fff0f2] p-4">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#c4002f]">
                  Emergency reminder
                </p>
                <p className="mt-2 text-sm font-black leading-6 text-[#222]">
                  If anyone is injured, the road is blocked, there is danger to
                  the public, or the driver feels unsafe, emergency services
                  should be contacted before completing the office report.
                </p>
              </section>
            </section>

            <section className="rounded-[28px] border border-[#d0d7df] bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">
                Step 2
              </p>

              <h3 className="mt-2 text-3xl font-black text-[#001b3a]">
                RTC office report form
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextInput label="Incident location" value={location} onChange={setLocation} />
                <TextInput
                  label="GPS Coordinates"
                  value={gpsCoordinates}
                  onChange={setGpsCoordinates}
                />
                <TextInput label="Incident time" value={incidentTime} onChange={setIncidentTime} />
                <TextInput label="Injuries / immediate risk" value={injuries} onChange={setInjuries} />
                <TextInput label="Police reference if applicable" value={policeReference} onChange={setPoliceReference} />
              </div>

              <TextArea
                label="Third party details"
                value={thirdPartyDetails}
                onChange={setThirdPartyDetails}
                placeholder="Name, registration, company, phone number, insurer if available."
              />

              <TextArea
                label="Vehicle / trailer damage"
                value={damageDetails}
                onChange={setDamageDetails}
                placeholder="Record any visible damage to vehicle, trailer, load, site or third-party property."
              />

              <TextArea
                label="Incident description"
                value={description}
                onChange={setDescription}
                placeholder="Briefly explain what happened, including direction of travel, road conditions, witnesses and actions taken."
              />

              <section className="mt-5 rounded-[22px] border border-[#d0d7df] bg-[#f8fafc] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c4002f]">
                      Scene photos
                    </p>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#61748b]">
                      Add as many photos as needed. On a phone, this can open the
                      camera or photo picker depending on the device.
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
                onClick={submitMockReport}
                className="mt-6 w-full rounded-full bg-[#c4002f] px-5 py-5 text-sm font-black uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-[#920022]"
              >
                Send Mock RTC Report To Office
              </button>

              {submitted && (
                <section className="mt-5 rounded-[20px] border-2 border-[#067a35] bg-[#d9f7e5] p-5">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-[#067a35]">
                    Mock report sent to office
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#064e3b]">
                    This confirms the RTC report has been captured in the mockup.
                    In the live version this would send the form details and all
                    attached photos to the office immediately.
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

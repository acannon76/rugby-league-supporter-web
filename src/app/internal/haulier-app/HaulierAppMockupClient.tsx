"use client";

import { useMemo, useState } from "react";

type LegStatus = "To do" | "In Progress" | "Completed";
type ScreenView = "duty-details" | "origin-tasks";

type DutyLeg = {
  number: number;
  etd: string;
  eta: string;
  from: string;
  to: string;
};

const dutyLeg: DutyLeg = {
  number: 1,
  etd: "20:00",
  eta: "06:00",
  from: "NORTH WEST HUB",
  to: "NORTH WEST HUB",
};

const originTaskButtons = [
  "Empty",
  "Repat / Pre-Loaded",
  "Load",
  "Skip Leg",
  "Flex / As Directed",
];

export default function HaulierAppMockupClient() {
  const [screenView, setScreenView] = useState<ScreenView>("duty-details");
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleInput, setVehicleInput] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [legStatus, setLegStatus] = useState<LegStatus>("To do");

  const todayText = useMemo(() => getTodayDateText(), []);

  function openLegOne() {
    setShowVehicleModal(true);
  }

  function cancelVehicleModal() {
    setVehicleInput("");
    setShowVehicleModal(false);
  }

  function confirmVehicleNumber() {
    if (!vehicleInput.trim()) {
      return;
    }

    setVehicleNumber(vehicleInput.trim());
    setLegStatus("To do");
    setShowVehicleModal(false);
    setScreenView("origin-tasks");
  }

  function resetMockup() {
    setScreenView("duty-details");
    setShowVehicleModal(false);
    setVehicleInput("");
    setVehicleNumber("");
    setLegStatus("To do");
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#222]">
      <div className="mx-auto min-h-screen w-full max-w-[520px] bg-white shadow-2xl sm:my-6 sm:min-h-[900px] sm:overflow-hidden sm:rounded-[34px]">
        <PhoneStatusBar />

        {screenView === "duty-details" ? (
          <DutyDetailsScreen
            todayText={todayText}
            legStatus={legStatus}
            onOpenLeg={openLegOne}
            onReset={resetMockup}
          />
        ) : (
          <OriginTasksScreen
            todayText={todayText}
            vehicleNumber={vehicleNumber}
            legStatus={legStatus}
            onBack={() => setScreenView("duty-details")}
            onReset={resetMockup}
          />
        )}

        {showVehicleModal && (
          <VehicleNumberModal
            vehicleInput={vehicleInput}
            onChange={setVehicleInput}
            onCancel={cancelVehicleModal}
            onConfirm={confirmVehicleNumber}
          />
        )}
      </div>
    </main>
  );
}

function PhoneStatusBar() {
  return (
    <div className="flex h-[54px] items-center justify-between bg-[#d6001c] px-7 text-white">
      <div className="rounded-full bg-white/20 px-5 py-1 text-lg font-black">
        {getCurrentTimeText()}
      </div>

      <div className="flex items-center gap-2 text-lg font-black">
        <span>▮▮▮</span>
        <span>5G</span>
        <span className="rounded-md border-2 border-white px-2 text-sm">
          ▰
        </span>
      </div>
    </div>
  );
}

function AppHeader({
  title,
  left,
  onBack,
}: {
  title: string;
  left?: string;
  onBack?: () => void;
}) {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#e5e7eb] bg-white px-5">
      <div className="w-[90px]">
        {left && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-black text-[#d6001c]"
          >
            ‹ {left}
          </button>
        )}
      </div>

      <h1 className="text-xl font-black text-[#222]">{title}</h1>

      <div className="w-[90px] text-right text-3xl font-black text-[#333]">
        ⋮
      </div>
    </header>
  );
}

function DutyDetailsScreen({
  todayText,
  legStatus,
  onOpenLeg,
  onReset,
}: {
  todayText: string;
  legStatus: LegStatus;
  onOpenLeg: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Haulier Mock Up" />

      <section className="bg-white px-5 py-6">
        <section className="rounded-[18px] bg-[#f0f0f0] p-5">
          <h2 className="text-2xl font-black text-[#222]">Overview</h2>

          <p className="mt-6 text-lg font-bold text-[#333]">
            <span className="font-black">Driver name:</span> Andrew Cannon
          </p>

          <p className="mt-4 text-lg font-bold text-[#333]">
            <span className="font-black">Duty ID:</span> NWH254
          </p>
        </section>

        <h2 className="mt-10 text-2xl font-black text-[#222]">
          Duty details
        </h2>

        <p className="mt-8 text-xl font-bold text-[#333]">{todayText}</p>

        <div className="mt-4">
          <LegCard leg={dutyLeg} status={legStatus} onClick={onOpenLeg} />
        </div>

        <button
          type="button"
          onClick={onReset}
          className="mt-7 w-full rounded-[18px] bg-[#222] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white"
        >
          MOCKUP Reset
        </button>
      </section>
    </>
  );
}

function LegCard({
  leg,
  status,
  onClick,
}: {
  leg: DutyLeg;
  status: LegStatus;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[18px] border border-[#d0d0d0] bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="mb-5 flex items-center justify-between">
        <p className="text-lg font-black text-[#444]">Leg {leg.number}</p>

        <StatusPill status={status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-lg font-bold text-[#666]">
        <p>ETD: {leg.etd}</p>
        <p className="text-right">ETA: {leg.eta}</p>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_60px_1fr] items-center gap-3">
        <p className="text-lg font-black uppercase leading-tight text-[#333]">
          {leg.from}
        </p>

        <div className="flex items-center justify-center text-3xl font-black text-[#d6d6d6]">
          →
        </div>

        <p className="text-right text-lg font-black uppercase leading-tight text-[#333]">
          {leg.to}
        </p>
      </div>
    </button>
  );
}

function StatusPill({ status }: { status: LegStatus }) {
  const classes =
    status === "Completed"
      ? "bg-[#d9f7e5] text-[#067a35] border-[#067a35]"
      : status === "In Progress"
      ? "bg-[#fff4d6] text-[#9a6500] border-[#d89b00]"
      : "bg-[#bde8ff] text-[#125a7c] border-[#2290c5]";

  return (
    <span
      className={`rounded-full border-2 px-5 py-2 text-base font-black ${classes}`}
    >
      {status}
    </span>
  );
}

function VehicleNumberModal({
  vehicleInput,
  onChange,
  onCancel,
  onConfirm,
}: {
  vehicleInput: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const canConfirm = vehicleInput.trim().length > 0;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
      <section className="w-full max-w-[390px] bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black text-[#222]">
          Information Required
        </h2>

        <p className="mt-3 text-sm font-bold leading-6 text-[#444]">
          Please provide your vehicle registration or trailer number to proceed.
        </p>

        <label
          htmlFor="vehicle-number"
          className="mt-5 block text-sm font-black text-[#222]"
        >
          Vehicle Registration / Trailer Number
        </label>

        <input
          id="vehicle-number"
          value={vehicleInput}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter registration or trailer number"
          className="mt-2 w-full border-2 border-[#888] px-4 py-3 text-base font-bold text-[#222] outline-none focus:border-[#d6001c]"
        />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border-2 border-[#333] bg-white px-5 py-3 text-sm font-black text-[#333]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`rounded-full px-5 py-3 text-sm font-black text-white ${
              canConfirm ? "bg-[#d6001c]" : "bg-[#cccccc]"
            }`}
          >
            Confirm
          </button>
        </div>
      </section>
    </div>
  );
}

function OriginTasksScreen({
  todayText,
  vehicleNumber,
  legStatus,
  onBack,
  onReset,
}: {
  todayText: string;
  vehicleNumber: string;
  legStatus: LegStatus;
  onBack: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Origin Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <div className="rounded-lg bg-[#f0f0f0] px-4 py-3 text-sm font-black text-[#444]">
          Vehicle registration / trailer number: {vehicleNumber}
        </div>

        <p className="mt-6 text-lg font-bold text-[#333]">{todayText}</p>

        <div className="mt-3 rounded-[12px] border border-[#d0d0d0] bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base font-black text-[#444]">Leg 1</p>
            <StatusPill status={legStatus} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm font-bold text-[#666]">
            <p>ETD: {dutyLeg.etd}</p>
            <p className="text-right">ETA: {dutyLeg.eta}</p>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_50px_1fr] items-center gap-2">
            <p className="text-sm font-black uppercase leading-tight text-[#333]">
              {dutyLeg.from}
            </p>

            <div className="flex items-center justify-center text-2xl font-black text-[#d6d6d6]">
              →
            </div>

            <p className="text-right text-sm font-black uppercase leading-tight text-[#333]">
              {dutyLeg.to}
            </p>
          </div>
        </div>

        <h2 className="mt-7 text-xl font-black text-[#222]">
          Origin task details
        </h2>

        <div className="mt-4 space-y-3">
          {originTaskButtons.map((task) => (
            <button
              key={task}
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-[#d9d9d9] border-l-4 border-l-[#d6001c] bg-white px-4 py-4 text-left text-sm font-black text-[#222] shadow-sm"
            >
              <span>{task}</span>
              <span className="text-2xl font-black text-[#d6001c]">›</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onReset}
          className="mt-7 w-full rounded-[18px] bg-[#222] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white"
        >
          MOCKUP Reset
        </button>
      </section>
    </>
  );
}

function getTodayDateText() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

function getCurrentTimeText() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}
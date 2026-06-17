"use client";

import { useMemo, useState } from "react";

type LegStatus = "To do" | "In Progress" | "Completed";
type ScreenView =
  | "mockup-menu"
  | "duty-details"
  | "origin-tasks"
  | "duty-in-progress"
  | "duty-completed";

type DutyLeg = {
  number: number;
  etd: string;
  eta: string;
  from: string;
  to: string;
};

type MockupOption = {
  title: string;
  text: string;
  icon: string;
  active: boolean;
};

const dutyLeg: DutyLeg = {
  number: 1,
  etd: "20:00",
  eta: "06:00",
  from: "NORTH WEST HUB",
  to: "NORTH WEST HUB",
};

const mockupOptions: MockupOption[] = [
  {
    title: "Flex Mock Up",
    text: "Open the flex duty journey mock-up.",
    icon: "1",
    active: true,
  },
  {
    title: "Mockup 2",
    text: "Future mock-up option.",
    icon: "2",
    active: false,
  },
  {
    title: "Mockup 3",
    text: "Future mock-up option.",
    icon: "3",
    active: false,
  },
  {
    title: "Mockup 4",
    text: "Future mock-up option.",
    icon: "4",
    active: false,
  },
];

const originTaskButtons = [
  "Empty",
  "Repat / Pre-Loaded",
  "Load",
  "Skip Leg",
  "Flex / As Directed",
];

export default function HaulierAppMockupClient() {
  const [screenView, setScreenView] = useState<ScreenView>("mockup-menu");
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showDepartModal, setShowDepartModal] = useState(false);
  const [vehicleInput, setVehicleInput] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [legStatus, setLegStatus] = useState<LegStatus>("To do");

  const todayText = useMemo(() => getTodayDateText(), []);

  function openFlexMockup() {
    setScreenView("duty-details");
  }

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

  function openDepartConfirmation() {
    setShowDepartModal(true);
  }

  function cancelDepartConfirmation() {
    setShowDepartModal(false);
  }

  function departDepot() {
    setShowDepartModal(false);
    setLegStatus("In Progress");
    setScreenView("duty-in-progress");
  }

  function completeDuty() {
    setLegStatus("Completed");
    setScreenView("duty-completed");
  }

  function resetMockup() {
    setScreenView("mockup-menu");
    setShowVehicleModal(false);
    setShowDepartModal(false);
    setVehicleInput("");
    setVehicleNumber("");
    setLegStatus("To do");
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#222]">
      <div className="relative mx-auto min-h-screen w-full max-w-[520px] bg-white shadow-2xl sm:my-6 sm:min-h-[900px] sm:overflow-hidden sm:rounded-[34px]">
        <PhoneStatusBar />

        {screenView === "mockup-menu" && (
          <MockupMenuScreen onOpenFlexMockup={openFlexMockup} />
        )}

        {screenView === "duty-details" && (
          <DutyDetailsScreen
            todayText={todayText}
            legStatus={legStatus}
            onOpenLeg={openLegOne}
            onBack={() => setScreenView("mockup-menu")}
            onReset={resetMockup}
          />
        )}

        {screenView === "origin-tasks" && (
          <OriginTasksScreen
            todayText={todayText}
            vehicleNumber={vehicleNumber}
            legStatus={legStatus}
            onBack={() => setScreenView("duty-details")}
            onTaskSelected={openDepartConfirmation}
            onReset={resetMockup}
          />
        )}

        {screenView === "duty-in-progress" && (
          <DutyInProgressScreen
            todayText={todayText}
            vehicleNumber={vehicleNumber}
            legStatus={legStatus}
            onBack={() => setScreenView("origin-tasks")}
            onCompleteDuty={completeDuty}
            onReset={resetMockup}
          />
        )}

        {screenView === "duty-completed" && (
          <DutyCompletedScreen
            todayText={todayText}
            vehicleNumber={vehicleNumber}
            legStatus={legStatus}
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

        {showDepartModal && (
          <DepartDepotModal
            onCancel={cancelDepartConfirmation}
            onDepart={departDepot}
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

function MockupMenuScreen({
  onOpenFlexMockup,
}: {
  onOpenFlexMockup: () => void;
}) {
  return (
    <>
      <AppHeader title="Haulier Mock Up" />

      <section className="bg-white px-5 py-6">
        <section className="rounded-[18px] bg-[#f0f0f0] p-5">
          <h2 className="text-2xl font-black text-[#222]">Overview</h2>

          <p className="mt-5 text-base font-bold leading-6 text-[#333]">
            Select which haulier mock-up journey you want to run.
          </p>
        </section>

        <h2 className="mt-10 text-2xl font-black text-[#222]">
          Mock-up options
        </h2>

        <div className="mt-5 space-y-4">
          {mockupOptions.map((option) => (
            <MockupOptionButton
              key={option.title}
              option={option}
              onClick={
                option.title === "Flex Mock Up" ? onOpenFlexMockup : undefined
              }
            />
          ))}
        </div>
      </section>
    </>
  );
}

function MockupOptionButton({
  option,
  onClick,
}: {
  option: MockupOption;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!option.active}
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-[18px] border p-4 text-left shadow-sm transition ${
        option.active
          ? "border-[#d0d0d0] bg-white hover:-translate-y-1 hover:shadow-md"
          : "border-transparent bg-[#f0f0f0] opacity-60"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white ${
          option.active ? "bg-[#d6001c]" : "bg-[#999]"
        }`}
      >
        {option.icon}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-black leading-tight text-[#222]">
          {option.title}
        </h3>

        <p className="mt-1 text-sm font-bold leading-5 text-[#666]">
          {option.text}
        </p>
      </div>

      <div
        className={`text-3xl font-black ${
          option.active ? "text-[#d6001c]" : "text-[#aaa]"
        }`}
      >
        ›
      </div>
    </button>
  );
}

function DutyDetailsScreen({
  todayText,
  legStatus,
  onOpenLeg,
  onBack,
  onReset,
}: {
  todayText: string;
  legStatus: LegStatus;
  onOpenLeg: () => void;
  onBack: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Haulier Mock Up" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-6">
        <OverviewCard />

        <h2 className="mt-10 text-2xl font-black text-[#222]">
          Duty details
        </h2>

        <p className="mt-8 text-xl font-bold text-[#333]">{todayText}</p>

        <div className="mt-4">
          <LegCard leg={dutyLeg} status={legStatus} onClick={onOpenLeg} />
        </div>

        <MockResetButton onReset={onReset} />
      </section>
    </>
  );
}

function OverviewCard() {
  return (
    <section className="rounded-[18px] bg-[#f0f0f0] p-5">
      <h2 className="text-2xl font-black text-[#222]">Overview</h2>

      <p className="mt-6 text-lg font-bold text-[#333]">
        <span className="font-black">Driver name:</span> Andrew Cannon
      </p>

      <p className="mt-4 text-lg font-bold text-[#333]">
        <span className="font-black">Duty ID:</span> NWH254
      </p>
    </section>
  );
}

function LegCard({
  leg,
  status,
  onClick,
}: {
  leg: DutyLeg;
  status: LegStatus;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`w-full rounded-[18px] border border-[#d0d0d0] p-4 text-left shadow-sm transition ${
        onClick
          ? "bg-white hover:-translate-y-1 hover:shadow-md"
          : "bg-[#f4f4f4]"
      }`}
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
      ? "bg-[#ffe0d4] text-[#a23a00] border-[#e9581f]"
      : "bg-[#bde8ff] text-[#125a7c] border-[#2290c5]";

  const label = status === "Completed" ? "Done" : status;

  return (
    <span
      className={`rounded-full border-2 px-5 py-2 text-base font-black ${classes}`}
    >
      {label}
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
  onTaskSelected,
  onReset,
}: {
  todayText: string;
  vehicleNumber: string;
  legStatus: LegStatus;
  onBack: () => void;
  onTaskSelected: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Origin Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

        <p className="mt-6 text-lg font-bold text-[#333]">{todayText}</p>

        <div className="mt-3">
          <LegCard leg={dutyLeg} status={legStatus} />
        </div>

        <h2 className="mt-7 text-xl font-black text-[#222]">
          Origin task details
        </h2>

        <div className="mt-4 space-y-3">
          {originTaskButtons.map((task) => (
            <button
              key={task}
              type="button"
              onClick={task === "Flex / As Directed" ? onTaskSelected : undefined}
              className="flex w-full items-center justify-between rounded-lg border border-[#d9d9d9] border-l-4 border-l-[#d6001c] bg-white px-4 py-4 text-left text-sm font-black text-[#222] shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span>{task}</span>
              <span className="text-2xl font-black text-[#d6001c]">›</span>
            </button>
          ))}
        </div>

        <MockResetButton onReset={onReset} />
      </section>
    </>
  );
}

function DepartDepotModal({
  onCancel,
  onDepart,
}: {
  onCancel: () => void;
  onDepart: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
      <section className="w-full max-w-[430px] rounded-sm bg-white p-7 shadow-2xl">
        <h2 className="text-3xl font-black text-[#111]">Alert</h2>

        <p className="mt-5 text-xl font-bold leading-8 text-[#222]">
          Are you sure you are taking an empty vehicle and ready to depart from
          depot?
        </p>

        <div className="mt-7 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border-2 border-[#333] bg-white px-5 py-4 text-base font-black text-[#333]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onDepart}
            className="rounded-full bg-[#d6001c] px-5 py-4 text-base font-black text-white"
          >
            Depart Depot
          </button>
        </div>
      </section>
    </div>
  );
}

function DutyInProgressScreen({
  todayText,
  vehicleNumber,
  legStatus,
  onBack,
  onCompleteDuty,
  onReset,
}: {
  todayText: string;
  vehicleNumber: string;
  legStatus: LegStatus;
  onBack: () => void;
  onCompleteDuty: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Destination Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

        <p className="mt-6 text-lg font-bold text-[#333]">{todayText}</p>

        <div className="mt-3">
          <LegCard leg={dutyLeg} status={legStatus} />
        </div>

        <h2 className="mt-8 text-2xl font-black text-[#222]">
          Duty in progress
        </h2>

        <section className="mt-4 rounded-[18px] bg-[#f0f0f0] p-5">
          <p className="text-base font-bold leading-7 text-[#333]">
            Your duty is now active. Please keep the app open until the end of
            your shift so the duty can remain visible and available.
          </p>
        </section>

        <button
          type="button"
          onClick={onCompleteDuty}
          className="mt-6 w-full rounded-[18px] bg-[#d6001c] px-5 py-5 text-sm font-black uppercase tracking-[0.12em] text-white"
        >
          Completed Duty, End of Shift
        </button>

        <MockResetButton onReset={onReset} />
      </section>
    </>
  );
}

function DutyCompletedScreen({
  todayText,
  vehicleNumber,
  legStatus,
  onReset,
}: {
  todayText: string;
  vehicleNumber: string;
  legStatus: LegStatus;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Haulier Mock Up" />

      <section className="bg-white px-5 py-6">
        <OverviewCard />

        <h2 className="mt-10 text-2xl font-black text-[#222]">
          Duty details
        </h2>

        <p className="mt-8 text-xl font-bold text-[#333]">{todayText}</p>

        <div className="mt-4">
          <LegCard leg={dutyLeg} status={legStatus} />
        </div>

        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

        <section className="mt-6 rounded-[18px] bg-[#d9f7e5] p-5">
          <h2 className="text-2xl font-black text-[#067a35]">
            Duty completed
          </h2>

          <p className="mt-3 text-base font-bold leading-7 text-[#18243a]">
            Your duty has been completed. It is now OK to close the app
            completely.
          </p>
        </section>

        <MockResetButton onReset={onReset} />
      </section>
    </>
  );
}

function VehicleNumberBanner({ vehicleNumber }: { vehicleNumber: string }) {
  return (
    <div className="rounded-lg bg-[#f0f0f0] px-4 py-3 text-sm font-black text-[#444]">
      Vehicle registration number: {vehicleNumber}
    </div>
  );
}

function MockResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="mt-7 w-full rounded-[18px] bg-[#222] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white"
    >
      MOCKUP Reset
    </button>
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
"use client";

import { useMemo, useState } from "react";

type LegStatus = "To do" | "In Progress" | "Completed";
type MockupType = "flex" | "mockup2";

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
  mockupType?: MockupType;
};

const flexDutyLegs: DutyLeg[] = [
  {
    number: 1,
    etd: "20:00",
    eta: "06:00",
    from: "NORTH WEST HUB",
    to: "NORTH WEST HUB",
  },
];

const mockup2DutyLegs: DutyLeg[] = [
  {
    number: 1,
    etd: "20:00",
    eta: "20:50",
    from: "NORTH WEST HUB",
    to: "MANCHESTER MAIL CENTRE",
  },
  {
    number: 2,
    etd: "21:20",
    eta: "22:00",
    from: "MANCHESTER MAIL CENTRE",
    to: "NORTH WEST HUB",
  },
  {
    number: 3,
    etd: "23:00",
    eta: "23:50",
    from: "NORTH WEST HUB",
    to: "CHESTER MAIL CENTRE",
  },
  {
    number: 4,
    etd: "00:50",
    eta: "01:40",
    from: "CHESTER MAIL CENTRE",
    to: "NORTH WEST HUB",
  },
  {
    number: 5,
    etd: "03:30",
    eta: "04:20",
    from: "NORTH WEST HUB",
    to: "PRESTON MAIL CENTRE",
  },
  {
    number: 6,
    etd: "05:00",
    eta: "05:45",
    from: "PRESTON MAIL CENTRE",
    to: "NORTH WEST HUB",
  },
];

const mockupOptions: MockupOption[] = [
  {
    title: "Flex Mock Up",
    text: "Open the flex duty journey mock-up.",
    icon: "1",
    active: true,
    mockupType: "flex",
  },
  {
    title: "Mockup 2",
    text: "Open a six-leg duty completed in order.",
    icon: "2",
    active: true,
    mockupType: "mockup2",
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
  const [selectedMockup, setSelectedMockup] = useState<MockupType>("flex");
  const [selectedLegNumber, setSelectedLegNumber] = useState(1);

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showDepartModal, setShowDepartModal] = useState(false);

  const [vehicleInput, setVehicleInput] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [legStatuses, setLegStatuses] = useState<Record<number, LegStatus>>({
    1: "To do",
  });

  const todayText = useMemo(() => getTodayDateText(), []);

  const activeLegs =
    selectedMockup === "mockup2" ? mockup2DutyLegs : flexDutyLegs;

  const selectedLeg =
    activeLegs.find((leg) => leg.number === selectedLegNumber) || activeLegs[0];

  function openMockup(mockupType: MockupType) {
    setSelectedMockup(mockupType);
    setSelectedLegNumber(1);
    setVehicleInput("");
    setVehicleNumber("");
    setShowVehicleModal(false);
    setShowDepartModal(false);
    setScreenView("duty-details");

    const startingStatuses: Record<number, LegStatus> = {};
    const legs = mockupType === "mockup2" ? mockup2DutyLegs : flexDutyLegs;

    for (const leg of legs) {
      startingStatuses[leg.number] = "To do";
    }

    setLegStatuses(startingStatuses);
  }

  function getLegStatus(legNumber: number) {
    return legStatuses[legNumber] || "To do";
  }

  function getFirstAvailableLegNumber() {
    const firstNotCompleted = activeLegs.find(
      (leg) => getLegStatus(leg.number) !== "Completed"
    );

    return firstNotCompleted?.number || activeLegs[activeLegs.length - 1].number;
  }

  function canOpenLeg(legNumber: number) {
    return (
      legNumber === getFirstAvailableLegNumber() &&
      getLegStatus(legNumber) !== "Completed"
    );
  }

  function openLeg(legNumber: number) {
    if (!canOpenLeg(legNumber)) {
      return;
    }

    setSelectedLegNumber(legNumber);
    setVehicleInput(vehicleNumber);
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

    setLegStatuses((current) => ({
      ...current,
      [selectedLegNumber]: "In Progress",
    }));

    setScreenView("duty-in-progress");
  }

  function completeCurrentLeg() {
    const isFinalLeg =
      selectedLegNumber === activeLegs[activeLegs.length - 1].number;

    setLegStatuses((current) => ({
      ...current,
      [selectedLegNumber]: "Completed",
    }));

    if (isFinalLeg) {
      setScreenView("duty-completed");
      return;
    }

    setScreenView("duty-details");
  }

  function resetMockup() {
    setScreenView("mockup-menu");
    setSelectedMockup("flex");
    setSelectedLegNumber(1);
    setShowVehicleModal(false);
    setShowDepartModal(false);
    setVehicleInput("");
    setVehicleNumber("");
    setLegStatuses({
      1: "To do",
    });
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#222]">
      <div className="relative mx-auto min-h-screen w-full max-w-[520px] bg-white shadow-2xl sm:my-6 sm:min-h-[900px] sm:rounded-[34px]">
        <PhoneStatusBar />

        {screenView === "mockup-menu" && (
          <MockupMenuScreen onOpenMockup={openMockup} />
        )}

        {screenView === "duty-details" && (
          <DutyDetailsScreen
            todayText={todayText}
            mockupTitle={
              selectedMockup === "mockup2" ? "Mockup 2" : "Flex Mock Up"
            }
            legs={activeLegs}
            getLegStatus={getLegStatus}
            canOpenLeg={canOpenLeg}
            onOpenLeg={openLeg}
            onBack={() => setScreenView("mockup-menu")}
            onReset={resetMockup}
          />
        )}

        {screenView === "origin-tasks" && (
          <OriginTasksScreen
            todayText={todayText}
            vehicleNumber={vehicleNumber}
            leg={selectedLeg}
            legStatus={getLegStatus(selectedLegNumber)}
            onBack={() => setScreenView("duty-details")}
            onTaskSelected={openDepartConfirmation}
            onReset={resetMockup}
          />
        )}

        {screenView === "duty-in-progress" && (
          <DutyInProgressScreen
            todayText={todayText}
            vehicleNumber={vehicleNumber}
            leg={selectedLeg}
            legStatus={getLegStatus(selectedLegNumber)}
            hasMoreLegs={
              selectedLegNumber !== activeLegs[activeLegs.length - 1].number
            }
            onBack={() => setScreenView("origin-tasks")}
            onCompleteLeg={completeCurrentLeg}
            onReset={resetMockup}
          />
        )}

        {screenView === "duty-completed" && (
          <DutyCompletedScreen
            todayText={todayText}
            vehicleNumber={vehicleNumber}
            leg={selectedLeg}
            legStatus="Completed"
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
    <div className="flex h-[54px] items-center justify-between bg-[#d6001c] px-7 text-white sm:rounded-t-[34px]">
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
  onOpenMockup,
}: {
  onOpenMockup: (mockupType: MockupType) => void;
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
  option.active && option.mockupType
    ? () => onOpenMockup(option.mockupType as MockupType)
    : undefined
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
  mockupTitle,
  legs,
  getLegStatus,
  canOpenLeg,
  onOpenLeg,
  onBack,
  onReset,
}: {
  todayText: string;
  mockupTitle: string;
  legs: DutyLeg[];
  getLegStatus: (legNumber: number) => LegStatus;
  canOpenLeg: (legNumber: number) => boolean;
  onOpenLeg: (legNumber: number) => void;
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

        <p className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-[#d6001c]">
          {mockupTitle}
        </p>

        <p className="mt-6 text-xl font-bold text-[#333]">{todayText}</p>

        <div className="mt-4 space-y-4">
          {legs.map((leg) => (
            <LegCard
              key={leg.number}
              leg={leg}
              status={getLegStatus(leg.number)}
              canOpen={canOpenLeg(leg.number)}
              onClick={() => onOpenLeg(leg.number)}
            />
          ))}
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
  canOpen,
  onClick,
}: {
  leg: DutyLeg;
  status: LegStatus;
  canOpen?: boolean;
  onClick?: () => void;
}) {
  const isLocked = !canOpen && status !== "Completed";

  return (
    <button
      type="button"
      onClick={canOpen ? onClick : undefined}
      disabled={!canOpen}
      className={`w-full rounded-[18px] border border-[#d0d0d0] p-4 text-left shadow-sm transition ${
        canOpen
          ? "bg-white hover:-translate-y-1 hover:shadow-md"
          : status === "Completed"
          ? "bg-[#f0f0f0]"
          : "bg-[#f4f4f4] opacity-55"
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

      <div className="mt-6 grid grid-cols-[1fr_42px_1fr] items-center gap-2">
        <p className="text-base font-black uppercase leading-tight text-[#333] sm:text-lg">
          {leg.from}
        </p>

        <div className="flex items-center justify-center text-2xl font-black text-[#d6d6d6] sm:text-3xl">
          →
        </div>

        <p className="text-right text-base font-black uppercase leading-tight text-[#333] sm:text-lg">
          {leg.to}
        </p>
      </div>

      {isLocked && (
        <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#999]">
          Complete previous leg first
        </p>
      )}
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
  leg,
  legStatus,
  onBack,
  onTaskSelected,
  onReset,
}: {
  todayText: string;
  vehicleNumber: string;
  leg: DutyLeg;
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
          <LegCard leg={leg} status={legStatus} />
        </div>

        <h2 className="mt-7 text-xl font-black text-[#222]">
          Origin task details
        </h2>

        <div className="mt-4 space-y-3">
          {originTaskButtons.map((task) => (
            <button
              key={task}
              type="button"
              onClick={onTaskSelected}
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
          Are you ready to depart from depot and begin this leg?
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
  leg,
  legStatus,
  hasMoreLegs,
  onBack,
  onCompleteLeg,
  onReset,
}: {
  todayText: string;
  vehicleNumber: string;
  leg: DutyLeg;
  legStatus: LegStatus;
  hasMoreLegs: boolean;
  onBack: () => void;
  onCompleteLeg: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <AppHeader title="Destination Tasks" left="Back" onBack={onBack} />

      <section className="bg-white px-5 py-5">
        <VehicleNumberBanner vehicleNumber={vehicleNumber} />

        <p className="mt-6 text-lg font-bold text-[#333]">{todayText}</p>

        <div className="mt-3">
          <LegCard leg={leg} status={legStatus} />
        </div>

        <h2 className="mt-8 text-2xl font-black text-[#222]">
          Destination task details
        </h2>

        <button
          type="button"
          className="mt-4 flex w-full items-center justify-between rounded-lg border border-[#d9d9d9] border-l-4 border-l-[#d6001c] bg-white px-4 py-4 text-left text-sm font-black text-[#222] shadow-sm"
        >
          <span>Arrive into depot</span>
          <span className="text-2xl font-black text-[#d6001c]">›</span>
        </button>

        <section className="mt-6 rounded-[18px] bg-[#f0f0f0] p-5">
          <p className="text-base font-bold leading-7 text-[#333]">
            Your duty is now active. Please keep the app open until the end of
            your shift so the duty can remain visible and available.
          </p>
        </section>

        <button
          type="button"
          onClick={onCompleteLeg}
          className="mt-6 w-full rounded-[18px] bg-[#d6001c] px-5 py-5 text-sm font-black uppercase tracking-[0.12em] text-white"
        >
          {hasMoreLegs ? "Complete Leg" : "Completed Duty, End of Shift"}
        </button>

        <MockResetButton onReset={onReset} />
      </section>
    </>
  );
}

function DutyCompletedScreen({
  todayText,
  vehicleNumber,
  leg,
  legStatus,
  onReset,
}: {
  todayText: string;
  vehicleNumber: string;
  leg: DutyLeg;
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
          <LegCard leg={leg} status={legStatus} />
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